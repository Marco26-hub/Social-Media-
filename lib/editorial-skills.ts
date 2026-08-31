import type { PackagePeriod, PackagePeriodMix, PackageSpec } from '@/lib/packages'

export type EditorialSkillId = 'standard' | 'swa-package-visual'

export function resolveEditorialSkill(pkg: PackageSpec | null): EditorialSkillId {
  return pkg ? 'swa-package-visual' : 'standard'
}

const PHASES = ['ATTENZIONE', 'FIDUCIA', 'SCELTA', 'AZIONE'] as const
const GRID_PATTERNS = [
  ['azione', 'dettaglio', 'volto', 'ambiente', 'testo breve', 'gruppo'],
  ['volto', 'ambiente', 'dettaglio', 'azione', 'gruppo', 'testo breve'],
  ['dettaglio', 'gruppo', 'azione', 'volto', 'ambiente', 'testo breve'],
  ['ambiente', 'azione', 'volto', 'dettaglio', 'testo breve', 'gruppo'],
] as const

function packageDirection(pkg: PackageSpec): string {
  if (pkg.id === 'crescita') {
    return `
- Livello CRESCITA: alterna contenuti autorevoli, UGC credibile, prove, obiezioni, conversione e community.
- Prevedi almeno due ipotesi creative testabili per i contenuti ad alto impatto.
- Adatta hook e CTA al canale senza duplicare meccanicamente lo stesso post sui ${pkg.social} social.
- Usa la maggiore frequenza per costruire serie riconoscibili, non per ripetere lo stesso visual.`
  }
  return `
- Livello PRESENZA: privilegia riconoscibilita, costanza, qualita percepita e una CTA semplice.
- Ogni contenuto deve essere producibile con risorse contenute e riutilizzabile sui ${pkg.social} social senza sembrare generico.
- Concentrati su una sola promessa mensile e su una keyword/CTA stabile.`
}

