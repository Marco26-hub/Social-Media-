import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { notifyWithdrawalRequest, sendWithdrawalReceipt, type WithdrawalReceipt } from '@/lib/email'
import { TITOLARE } from '@/lib/legal-config'
import { verifyTurnstile } from '@/lib/turnstile'

export const dynamic = 'force-dynamic'

const FORM_VERSION = '2026-08-11-art54bis-v1'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CUSTOMER_TYPES = new Set(['consumatore', 'impresa_professionista'])
const CATEGORIES = new Set(['servizi_digitali', 'sito_ecommerce', 'consulenza_legale', 'altro'])
const EXECUTION_STATUSES = new Set(['non_iniziata', 'iniziata', 'completata', 'non_so'])

const categoryLabels: Record<string, string> = {
  servizi_digitali: 'Abbonamento o servizi digitali',
  sito_ecommerce: 'Sito web o e-commerce',
  consulenza_legale: 'Consulenza legale',
  altro: 'Altro contratto',
}

function clean(value: unknown, max: number): string {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max)
}

function submittedAtLabel(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(date)
}

function daysFromContract(contractDate: string, submittedAt: Date): number | null {
  const start = new Date(`${contractDate}T12:00:00.000Z`)
  if (Number.isNaN(start.getTime()) || start.getTime() > submittedAt.getTime()) return null
  return Math.floor((submittedAt.getTime() - start.getTime()) / 86_400_000)
}

