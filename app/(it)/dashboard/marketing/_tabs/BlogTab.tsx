'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PenLine, Search, ListTree, FileText, HelpCircle, Tag, Loader2, CheckCircle2, Sparkles, AlertCircle, Image as ImageIcon, X, Globe2, ExternalLink, Save } from 'lucide-react'
import { useActiveClienteId } from '@/lib/tenant/client'
import { readAISettings, readApiError } from '@/lib/ai-client'
import { uploadAssets } from '@/lib/asset-upload'
import AIModelSelector from '@/components/AIModelSelector'
import BlogArticlesList from '@/components/BlogArticlesList'
import { publicBlogUrl } from '@/lib/blog-url'

// I 5 passi che l'AI esegue (illustrativi).
const PASSI = [
  { icon: Search,   t: 'Trovo le parole chiave', d: 'Cosa cercano le persone su Google e ChatGPT' },
  { icon: ListTree, t: 'Preparo la scaletta',     d: 'Titoli e struttura dell\'articolo' },
  { icon: FileText, t: 'Scrivo sezione per sezione', d: 'Ogni parte curata singolarmente' },
  { icon: HelpCircle, t: 'Aggiungo le FAQ',        d: 'Domande e risposte (ottime per le AI)' },
  { icon: Tag,      t: 'Ottimizzo titolo e meta', d: 'Per farti trovare sui motori di ricerca' },
]