export function buildEditorialSkillContext(args: {
  skill: EditorialSkillId
  pkg: PackageSpec | null
  piano: PackagePeriodMix | null
  periodo: PackagePeriod
  chunkIndex: number
  totalChunks: number
  target: number
}): string {
  const { skill, pkg, piano, periodo, chunkIndex, target } = args
  if (skill !== 'swa-package-visual' || !pkg || !piano) return ''

  const phase = periodo === 'mensile'
    ? PHASES[Math.min(chunkIndex, PHASES.length - 1)]
    : 'ATTENZIONE + FIDUCIA + AZIONE'
  const roles = GRID_PATTERNS[chunkIndex % GRID_PATTERNS.length]
    .slice(0, Math.max(1, target))

  return `

SKILL EDITORIALE SWA — PIANO + IMMAGINI (${pkg.nome.toUpperCase()}), VINCOLANTE:
- PROCESSO AGENZIA SWA, con gate obbligatori: 1) brief, offerta e input; 2) ricerca trend/competitor recente; 3) strategia, funnel e calendario; 4) direzione artistica, grid blueprint e storyboard; 5) produzione separata per formato/piattaforma; 6) QA copy, visual, audio, licenze e conversione; 7) approvazione; 8) distribuzione, report e ottimizzazione. Non saltare un gate e registra in production_cycle_stage quello raggiunto.
- Se mancano offerta, prova, CTA/destinazione, asset, logo, licenza audio o dati essenziali, compila missing_inputs e mantieni il contenuto in revisione: mai colmare i vuoti inventando informazioni.
- Fase strategica del blocco: ${phase}.
- Ordina gli item cronologicamente e assegna in sequenza questi ruoli visuali alle cover: ${roles.join(' → ')}.
- La griglia Instagram e un unico progetto: alterna volti, dettagli, ambienti e azione; evita tre cover consecutive con stesso soggetto, luminosita, colore dominante o peso tipografico.
- Mantieni un color grading coerente e una palette di brand calibrata, ma varia distanza, movimento e quantita di testo.
- Definisci prima una cornice visiva mensile stabile: palette primaria e accenti, color grading, famiglia tipografica, posizione/dimensione logo, safe area, trattamento cover e intensita del copy. Ogni contenuto deve rispettarla anche quando cambia format o trend.
- Valuta ogni cover insieme alle due precedenti e alle due successive. In production_notes registra "PROFILE_COHERENCE: PASS" oppure "PROFILE_COHERENCE: REVISE <motivo>"; un item REVISE non e pronto per approvazione.
  - Usa sempre una meccanica visuale o motion recente e pertinente per ogni contenuto: pattern interrupt, transizione, camera movement, ritmo, typography motion o interazione nativa. Per Reel e Story specifica l'animazione scena per scena; per Post e Caroselli definisci profondita, sequenza e micro-movimento utile alla successiva versione video.
  - STANDARD CINEMATIC QUALITY, obbligatorio: movimento di camera credibile e controllato, profondita su piu piani, luce motivata, continuita cromatica, transizioni raccordate a gesto/oggetto/asse, motion blur naturale, typography essenziale e sound design sincronizzato. Ogni effetto deve sostenere hook, prova o CTA; vietati preset casuali, zoom ripetuti, glitch gratuiti, filtri eccessivi, morphing anatomico e combinazioni che sembrano template amatoriali.
  - In production_notes registra "CINEMATIC_GATE: PASS" oppure "CINEMATIC_GATE: REVISE <problema>" valutando realismo, regia, continuita, leggibilita, audio e frame finale. Un contenuto REVISE non puo passare in approvazione.
- I trend non sono decorazione: selezionali da ricerca aggiornata, adattali alla nicchia e al tono del brand, evita effetti gia saturi o fuori contesto e non riutilizzare la stessa combinazione in tre contenuti consecutivi. Scarta qualsiasi trend che rompa la cornice visiva del profilo.
- In production_notes registra "TREND_EFFECT: <effetto o animazione>" e "TREND_CHECK: <data/fonte da verificare>". Se non esiste un trend verificato, usa una regia contemporanea sobria e segnala la verifica necessaria invece di inventare un effetto virale.
- Tutti i visual devono proteggere soggetto, logo e hook nel ritaglio profilo 3:4. Cover e ultimo frame Reel completi e luminosi: vietati nero, bande, vuoti e frame di transizione.
- Vietati numeri grafici di slide/scena, collage usati al posto di file separati, testo AI illeggibile e dettagli tecnici/anatomici non plausibili.
- Per ogni item compila idea_visual e creative_brief descrivendo soggetto, azione, ambiente, luce, inquadratura, palette, spazio copy, continuita con le cover vicine, elementi vietati e controllo realismo.
- Per Reel/Short/Video genera 5 scene con ruoli hook, tensione, prova, payoff e CTA/loop. Per carousel genera almeno 5 slide separate con cover, problema, sviluppo/prova, payoff e CTA. Per Story genera 3 frame: apertura, sviluppo e risoluzione/CTA, senza interazioni simulate.
- Inserisci in production_notes la stringa "GRID_ROLE: <ruolo assegnato>" e i controlli da eseguire prima della pubblicazione.
- Ogni contenuto deve avere un solo lavoro commerciale e una sola micro-azione: fermare, far capire, dimostrare, sciogliere un'obiezione, ottenere salvataggio/DM/click o chiudere la scelta. Collega hook, prova e CTA allo stesso lavoro.
- Costruisci una catena di conversione completa nel blocco: problema concreto -> desiderio -> prova -> obiezione -> offerta -> urgenza reale -> CTA. Non inventare sconti, scadenze, recensioni o risultati; inseriscili in missing_inputs quando non sono disponibili.
- Per ogni item compila audience_segment, funnel_stage, primary_message, proof_points, performance_hypothesis, kpi_target ed expected_outcome. La CTA deve indicare azione e destinazione precise; quando esiste un link, predisponi UTM coerenti per canale, campagna e contenuto.
- Prevedi una variante A/B dell'hook nei contenuti di acquisizione e una next_iteration_actions basata su watch time/completamento, condivisioni, salvataggi, visite profilo, DM, click e vendite attribuite.
- Non promettere viralita: formula un'ipotesi misurabile su trattenimento, salvataggi, condivisioni, DM o conversioni.
${packageDirection(pkg)}
- Il piano ${periodo} resta vincolato al mix acquistato: ${piano.postSingoli} post/pin, ${piano.caroselli} caroselli, ${piano.stories} Story e ${piano.reelVideo} Reel/short.`
}
