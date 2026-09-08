// Che cosa comprende il canone, e che cosa no.
//
// Il confine passa fra il lavoro e le spese intestate al cliente. L'hosting sta
// dentro perche' e' nostro: il progetto gira sulla nostra infrastruttura e non
// ha senso fatturarlo a parte. Dominio e caselle di posta stanno fuori perche'
// sono di chi li usa — restano intestati al cliente, li paga al suo fornitore e
// se ne va con quelli il giorno che se ne va. Rigirarglieli con un ricarico
// sarebbe un margine nascosto in una voce che non e' nostra.
//
// Sta qui e non dentro le pagine perche' e' una frase che deve essere identica
// in italiano, in inglese e nella bocca di ODINO.

export const CANONE_INCLUDE =
  'hosting, manutenzione del progetto, design responsive e SEO tecnica essenziale'

export const CANONE_INCLUDE_EN =
  'hosting, project maintenance, responsive design and essential technical SEO'

/** La riga che chiarisce le spese che restano al cliente. */
export const CANONE_A_CARICO_CLIENTE =
  'L’hosting è compreso nel canone. Restano invece a carico tuo le spese intestate a te: il dominio e le caselle di posta, che paghi direttamente al tuo fornitore e restano tue anche se un giorno cambi agenzia. Non le rivendiamo con un ricarico.'

export const CANONE_A_CARICO_CLIENTE_EN =
  'Hosting is included in the fee. Running costs registered in your name stay with you: the domain and the mailboxes, which you pay directly to your provider and keep even if you change agency one day. We do not resell them with a markup.'

/** Versione breve, per le schede e i riquadri dove non c'e' spazio per la frase intera. */
export const CANONE_BREVE = 'Hosting compreso. Dominio e caselle di posta a carico del cliente.'
export const CANONE_BREVE_EN = 'Hosting included. Domain and mailboxes are the client’s own cost.'
