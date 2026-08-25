// FONTE UNICA dei dati del Titolare del trattamento, usata da tutte le pagine
// legali (Privacy, Cookie, Termini, Trasparenza AI) e dal footer.
//
// I campi [DA COMPILARE] devono essere sostituiti con i dati reali dell'azienda.

export const TITOLARE = {
  // Ragione sociale completa (o nome e cognome se ditta individuale/freelance)
  ragioneSociale: 'Social Web Automation di Marco Dibenedetto',
  // Nome commerciale mostrato al pubblico
  brand: 'Social Web Automation',
  // Partita IVA
  partitaIva: '03786790133',
  // Codice fiscale (se diverso dalla P.IVA)
  codiceFiscale: 'DBNMRC80E04C933Q',
  // Sede legale completa
  sedeLegale: 'Via Giuseppe Verdi 2B, 22072 Cermenate (CO)',
  // Foro concordato per i rapporti non soggetti al foro inderogabile del consumatore
  foroCompetente: 'Como',
  // Email di contatto ordinaria
  email: 'swsdautomation@gmail.com',
  // PEC (posta certificata) — consigliata per le comunicazioni formali
  pec: 'dibenedetto.80@pec.it',
  // Telefono / WhatsApp business
  telefono: '+39 347 719 6603',
  // Nessuna iscrizione REA comunicata dal titolare.
  rea: null as string | null,
  // DPO non nominato, come confermato dal partner legale BCS.
  dpo: null as null | { nome: string; email: string },
  // Partner legale (erogazione consulenze)
  partnerLegale: 'Studio Legale BCS — Avv. Vincenzo Sapone (Cassazionista)',
  // URL pubblico del sito (per riferimenti nei documenti)
  sitoUrl: 'https://socialautomation.app',
  // Data ultimo aggiornamento dei documenti legali (aggiornare a ogni modifica)
  ultimoAggiornamento: '25 agosto 2026',
}

// Fornitori/sub-responsabili del trattamento realmente usati dalla piattaforma.
// Rilevanti per l'informativa privacy (art. 13 GDPR) e per i trasferimenti extra-UE.
export const SUB_RESPONSABILI = [
  { nome: 'Neon (database Postgres)', ruolo: 'Hosting database e dati account', extraUe: 'Possibile (USA) — SCC/Data Privacy Framework' },
  { nome: 'Render', ruolo: 'Hosting applicazione', extraUe: 'Possibile (USA) — SCC' },
  { nome: 'OpenRouter (instrada modelli di Google, OpenAI, Anthropic, Meta, ecc.)', ruolo: 'Generazione contenuti con AI', extraUe: 'Sì (USA) — SCC/DPF' },
  { nome: 'Blotato', ruolo: 'Pubblicazione programmata sui social', extraUe: 'Possibile — SCC' },
  { nome: 'Stripe', ruolo: 'Pagamenti e fatturazione abbonamenti', extraUe: 'Possibile (USA) — SCC/DPF, PCI-DSS' },
  { nome: 'Cloudflare R2 / Backblaze B2', ruolo: 'Archiviazione immagini', extraUe: 'Possibile — SCC' },
  { nome: 'Meta (Instagram/Facebook Graph API)', ruolo: 'Statistiche e pubblicazione (se collegato)', extraUe: 'Sì (USA) — SCC/DPF' },
  { nome: 'Resend', ruolo: 'Invio email transazionali (se attivo)', extraUe: 'Possibile (USA) — SCC' },
]
