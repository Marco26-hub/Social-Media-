'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Download, FileText, Loader2, Printer, ShieldCheck } from 'lucide-react'
import TurnstileWidget from '@/components/TurnstileWidget'
import styles from '@/app/recesso/recesso.module.css'

type CustomerType = 'consumatore' | 'impresa_professionista'
type FormStep = 'form' | 'confirm' | 'success'

type Receipt = {
  reference_code: string
  request_label: string
  submitted_at_label: string
  declaration_text: string
  payload_hash: string
  email_sent: boolean
  timeliness: string
}

const categories = [
  { value: 'servizi_digitali', label: 'Abbonamento o servizi digitali' },
  { value: 'sito_ecommerce', label: 'Sito web o e-commerce' },
  { value: 'consulenza_legale', label: 'Consulenza legale' },
  { value: 'altro', label: 'Altro contratto' },
]

const executionStatuses = [
  { value: 'non_iniziata', label: 'La prestazione non e iniziata' },
  { value: 'iniziata', label: 'La prestazione e iniziata ma non e conclusa' },
  { value: 'completata', label: 'La prestazione e stata completata' },
  { value: 'non_so', label: 'Non so indicarlo' },
]

export default function WithdrawalForm() {
  const [step, setStep] = useState<FormStep>('form')
  const [customerType, setCustomerType] = useState<CustomerType>('consumatore')
  const [category, setCategory] = useState('servizi_digitali')
  const [executionStatus, setExecutionStatus] = useState('non_so')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [emailConfirm, setEmailConfirm] = useState('')
  const [contractReference, setContractReference] = useState('')
  const [contractDate, setContractDate] = useState('')
  const [consumerDeclaration, setConsumerDeclaration] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  const categoryLabel = useMemo(() => categories.find(item => item.value === category)?.label || category, [category])
  const customerLabel = customerType === 'consumatore' ? 'Consumatore' : 'Impresa o professionista'
  const maxDate = new Date().toISOString().slice(0, 10)

  function review(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      setError('Gli indirizzi email non coincidono.')
      return
    }
    if (!privacyAccepted) {
      setError('Conferma la presa visione dell’informativa privacy.')
      return
    }
    if (customerType === 'consumatore' && !consumerDeclaration) {
      setError('Conferma di agire come consumatore.')
      return
    }
    setStep('confirm')
  }

  async function submit() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/recesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_type: customerType,
          contract_category: category,
          execution_status: executionStatus,
          full_name: fullName,
          email,
          contract_reference: contractReference,
          contract_date: contractDate,
          consumer_declaration: customerType === 'consumatore' && consumerDeclaration,
          turnstile_token: turnstileToken,
          website,
        }),
      })
      const data = await response.json() as Receipt & { error?: string }
      if (!response.ok) throw new Error(data.error || 'La dichiarazione non e stata registrata. Riprova.')
      setReceipt(data)
      setStep('success')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Errore di rete. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  function receiptText() {
    if (!receipt) return ''
    return [
      'SOCIAL AUTOMATION - RICEVUTA DICHIARAZIONE',
      '',
      `Codice pratica: ${receipt.reference_code}`,
      `Richiesta: ${receipt.request_label}`,
      `Nome: ${fullName}`,
      `Email di conferma: ${email}`,
      `Contratto: ${contractReference}`,
      `Categoria: ${categoryLabel}`,
      `Data e ora di trasmissione: ${receipt.submitted_at_label}`,
      '',
      'Contenuto trasmesso:',
      receipt.declaration_text,
      '',
      `Impronta SHA-256: ${receipt.payload_hash}`,
    ].join('\n')
  }

  function downloadReceipt() {
    if (!receipt) return
    const url = URL.createObjectURL(new Blob([receiptText()], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `ricevuta-${receipt.reference_code}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (step === 'success' && receipt) {
    return (
      <section className={styles.formCard} aria-labelledby="receipt-title">
        <div className={styles.successMark}><Check size={30} aria-hidden="true" /></div>
        <p className={styles.formEyebrow}>TRASMISSIONE COMPLETATA</p>
        <h2 id="receipt-title">Dichiarazione ricevuta.</h2>
        <p className={styles.formLead}>La trasmissione e stata registrata nel momento indicato. Conserva questa ricevuta.</p>

        <dl className={styles.receiptGrid}>
          <div><dt>Codice pratica</dt><dd>{receipt.reference_code}</dd></div>
          <div><dt>Data e ora</dt><dd>{receipt.submitted_at_label}</dd></div>
          <div><dt>Richiesta</dt><dd>{receipt.request_label}</dd></div>
          <div><dt>Contratto</dt><dd>{contractReference}</dd></div>
        </dl>
        <div className={styles.declaration}><strong>Contenuto trasmesso</strong><p>{receipt.declaration_text}</p></div>
        <p className={styles.hash}><span>SHA-256</span>{receipt.payload_hash}</p>
        {!receipt.email_sent && <p className={styles.warning}>La pratica e registrata, ma l&apos;email non risulta inviata. Scarica subito la ricevuta e contatta l&apos;assistenza indicando il codice pratica.</p>}
        <div className={styles.receiptActions}>
          <button type="button" onClick={downloadReceipt}><Download size={17} aria-hidden="true" /> Scarica ricevuta</button>
          <button type="button" className={styles.secondaryButton} onClick={() => window.print()}><Printer size={17} aria-hidden="true" /> Stampa</button>
        </div>
      </section>
    )
  }

  if (step === 'confirm') {
    return (
      <section className={styles.formCard} aria-labelledby="confirm-title">
        <div className={styles.stepHeader}><span>Passaggio 2 di 2</span><span>Conferma</span></div>
        <p className={styles.formEyebrow}><FileText size={15} aria-hidden="true" /> RIEPILOGO DELLA DICHIARAZIONE</p>
        <h2 id="confirm-title">Controlla prima di trasmettere.</h2>
        <p className={styles.formLead}>L&apos;invio registra la data e l&apos;ora. Non e necessario indicare una motivazione.</p>
        <dl className={styles.summaryGrid}>
          <div><dt>Categoria cliente</dt><dd>{customerLabel}</dd></div>
          <div><dt>Tipo di contratto</dt><dd>{categoryLabel}</dd></div>
          <div><dt>Nome</dt><dd>{fullName}</dd></div>
          <div><dt>Email di conferma</dt><dd>{email}</dd></div>
          <div><dt>Riferimento contratto</dt><dd>{contractReference}</dd></div>
          <div><dt>Data del contratto</dt><dd>{contractDate}</dd></div>
        </dl>
        <div className={styles.confirmNotice}>
          <ShieldCheck size={19} aria-hidden="true" />
          <p>{customerType === 'consumatore'
            ? 'Confermi la decisione inequivocabile di recedere dal contratto indicato.'
            : 'Confermi la richiesta di disdetta secondo le condizioni del contratto indicato.'}</p>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <TurnstileWidget onToken={setTurnstileToken} />
        <div className={styles.formActions}>
          <button type="button" className={styles.secondaryButton} onClick={() => setStep('form')} disabled={loading}><ArrowLeft size={17} aria-hidden="true" /> Modifica</button>
          <button type="button" className={styles.submitButton} onClick={submit} disabled={loading}>
            {loading ? <><Loader2 className={styles.spin} size={18} aria-hidden="true" /> Trasmissione...</> : customerType === 'consumatore' ? 'Conferma recesso' : 'Conferma disdetta'}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.formCard} aria-labelledby="form-title">
      <div className={styles.stepHeader}><span>Passaggio 1 di 2</span><span>Dati del contratto</span></div>
      <p className={styles.formEyebrow}>DICHIARAZIONE ONLINE</p>
      <h2 id="form-title">Identifica il contratto.</h2>
      <p className={styles.formLead}>Usa l&apos;email dell&apos;acquisto e un riferimento presente nell&apos;ordine, nella fattura o nella conferma contrattuale.</p>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <form onSubmit={review}>
        <fieldset className={styles.fieldset}>
          <legend>Hai acquistato come</legend>
          <div className={styles.segmented}>
            <button type="button" aria-pressed={customerType === 'consumatore'} className={customerType === 'consumatore' ? styles.segmentActive : ''} onClick={() => setCustomerType('consumatore')}>Consumatore</button>
            <button type="button" aria-pressed={customerType === 'impresa_professionista'} className={customerType === 'impresa_professionista' ? styles.segmentActive : ''} onClick={() => setCustomerType('impresa_professionista')}>Impresa o professionista</button>
          </div>
          <p className={styles.fieldHelp}>{customerType === 'consumatore'
            ? 'Persona fisica che ha acquistato per finalita estranee all’attivita professionale.'
            : 'Acquisto collegato all’attivita imprenditoriale, commerciale, artigianale o professionale.'}</p>
        </fieldset>

        <div className={styles.fieldRow}>
          <label>Categoria del contratto<select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label>Stato della prestazione<select value={executionStatus} onChange={event => setExecutionStatus(event.target.value)}>{executionStatuses.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </div>
        <label>Nome e cognome<input value={fullName} onChange={event => setFullName(event.target.value)} required minLength={3} maxLength={160} autoComplete="name" placeholder="Mario Rossi" /></label>
        <div className={styles.fieldRow}>
          <label>Email per la ricevuta<input type="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} autoComplete="email" placeholder="mario@email.it" /></label>
          <label>Ripeti email<input type="email" value={emailConfirm} onChange={event => setEmailConfirm(event.target.value)} required maxLength={254} autoComplete="email" placeholder="mario@email.it" /></label>
        </div>
        <div className={styles.fieldRow}>
          <label>Riferimento del contratto<input value={contractReference} onChange={event => setContractReference(event.target.value)} required minLength={3} maxLength={180} placeholder="Ordine, fattura o ID contratto" /></label>
          <label>Data di conclusione<input type="date" value={contractDate} onChange={event => setContractDate(event.target.value)} required max={maxDate} /></label>
        </div>

        {customerType === 'consumatore' && (
          <label className={styles.checkLabel}><input type="checkbox" checked={consumerDeclaration} onChange={event => setConsumerDeclaration(event.target.checked)} required /><span>Confermo di essere una persona fisica e di avere acquistato per scopi estranei alla mia attivita imprenditoriale o professionale.</span></label>
        )}
        <label className={styles.checkLabel}><input type="checkbox" checked={privacyAccepted} onChange={event => setPrivacyAccepted(event.target.checked)} required /><span>Ho letto l&apos;<a href="/privacy" target="_blank">informativa privacy</a> relativa al trattamento dei dati della richiesta.</span></label>

        <div aria-hidden="true" className={styles.honeypot}>
          <label>Sito web<input tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></label>
        </div>

        <button type="submit" className={styles.submitButton}>Verifica e continua <ArrowRight size={17} aria-hidden="true" /></button>
        <p className={styles.securityLine}><ShieldCheck size={15} aria-hidden="true" /> Nessuna cancellazione o rimborso viene eseguito automaticamente senza verifica della pratica.</p>
      </form>
    </section>
  )
}
