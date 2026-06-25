'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import type { Brand } from '@/lib/types'
import {
  Globe, Sparkles, Save, Loader2, Check,
  Palette, Target, MessageCircle, Hash,
  MousePointerClick, AlertTriangle, FileText,
  Search, TrendingUp
} from 'lucide-react'
import { isDemo } from '@/lib/demo'
import SeoScoreGrid from '@/components/SeoScoreGrid'
import LeadsCard from '@/components/LeadsCard'
import ClientsCard from '@/components/ClientsCard'

const TONI_VOCE = ['elegante','casual','ironico','professionale','emozionale','tecnico','luxury','friendly','sostenibile','istituzionale','ribelle','minimal']
const SETTORI = ['Fashion/Abbigliamento','Beauty/Cosmesi','Food/Bevande','Tech/Elettronica','Arredamento/Design','Fitness/Sport','Gioielli/Accessori','Libri/Editoria','Arte/Cultura','Servizi','Altro']

export default function BrandPage() {
  const [brand, setBrand] = useState<Partial<Brand> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const [url, setUrl] = useState('')
  const [includeSeo, setIncludeSeo] = useState(false)
  const [includeGeo, setIncludeGeo] = useState(false)
  const [includeLeads, setIncludeLeads] = useState(false)
  const [includeClients, setIncludeClients] = useState(false)
  const [seoResult, setSeoResult] = useState<Record<string, unknown> | null>(null)
  const [leadsResult, setLeadsResult] = useState<Record<string, unknown> | null>(null)
  const [clientsResult, setClientsResult] = useState<Record<string, unknown> | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const demo = isDemo()

  useEffect(() => {
    async function load() {
      if (demo) {
        setBrand({
          brand_name: 'SILKinCOM',
          sito_url: 'https://silkincom.com',
          settore: 'Fashion/Abbigliamento',
          tono_voce: 'elegante',
          target: 'Donna 25-45, professionista, attenta allo stile',
          promessa_brand: 'Eleganza accessibile per la donna moderna',
          colori_brand: 'Beige, Nero, Bianco, Oro',
          parole_da_usare: 'eleganza, stile, qualità, made in Italy, versatilità, charme, look, outfit',
          parole_da_evitare: 'saldi, cheap, low cost, cinese, fast fashion',
          emoji_policy: 'Pochi emoji, solo ✨🤍🖤. Mai più di 2 per post.',
          hashtag_base: '#silkincom #stileitaliano #elegance #fashion #madeinitaly',
          cta_base: 'Scopri la collezione',
          note_legali: '',
        })
        setUrl('https://silkincom.com')
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/data/brand')
        const data = res.ok ? await res.json() : null
        setBrand(data || { brand_name: '' })
        if (data?.sito_url) setUrl(data.sito_url)
      } catch { setBrand({ brand_name: '' }) }
      setLoading(false)
    }
    load()
  }, [demo])

  async function handleDiscovery() {
    if (!url.trim()) { setMsg({ type: 'err', text: 'Inserisci URL del sito' }); return }
    setDiscovering(true)
    setMsg(null)
    setSeoResult(null)
    setLeadsResult(null)
    setClientsResult(null)

    const runSeo = includeSeo || includeGeo

    if (demo) {
      await new Promise(r => setTimeout(r, 1500))
      setBrand(prev => ({
        ...prev,
        sito_url: url,
        settore: 'Fashion/Abbigliamento',
        tono_voce: 'elegante',
        target: 'Donna 25-45, professionista',
        promessa_brand: 'Eleganza accessibile',
        colori_brand: 'Beige, Nero, Bianco',
        parole_da_usare: 'eleganza, stile, qualità, made in Italy',
        parole_da_evitare: 'economico, low cost',
        emoji_policy: '✨🤍🖤 max 2 per post',
        hashtag_base: '#brand #stile #moda',
        cta_base: 'Scopri di più',
      }))
      if (runSeo) {
        setSeoResult({
          score_globale: 72,
          score_seo_tecnico: 85, score_seo_contenuti: 70, score_geo_ai_search: 58,
          score_social_coerenza: 80, score_eeat: 65,
          riepilogo: 'Brand solido su SEO tecnico. Da migliorare presenza GEO e segnali E-E-A-T.',
          punti_forti: ['Schema prodotto completo', 'Velocità sito ok'],
          punti_critici: ['Manca llms.txt', 'Bio TikTok senza link sito'],
        })
      }
      if (includeLeads) {
        setLeadsResult({
          email: ['info@silkincom.com', 'marketing@silkincom.com'],
          whatsapp: [{ numero: '+39 351 1234567', link: 'https://wa.me/393511234567', note: 'WhatsApp Business' }],
          telegram: [],
          telefono: ['+39 02 12345678'],
          social: [
            { piattaforma: 'Instagram', url: 'https://instagram.com/silkincom', note: 'Profilo verificato' },
            { piattaforma: 'Facebook', url: 'https://facebook.com/silkincom', note: '' },
            { piattaforma: 'TikTok', url: 'https://tiktok.com/@silkincom', note: '' },
          ],
          form_contatti_url: 'https://silkincom.com/contatti',
          indirizzo: 'Via della Moda 42, 20121 Milano MI',
          piva: '',
          orari: 'Lun-Ven 9-18',
          note_scraping: 'Demo',
        })
      }
      if (includeClients) {
        setClientsResult({
          icp: 'Donna 25-45, professionista, reddito medio-alto, attenta alle tendenze moda ma cerca qualità senza eccessi',
          buyer_personas: [
            { nome: 'Laura', eta: '32', ruolo: 'Marketing Manager', obiettivi: 'Vestirsi bene per ufficio e aperitivo senza cambiarsi', pain_point: 'Poco tempo per shopping, vuole qualità garantita', canali: 'Instagram, Pinterest, Google', citazione: '"Voglio un look che funzioni dalla scrivania allo spritz"' },
            { nome: 'Chiara', eta: '28', ruolo: 'Freelance Designer', obiettivi: 'Esprimere personalità attraverso lo stile', pain_point: 'Budget limitato ma non vuole fast fashion', canali: 'Instagram, TikTok, Depop', citazione: '"Cerco pezzi unici che durino nel tempo"' },
          ],
          mercato_target: { dimensione: '€2.5B in Italia', trend: '+8% YoY moda online', stagionalita: 'Picchi: marzo-aprile e settembre-ottobre' },
          competitor: [
            { nome: 'Zalando', sito: 'zalando.it', punto_forte: 'Reso gratuito, vasta scelta', punto_debole: 'Esperienza impersonale' },
            { nome: 'LuisaViaRoma', sito: 'luisaviaroma.com', punto_forte: 'Luxury positioning', punto_debole: 'Prezzi alti, target ristretto' },
            { nome: 'Yoox', sito: 'yoox.com', punto_forte: 'Outlet di lusso', punto_debole: 'Navigazione complessa' },
          ],
          opportunita_vendita: ['Bundle blazer + pantaloni', 'Sconto fedeltà dopo 3 acquisti', 'Collezione capsule a tempo limitato'],
          canali_acquisizione: ['Instagram Ads (carousel)', 'Google Shopping', 'Pinterest Shopping', 'Influencer micro (5-20K follower)'],
          lead_magnet: ['Guida stile stagionale PDF', 'Sconto 10% primo ordine via email', 'Quiz "Scopri il tuo stile"'],
          sales_pitch: 'SILKinCOM porta l\'eleganza italiana nel tuo quotidiano, con capi di qualità che ti fanno sentire sicura dalla mattina alla sera.',
          obiezioni: [{ obiezione: 'Prezzo più alto della fast fashion', risposta: 'I nostri capi durano 3x, costo per utilizzo inferiore. Qualità made in Italy garantita.' }],
          kpi_suggeriti: ['CAC < €15', 'LTV > €200', 'Conversion rate > 2.5%'],
        })
      }
      const parts = ['Profilo brand generato']
      if (runSeo) parts.push('+ SEO/GEO audit')
      if (includeLeads) parts.push('+ Contatti estratti')
      if (includeClients) parts.push('+ Marketing/Clienti')
      setMsg({ type: 'ok', text: parts.join(' ') + '. Rivedi e salva.' })
      setDiscovering(false)
      return
    }

    try {
      const aiModel = typeof window !== 'undefined' ? localStorage.getItem('ai_model') ?? 'claude-sonnet-4-6' : 'claude-sonnet-4-6'
      const orKey = typeof window !== 'undefined' ? localStorage.getItem('openrouter_key') ?? '' : ''

      const tasks: Promise<unknown>[] = [
        fetch('/api/generate/brand-discovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, model: aiModel, openrouter_key: orKey || undefined }),
        }).then(async res => {
          if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
          const discovered = await res.json()
          setBrand(prev => ({ ...prev, ...discovered, sito_url: url }))
          return 'brand'
        }),
      ]

      if (runSeo && typeof window !== 'undefined') {
        const cid = localStorage.getItem('active_cliente_id') || ''
        tasks.push(
          fetch('/api/generate/seo-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cliente_id: cid,
              sito_url: url,
              periodo: 'settimanale',
              model: aiModel,
              openrouter_key: orKey || undefined,
            }),
          }).then(async res => {
            if (!res.ok) {
              const err = await res.json()
              console.warn('SEO audit fallito (non bloccante):', err.error)
              return 'seo-skipped'
            }
            const result = await res.json()
            // Fetch latest audit
            const auditRes = await fetch('/api/data/seo-audit')
            if (auditRes.ok) {
              const audits = await auditRes.json()
              if (Array.isArray(audits) && audits.length > 0) {
                setSeoResult(audits[0])
              }
            }
            return 'seo'
          }).catch(err => {
            console.warn('SEO audit errore:', err)
            return 'seo-error'
          }),
        )
      }

      if (includeLeads) {
        tasks.push(
          fetch('/api/generate/scrape-contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, model: aiModel, openrouter_key: orKey || undefined }),
          }).then(async res => {
            if (!res.ok) {
              const err = await res.json()
              console.warn('Scraping contatti fallito:', err.error)
              return 'leads-skipped'
            }
            const data = await res.json()
            setLeadsResult(data)
            return 'leads'
          }).catch(err => {
            console.warn('Scraping contatti errore:', err)
            return 'leads-error'
          }),
        )
      }

      await Promise.all(tasks)
      const parts = ['Profilo generato']
      if (runSeo) parts.push('+ SEO/GEO audit')
      if (includeLeads) parts.push('+ Contatti estratti')
      setMsg({ type: 'ok', text: parts.join(' ') + '! Rivedi i campi e clicca Salva.' })
    } catch (e) {
      setMsg({ type: 'err', text: (e as Error).message })
    }
    setDiscovering(false)
  }

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    if (demo) {
      await new Promise(r => setTimeout(r, 800))
      setMsg({ type: 'ok', text: 'Profilo brand salvato (demo)' })
      setSaving(false); return
    }
    try {
      const res = await fetch('/api/data/brand', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
      setMsg({ type: 'ok', text: 'Profilo brand salvato con successo' })
    } catch (e) {
      setMsg({ type: 'err', text: (e as Error).message })
    }
    setSaving(false)
  }

  function update(field: string, value: string) {
    setBrand(prev => prev ? { ...prev, [field]: value } : null)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Profilo Brand</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Configura il DNA del brand. L&apos;AI userà questi dati per generare contenuti coerenti e differenziati.
        </p>
      </div>

      {/* AI Discovery */}
      <div className="card p-5 mb-6 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-violet-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">AI Brand Discovery</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Inserisci l&apos;URL del sito. L&apos;AI analizza tono, target, stile e compila il profilo automaticamente.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://esempio.com"
              className="input pl-9"
            />
          </div>
          <button onClick={handleDiscovery} disabled={discovering} className="btn-primary text-sm px-5">
            {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {discovering ? 'Analizzo...' : 'Analizza sito'}
          </button>
        </div>

        {/* Flags SEO / GEO */}
        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-violet-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSeo}
              onChange={e => setIncludeSeo(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-700">Includi SEO Audit</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">Tecnico + Contenuti</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeGeo}
              onChange={e => {
                setIncludeGeo(e.target.checked)
                if (e.target.checked) setIncludeSeo(true)
              }}
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-700">Includi GEO Audit</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">AI Search</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLeads}
              onChange={e => setIncludeLeads(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-700">Trova contatti</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">Email, WA, TG</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeClients}
              onChange={e => setIncludeClients(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <Target className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-700">Clienti & Marketing</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">ICP, Buyer Personas, Vendita</span>
          </label>
        </div>
      </div>

      {/* SEO/GEO Results */}
      <SeoScoreGrid result={seoResult} includeGeo={includeGeo} />

      {/* Lead Contacts */}
      <LeadsCard result={leadsResult} url={url} />

      <ClientsCard result={clientsResult} />

      {/* Brand form */}
      <div className="space-y-4">
        {/* Nome + Settore */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              Nome Brand
            </label>
            <input
              value={brand?.brand_name || ''}
              onChange={e => update('brand_name', e.target.value)}
              placeholder="Nome del brand"
              className="input mt-1"
            />
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              Settore
            </label>
            <select
              value={(brand as Record<string, string>)?.settore || ''}
              onChange={e => update('settore', e.target.value)}
              className="input mt-1"
            >
              <option value="">Seleziona settore...</option>
              {SETTORI.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Tono + Target */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
              Tono di voce
            </label>
            <select
              value={brand?.tono_voce || ''}
              onChange={e => update('tono_voce', e.target.value)}
              className="input mt-1"
            >
              <option value="">Seleziona tono...</option>
              {TONI_VOCE.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-gray-400" />
              Target Audience
            </label>
            <input
              value={brand?.target || ''}
              onChange={e => update('target', e.target.value)}
              placeholder="Es: Donna 25-45, professionista, attenta allo stile"
              className="input mt-1"
            />
          </div>
        </div>

        {/* Promessa + Colori */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gray-400" />
              Promessa Brand
            </label>
            <input
              value={brand?.promessa_brand || ''}
              onChange={e => update('promessa_brand', e.target.value)}
              placeholder="Es: Eleganza accessibile per la donna moderna"
              className="input mt-1"
            />
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-gray-400" />
              Colori Brand
            </label>
            <input
              value={brand?.colori_brand || ''}
              onChange={e => update('colori_brand', e.target.value)}
              placeholder="Es: Beige, Nero, Bianco, Oro"
              className="input mt-1"
            />
          </div>
        </div>

        {/* Parole da usare / evitare */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" />
              Parole da usare
            </label>
            <textarea
              value={brand?.parole_da_usare || ''}
              onChange={e => update('parole_da_usare', e.target.value)}
              placeholder="Parole chiave da includere, separate da virgola"
              className="input mt-1 h-20 resize-none"
            />
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              Parole da evitare
            </label>
            <textarea
              value={brand?.parole_da_evitare || ''}
              onChange={e => update('parole_da_evitare', e.target.value)}
              placeholder="Parole da NON usare, separate da virgola"
              className="input mt-1 h-20 resize-none"
            />
          </div>
        </div>

        {/* Emoji + Hashtag */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gray-400" />
              Emoji Policy
            </label>
            <input
              value={brand?.emoji_policy || ''}
              onChange={e => update('emoji_policy', e.target.value)}
              placeholder="Es: Solo ✨🤍🖤, max 2 per post"
              className="input mt-1"
            />
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              Hashtag base
            </label>
            <input
              value={brand?.hashtag_base || ''}
              onChange={e => update('hashtag_base', e.target.value)}
              placeholder="Es: #brand #stile #modaitaliana"
              className="input mt-1"
            />
          </div>
        </div>

        {/* CTA + Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-gray-400" />
              CTA Default
            </label>
            <input
              value={brand?.cta_base || ''}
              onChange={e => update('cta_base', e.target.value)}
              placeholder="Es: Scopri la collezione"
              className="input mt-1"
            />
          </div>
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              Note legali / Disclaimer
            </label>
            <input
              value={brand?.note_legali || ''}
              onChange={e => update('note_legali', e.target.value)}
              placeholder="Eventuali note legali obbligatorie"
              className="input mt-1"
            />
          </div>
        </div>

        {/* Message + Save */}
        {msg && (
          <div className={`p-3 rounded-lg text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {msg.text}
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full sm:w-auto text-sm px-8 py-3">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : 'Salva profilo brand'}
        </button>
      </div>
    </div>
  )
}
