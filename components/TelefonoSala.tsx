import styles from './telefono-sala.module.css'

// Il menu al tavolo, come lo vede il cliente.
//
// E' disegnato, non fotografato: uno screenshot del prodotto sarebbe arancione
// — la palette del gestionale, non la nostra — sfocherebbe sui display retina e
// invecchierebbe a ogni modifica dell'interfaccia. Ricostruirlo costa una volta
// e resta nitido, segue il tema chiaro e scuro e parla la lingua della pagina.
//
// I piatti e i prezzi sono di esempio e si vede: «Trattoria da Luca» non
// esiste. Serve a far capire il gesto — scelgo, aggiungo, pago — non a
// millantare un cliente.

type Voce = { nome: string; etichetta?: string; prezzo: string; quantita?: number }

const VOCI: Voce[] = [
  { nome: 'Tagliatelle al ragù', etichetta: 'Il più ordinato', prezzo: '14,00 €', quantita: 2 },
  { nome: 'Tortelli di zucca', etichetta: 'Vegetariano', prezzo: '13,00 €' },
  { nome: 'Tagliata di manzo', prezzo: '22,00 €' },
]

export default function TelefonoSala({ inglese = false }: { inglese?: boolean }) {
  const t = inglese
    ? { tavolo: 'TABLE 7 · DINING ROOM', gruppi: ['Starters', 'Pasta', 'Mains'], conto: 'Go to the bill', piede: 'Split by dish · Card, Apple Pay, Satispay' }
    : { tavolo: 'TAVOLO 7 · SALA', gruppi: ['Antipasti', 'Primi', 'Secondi'], conto: 'Vai al conto', piede: 'Dividi per piatto · Carta, Apple Pay, Satispay' }

  return (
    <div className={styles.scena}>
      <div className={styles.telefono} role="img" aria-label={inglese
        ? 'Example of the table menu on a phone: dishes, quantities and a button to pay the bill.'
        : 'Esempio del menu al tavolo su telefono: piatti, quantità e il pulsante per pagare il conto.'}>
        <div className={styles.schermo} aria-hidden="true">
          <div className={styles.barra}>
            <span>20:41</span>
            <span className={styles.isola} />
            <span className={styles.segnale}>▮▮▯ ▭</span>
          </div>

          <div className={styles.testa}>
            <small>{t.tavolo}</small>
            <strong>Trattoria da Luca</strong>
          </div>

          <div className={styles.gruppi}>
            {t.gruppi.map((g, i) => (
              <span key={g} className={i === 1 ? styles.gruppoAttivo : undefined}>{g}</span>
            ))}
          </div>

          <ul className={styles.piatti}>
            {VOCI.map(v => (
              <li key={v.nome}>
                <span className={styles.foto} />
                <div className={styles.dettaglio}>
                  <strong>{v.nome}</strong>
                  {v.etichetta && <em>{v.etichetta}</em>}
                  <span className={styles.prezzo}>{v.prezzo}</span>
                </div>
                {v.quantita ? (
                  <span className={styles.contatore}>− {v.quantita} +</span>
                ) : (
                  <span className={styles.aggiungi}>+</span>
                )}
              </li>
            ))}
          </ul>

          <div className={styles.conto}>
            <span className={styles.badge}>2</span>
            <span>{t.conto}</span>
            <strong>28,00 €</strong>
          </div>
          <p className={styles.piede}>{t.piede}</p>
        </div>
      </div>
    </div>
  )
}
