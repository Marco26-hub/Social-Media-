// Regole della password, condivise fra registrazione e cambio password.
// Prima vivevano solo dentro app/api/auth/register/route.ts come due if sparsi:
// il cambio password rischiava di divergere in silenzio (es. accettare una
// password piu corta di quella pretesa in registrazione).
export const PASSWORD_MIN_LEN = 8
// Tetto lunghezza: bcrypt tronca a 72 byte (oltre non aggiunge sicurezza) e
// hashare input enormi è un vettore DoS CPU. 200 caratteri sono ampi per una passphrase.
export const PASSWORD_MAX_LEN = 200

/**
 * Restituisce il messaggio d'errore da mostrare, oppure null se la password va bene.
 * `attuale` serve solo al cambio password: la nuova deve essere diversa.
 */
export function passwordProblem(password: string, attuale?: string): string | null {
  if (!password) return 'La password è obbligatoria'
  if (password.length < PASSWORD_MIN_LEN) return `La password deve avere almeno ${PASSWORD_MIN_LEN} caratteri`
  if (password.length > PASSWORD_MAX_LEN) return `La password è troppo lunga (max ${PASSWORD_MAX_LEN} caratteri)`
  if (attuale !== undefined && password === attuale) return 'La nuova password deve essere diversa da quella attuale'
  return null
}
