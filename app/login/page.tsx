'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogIn, ShieldCheck } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './login.module.css'

type AccessHint = {
  enabled: boolean
  mode: 'demo' | 'production-hint'
  username?: string
  password?: string
  note?: string
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [accessHint, setAccessHint] = useState<AccessHint | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkDemo() {
      try {
        const res = await fetch('/api/system/health')
        const data = await res.json()
        const hintRes = await fetch('/api/system/access')
        const hint = hintRes.ok ? await hintRes.json() as AccessHint : null

        if (hint?.enabled) {
          setAccessHint(hint)
          if (hint.username) setEmail(hint.username)
          if (hint.password) setPassword(hint.password)
        }

        if (data.mode === 'demo') {
          setIsDemo(true)
          setLoading(true)
          const result = await signIn('credentials', {
            email: hint?.username || 'admin',
            password: hint?.password || '1234567',
            redirect: false,
          })
          if (result?.ok) {
            router.push('/dashboard/clienti')
          } else {
            setLoading(false)
          }
        }
      } catch {
        // In modalità normale viene mostrato il form di accesso.
      }
    }

    checkDemo()
  }, [router])

  function fillAccessHint() {
    if (!accessHint?.username || !accessHint?.password) return
    setEmail(accessHint.username)
    setPassword(accessHint.password)
    setError('')
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const response = await signIn('credentials', { email, password, redirect: false })

    if (response?.error) {
      const loginError = response.error || ''
      if (/IN_ATTESA/.test(loginError)) {
        setError('Account in attesa di attivazione. Ti avvisiamo via email appena è pronto.')
      } else if (/RIFIUTATO|NON_ATTIVO/.test(loginError)) {
        setError('Questo account non è attivo. Contattaci per assistenza.')
      } else {
        setError('Credenziali non valide')
      }
      setLoading(false)
      return
    }

    router.push('/dashboard/clienti')
  }

  if (isDemo && loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingState}>
          <span className={styles.logoShell}>
            <Image src="/brand/swa-logo-official.png" alt="SWA" width={118} height={55} priority />
          </span>
          <span className={styles.loader} aria-hidden="true" />
          <h1>Accesso demo in corso</h1>
          <p>Stiamo preparando l’area operativa Social Automation.</p>
          <div className={styles.demoCredentials}>
            <strong>Accesso Admin Demo</strong>
            <span>Utente: <b>{accessHint?.username || 'admin'}</b></span>
            <span>Password: <b>{accessHint?.password || '1234567'}</b></span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Social Automation, torna alla home">
          <span className={styles.logoShell}>
            <Image src="/brand/swa-logo-official.png" alt="SWA" width={118} height={55} priority />
          </span>
          <span>
            <strong>Social Automation</strong>
            <small>Area riservata</small>
          </span>
        </Link>
        <div className={styles.headerActions}>
          <ThemeToggle />
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} aria-hidden="true" />
            Torna al sito
          </Link>
        </div>
      </header>

      <section className={styles.accessLayout} aria-labelledby="login-title">
        <div className={styles.intro}>
          <p className={styles.eyebrow}><LockKeyhole size={16} aria-hidden="true" /> Accesso protetto</p>
          <h1>Il tuo lavoro digitale, in un unico spazio.</h1>
          <p>Entra nell’area operativa per consultare attività, contenuti e risultati del tuo piano.</p>
          <div className={styles.securityNote}>
            <ShieldCheck size={20} aria-hidden="true" />
            <span>
              <strong>Connessione riservata</strong>
              <small>Le credenziali sono gestite tramite accesso autenticato.</small>
            </span>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formHeading}>
            <span className={styles.formIcon}><LogIn size={20} aria-hidden="true" /></span>
            <div>
              <h2 id="login-title">Accedi all’area cliente</h2>
              <p>Inserisci le credenziali associate al tuo account.</p>
            </div>
          </div>

          {(isDemo || accessHint) && (
            <div className={styles.accessHint}>
              <div>
                <div>
                  <strong>Accesso Admin</strong>
                  {accessHint?.username && accessHint?.password && (
                    <p>
                      Utente: <b>{accessHint.username}</b>
                      {' '}· Password: <b>{accessHint.password}</b>
                    </p>
                  )}
                  {accessHint?.note && <p>{accessHint.note}</p>}
                </div>
                {accessHint?.username && accessHint?.password && (
                  <button type="button" onClick={fillAccessHint}>Compila</button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="login-email">Email o nome utente</label>
              <input
                id="login-email"
                type="text"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="nome@azienda.it"
                required
                autoComplete="username"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="login-password">Password</label>
              <span className={styles.passwordField}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Inserisci la password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  title={showPassword ? 'Nascondi password' : 'Mostra password'}
                  onClick={() => setShowPassword(value => !value)}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </span>
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button type="submit" className={styles.submit} disabled={loading}>
              <LogIn size={18} aria-hidden="true" />
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          <p className={styles.support}>
            Problemi con l’accesso? <a href="mailto:swsdautomation@gmail.com">Contatta l’assistenza</a>
          </p>
        </div>
      </section>
    </main>
  )
}
