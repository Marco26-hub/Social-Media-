import type { Metadata } from 'next'
import LegalShell, { PH } from '@/components/LegalShell'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'

const META_TITLE = 'Termini e Condizioni — Social Automation'
const META_DESCRIPTION = 'Condizioni generali di utilizzo del servizio Social Automation.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/termini` },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/termini` },
  robots: { index: true, follow: true },
}

function val(v: string) {
  return v.startsWith('[DA COMPILARE') ? <PH>{v}</PH> : v
}

export default function TerminiPage() {
  return (
    <LegalShell eyebrow="Termini e Condizioni" title="Termini e Condizioni d'uso" currentPath="/termini">
      <p>
        Le presenti Condizioni Generali regolano l&apos;utilizzo dei servizi di {TITOLARE.brand}, forniti da {val(TITOLARE.ragioneSociale)},
        con sede in {val(TITOLARE.sedeLegale)}, P.IVA {val(TITOLARE.partitaIva)}, C.F. {val(TITOLARE.codiceFiscale)} e
        PEC <a href={`mailto:${TITOLARE.pec}`}>{TITOLARE.pec}</a>. La registrazione, l&apos;acquisto o l&apos;utilizzo dei servizi
        comportano l&apos;accettazione delle presenti condizioni.
      </p>

      <h2>1. Oggetto del servizio</h2>
      <p>{TITOLARE.brand} è una piattaforma e un servizio gestito che, tramite intelligenza artificiale, genera contenuti social,
        piani editoriali, articoli, campagne e li pubblica sui canali del cliente previa <strong>approvazione umana</strong>. Sono inoltre
        offerti servizi di siti/e-commerce, visibilità e — tramite lo Studio Legale BCS — consulenze legali e AI compliance.</p>

      <h2>2. Registrazione e account</h2>
      <ul>
        <li>La registrazione richiede dati veritieri e completi. L&apos;account è attivato previa approvazione.</li>
        <li>Sei responsabile della custodia delle credenziali e delle attività svolte con il tuo account.</li>
        <li>Devi avere almeno 18 anni e, se agisci per un&apos;azienda, i poteri per vincolarla.</li>
      </ul>

      <h2>3. Piani, prezzi e pagamenti</h2>
      <ul>
        <li>I canoni e gli eventuali costi iniziali sono indicati nella pagina <a href="/pacchetti">Pacchetti</a>. I prezzi sono mensili e IVA esclusa, salvo diversa indicazione.</li>
        <li>La fatturazione degli abbonamenti è gestita tramite Stripe, con rinnovo automatico mensile salvo disdetta.</li>
        <li><strong>Blog SEO + GEO:</strong> il canone di €29,90/mese comprende il ciclo editoriale descritto nella relativa pagina. Tempi, accessi al CMS e modalità di pubblicazione vengono definiti nell&apos;onboarding.</li>
        <li><strong>Web &amp; Commerce Base:</strong> il canone parte da €19,90/mese e copre la componente tecnologica base indicata nell&apos;offerta. Progettazione, configurazioni, dominio, licenze e funzioni ulteriori vengono definite e approvate prima di eventuali costi aggiuntivi.</li>
        <li><strong>Pilot Ricerca Clienti B2B:</strong> il prezzo di €149 è una tantum e comprende la definizione del profilo ideale, la ricerca e la qualificazione di un massimo di 30 aziende. Non include invii automatici, campagne outbound, garanzie di risposta, appuntamenti o vendite.</li>
        <li>Il budget destinato alle campagne pubblicitarie è sempre separato dal canone del servizio.</li>
        <li>Le consulenze legali (€150/30 min) sono erogate dallo Studio Legale BCS e regolate anche dalle condizioni dello Studio.</li>
      </ul>

      <h2>4. Contenuti generati dall&apos;AI</h2>
      <ul>
        <li>I contenuti sono generati con il supporto di sistemi di intelligenza artificiale e <strong>rivisti o approvati dal cliente</strong> prima della pubblicazione. L&apos;approvazione finale spetta al cliente.</li>
        <li>Non garantiamo che i contenuti siano privi di errori: sei tenuto a verificarne accuratezza, veridicità e conformità prima di pubblicarli.</li>
        <li>Sei responsabile dei diritti sui materiali che carichi (immagini, marchi, testi) e delle autorizzazioni necessarie.</li>
      </ul>

      <h2>5. Uso consentito</h2>
      <p>È vietato utilizzare il servizio per contenuti illeciti, diffamatori, ingannevoli, che violino diritti di terzi o le
        policy delle piattaforme social. Ci riserviamo di sospendere account che violino queste condizioni.</p>

      <h2>6. Proprietà intellettuale</h2>
      <p>Il software, il marchio e la struttura della piattaforma restano di proprietà del Titolare. I contenuti generati per
        il cliente e i materiali da lui caricati restano di proprietà del cliente.</p>

      <h2>7. Limitazione di responsabilità</h2>
      <p>Il servizio è fornito &quot;così com&apos;è&quot;. Nei limiti di legge, il Titolare non risponde di danni indiretti, perdita di
        profitti, o conseguenze derivanti dalla pubblicazione di contenuti approvati dal cliente. La responsabilità complessiva
        è comunque limitata all&apos;importo dei canoni versati negli ultimi 12 mesi.</p>

      <h2>8. Recesso e cessazione</h2>
      <ul>
        <li><strong>Imprese e professionisti:</strong> possono disdire l&apos;abbonamento con effetto dal periodo di fatturazione successivo, dal pannello, tramite la funzione <a href="/recesso">Recesso e disdetta</a> o scrivendo a <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>. Il diritto di recesso previsto dal Codice del consumo non si applica agli acquisti effettuati per finalita imprenditoriali o professionali.</li>
        <li><strong>Consumatori:</strong> la persona fisica che acquista per scopi estranei alla propria attivita imprenditoriale o professionale puo recedere da un contratto a distanza entro 14 giorni dalla conclusione, senza indicarne il motivo, fatte salve le eccezioni previste dalla legge.</li>
        <li>Il consumatore puo utilizzare in ogni momento utile la funzione online chiaramente identificata come <a href="/recesso"><strong>Recedere dal contratto qui</strong></a>. Dopo il riepilogo, il comando &quot;Conferma recesso&quot; trasmette la dichiarazione e genera una ricevuta con contenuto, data e ora.</li>
        <li>Se il consumatore ha chiesto espressamente l&apos;avvio del servizio durante il periodo di recesso e poi recede, puo essere dovuto un importo proporzionale alla parte di servizio gia eseguita, nei casi e limiti dell&apos;art. 57 del Codice del consumo.</li>
        <li>Il diritto puo essere escluso per un servizio integralmente eseguito quando l&apos;esecuzione e iniziata con il previo consenso espresso del consumatore e con l&apos;accettazione della perdita del diritto dopo la completa esecuzione. Le altre eccezioni dell&apos;art. 59 restano applicabili se pertinenti.</li>
        <li>La funzione online non limita la possibilita di inviare la dichiarazione con gli altri mezzi consentiti, inclusi email e PEC.</li>
      </ul>

      <h2>9. Legge applicabile e foro</h2>
      <p>Le presenti condizioni sono regolate dalla legge italiana. Per le controversie con consumatori è competente il foro di
        residenza del consumatore; negli altri casi il foro di {TITOLARE.foroCompetente}.</p>

      <h2>10. Modifiche</h2>
      <p>Il Titolare può aggiornare i presenti termini. Le modifiche rilevanti saranno comunicate con modalità adeguate e si applicheranno dalla data indicata nella comunicazione, nel rispetto della normativa vigente.</p>
    </LegalShell>
  )
}