function referenceCode(date: Date): string {
  const day = date.toISOString().slice(0, 10).replace(/-/g, '')
  return `SWA-REC-${day}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.toLowerCase().startsWith('application/json')) {
      return NextResponse.json({ error: 'Formato richiesta non supportato.' }, { status: 415 })
    }
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (Number.isFinite(contentLength) && contentLength > 32_768) {
      return NextResponse.json({ error: 'Richiesta troppo grande.' }, { status: 413 })
    }
    const fetchSite = request.headers.get('sec-fetch-site')
    if (fetchSite === 'cross-site') {
      return NextResponse.json({ error: 'Origine della richiesta non consentita.' }, { status: 403 })
    }
    const origin = request.headers.get('origin')
    if (origin) {
      try {
        if (new URL(origin).host !== new URL(request.url).host) {
          return NextResponse.json({ error: 'Origine della richiesta non consentita.' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Origine della richiesta non valida.' }, { status: 403 })
      }
    }

    const body = await request.json() as Record<string, unknown>
    if (clean(body.website, 100)) {
      return NextResponse.json({ error: 'Verifica anti-bot non superata.' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
    const turnstileToken = typeof body.turnstile_token === 'string' ? body.turnstile_token : ''
    if (!(await verifyTurnstile(turnstileToken, ip))) {
      return NextResponse.json({ error: 'Verifica anti-bot fallita. Riprova.' }, { status: 400 })
    }

    const customerType = clean(body.customer_type, 40)
    const contractCategory = clean(body.contract_category, 40)
    const executionStatus = clean(body.execution_status, 40)
    const fullName = clean(body.full_name, 160)
    const email = clean(body.email, 254).toLowerCase()
    const contractReference = clean(body.contract_reference, 180)
    const contractDate = clean(body.contract_date, 10)
    const consumerDeclaration = body.consumer_declaration === true

    if (!CUSTOMER_TYPES.has(customerType)) return NextResponse.json({ error: 'Categoria cliente non valida.' }, { status: 400 })
    if (!CATEGORIES.has(contractCategory)) return NextResponse.json({ error: 'Categoria contratto non valida.' }, { status: 400 })
    if (!EXECUTION_STATUSES.has(executionStatus)) return NextResponse.json({ error: 'Stato del servizio non valido.' }, { status: 400 })
    if (fullName.length < 3) return NextResponse.json({ error: 'Inserisci nome e cognome.' }, { status: 400 })
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Email non valida.' }, { status: 400 })
    if (contractReference.length < 3) return NextResponse.json({ error: 'Inserisci un riferimento del contratto.' }, { status: 400 })

    const submittedAt = new Date()
    const elapsedDays = daysFromContract(contractDate, submittedAt)
    if (elapsedDays === null) return NextResponse.json({ error: 'Data del contratto non valida.' }, { status: 400 })
    if (customerType === 'consumatore' && !consumerDeclaration) {
      return NextResponse.json({ error: 'Conferma di agire come consumatore.' }, { status: 400 })
    }
    if (!dbReady()) {
      return NextResponse.json({ error: 'Servizio temporaneamente non disponibile. La dichiarazione non e stata registrata: contattaci via email o PEC.' }, { status: 503 })
    }

    try {
      const recentRows = await q(
        `SELECT count(*)::int AS count
         FROM recessi
         WHERE lower(email) = $1
           AND contract_reference = $2
           AND submitted_at > now() - interval '15 minutes'`,
        [email, contractReference],
      )
      if (Number(recentRows[0]?.count || 0) >= 3) {
        return NextResponse.json(
          { error: 'Sono gia state trasmesse piu dichiarazioni recenti per questo contratto. Attendi 15 minuti o contatta l’assistenza.' },
          { status: 429, headers: { 'Retry-After': '900' } },
        )
      }
    } catch (error) {
      if ((error as { code?: string })?.code !== '42P01') throw error
    }

    const isConsumer = customerType === 'consumatore'
    const requestType = isConsumer ? 'recesso_consumatore' : 'disdetta_professionale'
    const requestLabel = isConsumer ? 'Recesso dal contratto' : 'Disdetta contrattuale'
    const timeliness = isConsumer
      ? elapsedDays <= 14 ? 'entro_14_giorni' : 'verifica_necessaria'
      : 'non_applicabile'
    const ref = referenceCode(submittedAt)
    const declarationText = isConsumer
      ? `Io sottoscritto/a ${fullName} comunico in modo inequivocabile la decisione di recedere dal contratto ${contractReference}, categoria ${categoryLabels[contractCategory]}, concluso il ${contractDate}, ai sensi degli articoli 52 e 54-bis del Codice del consumo.`
      : `Io sottoscritto/a ${fullName} comunico la disdetta del contratto ${contractReference}, categoria ${categoryLabels[contractCategory]}, concluso il ${contractDate}, secondo le condizioni contrattuali applicabili.`
    const payloadHash = crypto.createHash('sha256').update([
      FORM_VERSION,
      ref,
      requestType,
      fullName,
      email,
      contractReference,
      contractDate,
      declarationText,
      submittedAt.toISOString(),
    ].join('|')).digest('hex')

    try {
      await q(
        `INSERT INTO recessi (
           reference_code, request_type, customer_type, contract_category,
           execution_status, full_name, email, contract_reference, contract_date,
           declaration_text, consumer_declaration, timeliness, status,
           payload_hash, form_version, submitted_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'ricevuta',$13,$14,$15)`,
        [ref, requestType, customerType, contractCategory, executionStatus, fullName, email,
          contractReference, contractDate, declarationText, consumerDeclaration, timeliness,
          payloadHash, FORM_VERSION, submittedAt],
      )
    } catch (error) {
      if ((error as { code?: string })?.code === '42P01') {
        return NextResponse.json({ error: 'Archivio recesso non inizializzato. La dichiarazione non e stata registrata: contattaci via email o PEC.' }, { status: 503 })
      }
      throw error
    }

    const receipt: WithdrawalReceipt = {
      referenceCode: ref,
      requestLabel,
      fullName,
      email,
      contractReference,
      contractCategory: categoryLabels[contractCategory],
      declarationText,
      submittedAtLabel: submittedAtLabel(submittedAt),
      payloadHash,
    }
    const emailResult = await sendWithdrawalReceipt(receipt)
    const receiptStatus = emailResult.sent ? 'sent' : emailResult.skipped ? 'skipped' : 'failed'
    await q(
      `UPDATE recessi
       SET receipt_status = $2, receipt_email_id = $3,
           receipt_sent_at = CASE WHEN $2 = 'sent' THEN now() ELSE NULL END,
           updated_at = now()
       WHERE reference_code = $1`,
      [ref, receiptStatus, emailResult.id || null],
    )

    const internalEmail = process.env.AGENCY_NOTIFY_EMAIL?.trim() || TITOLARE.email
    await notifyWithdrawalRequest(internalEmail, receipt).catch(() => {})

    return NextResponse.json({
      ok: true,
      reference_code: ref,
      request_label: requestLabel,
      submitted_at: submittedAt.toISOString(),
      submitted_at_label: receipt.submittedAtLabel,
      declaration_text: declarationText,
      payload_hash: payloadHash,
      email_sent: emailResult.sent,
      timeliness,
    })
  } catch (error) {
    return apiError(error)
  }
}
