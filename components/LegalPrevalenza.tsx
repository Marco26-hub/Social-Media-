import styles from './legal.module.css'

// L'avviso di prevalenza, in cima a ogni documento legale tradotto.
//
// Una traduzione di un atto che vincola non e' l'atto: se le due versioni
// divergono, una delle due deve prevalere, e deve essere quella redatta nella
// lingua in cui l'azienda opera e in cui un giudice italiano leggerebbe il
// contratto. Scriverlo non e' una cautela formale — e' la differenza fra una
// traduzione utile e una seconda fonte di verita' che nessuno ha verificato.

export default function LegalPrevalenza({ href }: { href: string }) {
  return (
    <p className={styles.nota}>
      <strong>Courtesy translation.</strong> This is an English translation of a document originally
      written in Italian, provided to make it readable. The{' '}
      <a href={href} hrefLang="it" lang="it">Italian version</a> is the binding one: in case of any
      discrepancy between the two texts, the Italian text prevails.
    </p>
  )
}