export default function BlogPage() {
  const { clienteId, loading: loadingCliente } = useActiveClienteId()
  const [tema, setTema] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [cover, setCover] = useState('')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [clienteNome, setClienteNome] = useState('')
  const [blogDomain, setBlogDomain] = useState('')
  const [savingDomain, setSavingDomain] = useState(false)
  const [domainMessage, setDomainMessage] = useState('')

  useEffect(() => {
    if (!clienteId) return
    fetch('/api/data/clienti')
      .then(res => res.ok ? res.json() : [])
      .then(rows => {
        const cliente = (Array.isArray(rows) ? rows : []).find((row: { id?: string }) => row.id === clienteId)
        setClienteNome(cliente?.nome || cliente?.slug || '')
        setBlogDomain(cliente?.blog_domain || '')
      })
      .catch(() => {})
  }, [clienteId])

  async function saveBlogDomain() {
    if (!clienteId) return
    setSavingDomain(true); setDomainMessage('')
    try {
      const res = await fetch('/api/data/clienti', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clienteId, blog_domain: blogDomain.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Salvataggio non riuscito')
      if (typeof data.blog_domain === 'string') setBlogDomain(data.blog_domain)
      setDomainMessage('Destinazione Blog salvata.')
    } catch (e) {
      setDomainMessage((e as Error).message)
    } finally {
      setSavingDomain(false)
    }
  }

  async function uploadCover(file: File) {
    setUploadingCover(true); setError('')
    try {
      const fd = new FormData()
      fd.append('cliente_id', clienteId || '')
      fd.append('files', file)
      const d = await uploadAssets(fd)
      setCover(d.assets?.[0]?.url || '')
    } catch (e) { setError((e as Error).message || 'Errore upload immagine') }
    finally { setUploadingCover(false) }
  }

  async function genera() {
    if (!tema.trim()) { setError('Scrivi prima di cosa parla l\'articolo.'); return }
    setLoading(true); setError(''); setOk(false)
    try {
      const ai = readAISettings()
      const res = await fetch('/api/generate/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          tema: tema.trim(),
          model: ai.model,
          openrouter_key: ai.openrouter_key,
          media_urls: cover.trim() ? [cover.trim()] : undefined,
        }),
      })
      if (!res.ok) { setError(await readApiError(res, 'Generazione non riuscita')); return }
      setOk(true)
      setTema('')
      setCover('')
      setReloadKey(k => k + 1) // ricarica la lista articoli col nuovo pezzo
    } catch {
      setError('Errore di rete. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Intestazione */}
      <div className="mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <PenLine className="w-7 h-7 text-brand-600" /> Scrivi un articolo per il blog
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          L&apos;AI scrive un articolo SEO completo (title, meta, sezioni, FAQ) e lo salva in <strong>Blog</strong> pronto da revisionare.
        </p>
      </div>

      <div className="card p-4 md:p-5 mb-6 border border-brand-100 bg-brand-50/40">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-brand-700 font-bold flex items-center gap-1.5"><Globe2 className="w-4 h-4" /> Pagina pubblica</p>
            <h2 className="text-base font-bold text-gray-900 mt-1">Destinazione Blog {clienteNome ? `· ${clienteNome}` : ''}</h2>
            <p className="text-xs text-gray-500 mt-1">Incolla il dominio o l&apos;URL completo: protocollo e percorso <code>/blog</code> vengono riconosciuti automaticamente.</p>
          </div>
          {publicBlogUrl(blogDomain) && (
            <a href={publicBlogUrl(blogDomain)} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-2 px-3 justify-center whitespace-nowrap">
              Apri Blog <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            type="text"
            value={blogDomain}
            onChange={event => setBlogDomain(event.target.value)}
            placeholder="https://socialautomation.app/blog"
            className="input flex-1 font-mono text-sm"
            disabled={loadingCliente || savingDomain}
          />
          <button type="button" onClick={saveBlogDomain} disabled={!clienteId || savingDomain} className="btn-primary py-2 px-4 justify-center whitespace-nowrap disabled:opacity-50">
            {savingDomain ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salva destinazione
          </button>
        </div>
        {domainMessage && <p className={`text-xs mt-2 ${domainMessage.includes('salvata') ? 'text-green-700' : 'text-red-700'}`}>{domainMessage}</p>}
        {clienteId && <Link href={`/dashboard/clienti/${clienteId}`} className="inline-flex items-center gap-1 text-[11px] text-brand-700 font-semibold mt-2 hover:underline">Apri configurazione completa del cliente <ExternalLink className="w-3 h-3" /></Link>}
      </div>

      {/* Selettore modello (OpenRouter) */}
      <AIModelSelector task="blog-articolo" />

      {/* Come funziona — 5 passi */}
      <div className="card p-4 md:p-5 mb-6 bg-gradient-to-br from-white to-gray-50">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold mb-3">Cosa fa l&apos;AI</p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {PASSI.map((p) => (
            <div key={p.t} className="rounded-lg border border-gray-150 bg-white p-2.5 text-center">
              <div className="flex justify-center mb-1.5"><p.icon className="w-5 h-5 text-gray-400" /></div>
              <p className="text-[11px] font-semibold text-gray-800 leading-tight">{p.t}</p>
              <p className="text-[9px] text-gray-400 mt-0.5 leading-tight hidden sm:block">{p.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Input tema */}
      <div className="card p-4 md:p-5 mb-6">
        <label className="block text-sm font-semibold text-gray-800 mb-1">Di cosa parla l&apos;articolo?</label>
        <p className="text-xs text-gray-500 mb-2">Scrivi l&apos;argomento in parole tue. Esempio: &ldquo;come abbinare un foulard di seta in estate&rdquo;.</p>
        <textarea
          value={tema}
          onChange={e => setTema(e.target.value)}
          placeholder="Es: i vantaggi della seta di Como per le sciarpe di lusso"
          className="input w-full min-h-[80px] resize-y"
          disabled={loading}
        />

        {/* Immagine di copertina (opzionale) — upload o URL */}
        <div className="mt-3">
          <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" /> Immagine di copertina <span className="text-xs text-gray-400 font-normal">(opzionale)</span>
          </label>
          {cover ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="copertina" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
              <button onClick={() => setCover('')} className="btn-secondary text-xs py-1 px-2" disabled={loading}>
                <X className="w-3 h-3" /> Rimuovi
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <label className={`btn-secondary text-xs py-2 px-3 justify-center cursor-pointer ${uploadingCover ? 'opacity-50' : ''}`}>
                {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                {uploadingCover ? 'Carico…' : 'Carica immagine'}
                <input type="file" accept="image/*" className="hidden" disabled={loading || uploadingCover}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f) }} />
              </label>
              <input type="url" value={cover} onChange={e => setCover(e.target.value)} disabled={loading}
                placeholder="…oppure incolla un URL immagine" className="input flex-1 text-sm" />
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-1">Diventa la copertina dell&apos;articolo (in cima + nei dati SEO).</p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Tempo stimato: 1-3 minuti
          </span>
          <button onClick={genera} disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sto scrivendo…</> : <><PenLine className="w-4 h-4" /> Scrivi l&apos;articolo</>}
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{error}</span>
          </div>
        )}
        {ok && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
            <CheckCircle2 className="w-5 h-5" />
            <span>Articolo pronto e salvato in <strong>Blog</strong> (DA_APPROVARE). Lo trovi nella lista qui sotto.</span>
          </div>
        )}
        {loading && (
          <p className="text-[11px] text-gray-400 mt-2">Sto scrivendo l&apos;articolo. Non chiudere la pagina.</p>
        )}
      </div>

      {/* Libreria articoli: pubblica sul sito o esporta per Shopify/CMS */}
      <div className="mt-6">
        <BlogArticlesList reloadKey={reloadKey} />
      </div>
    </div>
  )
}
