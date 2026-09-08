// ODINO disegnato in SVG.
//
// Una PNG e' un'immagine sola: occhi e braccia non si possono muovere
// separatamente. Qui ogni parte e' un gruppo con una classe, quindi il CSS le
// anima una per una — le palpebre che si chiudono, il braccio che saluta —
// senza fotogrammi e senza un video da caricare su ogni pagina. Pesa due
// chilobyte e resta nitido a qualsiasi dimensione.
//
// Proporzioni della mascotte: testa grande quasi quanto il corpo, scocca crema,
// schermo verde scuro, profili oro, cuffie ai lati, antenna con la sfera,
// catenina con la medaglietta, un braccio alzato a salutare e uno sul fianco.

export default function OdinoFaccia({ className, intero = false }: { className?: string; intero?: boolean }) {
  return (
    <svg
      className={className}
      viewBox={intero ? '0 0 140 194' : '4 8 132 92'}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="od-crema" x1="0" y1="0" x2=".3" y2="1">
          <stop offset="0" stopColor="#fffefa" />
          <stop offset="1" stopColor="#e4dcc6" />
        </linearGradient>
        <linearGradient id="od-verde" x1="0" y1="0" x2=".4" y2="1">
          <stop offset="0" stopColor="#22624a" />
          <stop offset="1" stopColor="#0f3626" />
        </linearGradient>
        <linearGradient id="od-schermo" x1="0" y1="0" x2=".5" y2="1">
          <stop offset="0" stopColor="#123d2c" />
          <stop offset="1" stopColor="#08251a" />
        </linearGradient>
        <linearGradient id="od-oro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8c96a" />
          <stop offset=".5" stopColor="#c9a227" />
          <stop offset="1" stopColor="#a8841c" />
        </linearGradient>
      </defs>

      {/* antenna */}
      <g className="odino-antenna" style={{ transformOrigin: '70px 34px' }}>
        <path d="M70 34c0-9 0-14 0-18" stroke="url(#od-verde)" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="70" cy="13" r="7" fill="url(#od-oro)" />
      </g>

      {/* cuffie */}
      <g>
        <rect x="12" y="46" width="16" height="34" rx="8" fill="url(#od-verde)" />
        <rect x="112" y="46" width="16" height="34" rx="8" fill="url(#od-verde)" />
        <rect x="15" y="56" width="10" height="4" rx="2" fill="url(#od-oro)" />
        <rect x="115" y="56" width="10" height="4" rx="2" fill="url(#od-oro)" />
      </g>

      {/* testa */}
      <rect x="20" y="30" width="100" height="66" rx="30" fill="url(#od-crema)" />
      <rect x="20" y="30" width="100" height="66" rx="30" fill="none" stroke="url(#od-oro)" strokeWidth="2.4" />
      {/* schermo */}
      <rect x="29" y="37" width="82" height="52" rx="22" fill="url(#od-schermo)" />
      <rect x="29" y="37" width="82" height="52" rx="22" fill="none" stroke="url(#od-oro)" strokeWidth="1.6" />

      {/* occhi: due archi sorridenti, si chiudono a intervalli */}
      <g className="odino-occhi" style={{ transformOrigin: '70px 57px' }}>
        <path d="M45 60a9.5 9.5 0 0 1 18 0" fill="none" stroke="#f7e3a8" strokeWidth="4.6" strokeLinecap="round" />
        <path d="M77 60a9.5 9.5 0 0 1 18 0" fill="none" stroke="#f7e3a8" strokeWidth="4.6" strokeLinecap="round" />
      </g>

      {/* barrette sulle guance */}
      <g className="odino-onde" fill="#f7e3a8">
        <rect x="35" y="61" width="2.8" height="7" rx="1.4" />
        <rect x="39.5" y="58" width="2.8" height="13" rx="1.4" />
        <rect x="44" y="60" width="2.8" height="9" rx="1.4" />
        <rect x="93" y="61" width="2.8" height="7" rx="1.4" />
        <rect x="97.5" y="58" width="2.8" height="13" rx="1.4" />
        <rect x="102" y="60" width="2.8" height="9" rx="1.4" />
      </g>

      {/* sorriso */}
      <path d="M58 76c4.4 5 15.6 5 20 0" fill="none" stroke="#f7e3a8" strokeWidth="4.6" strokeLinecap="round" />

      {intero && (
        <>
          {/* collo */}
          <rect x="62" y="94" width="16" height="12" rx="6" fill="url(#od-verde)" />

          {/* busto */}
          <path d="M40 114a24 24 0 0 1 24-16h12a24 24 0 0 1 24 16v28a20 20 0 0 1-20 20H60a20 20 0 0 1-20-20z" fill="url(#od-crema)" stroke="url(#od-oro)" strokeWidth="1.8" />
          {/* spalle verdi */}
          <path d="M52 104a20 20 0 0 1 12-6h12a20 20 0 0 1 12 6 44 44 0 0 1-36 0z" fill="url(#od-verde)" />

          {/* catenina e medaglietta */}
          <path d="M60 100c4 12 16 12 20 0" fill="none" stroke="url(#od-oro)" strokeWidth="2" strokeDasharray="1.6 2.4" strokeLinecap="round" />
          <ellipse cx="70" cy="124" rx="19" ry="11.5" fill="url(#od-oro)" />
          <ellipse cx="70" cy="124" rx="15.5" ry="8.5" fill="none" stroke="#a8841c" strokeWidth="1" />
          <text x="70" y="127.6" textAnchor="middle" fill="#0f3626" fontSize="9" fontWeight="700" fontFamily="Arial, Helvetica, sans-serif" letterSpacing=".4">ODINO</text>

          {/* braccio alzato che saluta: spalla, avambraccio, mano aperta */}
          <g className="odino-braccio" style={{ transformOrigin: '48px 116px' }}>
            <rect x="30" y="110" width="20" height="13" rx="6.5" fill="url(#od-crema)" stroke="url(#od-oro)" strokeWidth="1.4" />
            <rect x="20" y="92" width="13" height="26" rx="6.5" transform="rotate(-22 26 105)" fill="url(#od-crema)" stroke="url(#od-oro)" strokeWidth="1.4" />
            <circle cx="24" cy="118" r="6" fill="url(#od-verde)" />
            {/* mano aperta, tre dita e pollice */}
            <g fill="url(#od-verde)">
              <rect x="8" y="76" width="6.5" height="17" rx="3.2" transform="rotate(-14 11 84)" />
              <rect x="15" y="72" width="6.5" height="21" rx="3.2" transform="rotate(-6 18 82)" />
              <rect x="22" y="74" width="6.5" height="19" rx="3.2" transform="rotate(3 25 83)" />
              <rect x="27" y="82" width="6.5" height="14" rx="3.2" transform="rotate(16 30 89)" />
              <rect x="12" y="88" width="19" height="14" rx="7" />
            </g>
          </g>

          {/* braccio sul fianco */}
          <g>
            <rect x="90" y="112" width="20" height="13" rx="6.5" fill="url(#od-crema)" stroke="url(#od-oro)" strokeWidth="1.4" />
            <rect x="104" y="120" width="13" height="24" rx="6.5" fill="url(#od-crema)" stroke="url(#od-oro)" strokeWidth="1.4" />
            <circle cx="106" cy="119" r="6" fill="url(#od-verde)" />
            <circle cx="110" cy="146" r="8" fill="url(#od-verde)" />
          </g>

          {/* gambe e scarpe */}
          <g>
            <rect x="50" y="158" width="17" height="22" rx="8.5" fill="url(#od-crema)" stroke="url(#od-oro)" strokeWidth="1.4" />
            <rect x="73" y="158" width="17" height="22" rx="8.5" fill="url(#od-crema)" stroke="url(#od-oro)" strokeWidth="1.4" />
            <ellipse cx="58.5" cy="161" rx="7" ry="6" fill="url(#od-verde)" />
            <ellipse cx="81.5" cy="161" rx="7" ry="6" fill="url(#od-verde)" />
            <path d="M42 178h25v6a4 4 0 0 1-4 4H46a4 4 0 0 1-4-4z" fill="url(#od-crema)" stroke="url(#od-oro)" strokeWidth="1.4" />
            <path d="M73 178h25v6a4 4 0 0 1-4 4H77a4 4 0 0 1-4-4z" fill="url(#od-crema)" stroke="url(#od-oro)" strokeWidth="1.4" />
            <path d="M42 184h25v0a4 4 0 0 1-4 4H46a4 4 0 0 1-4-4z" fill="url(#od-verde)" />
            <path d="M73 184h25v0a4 4 0 0 1-4 4H77a4 4 0 0 1-4-4z" fill="url(#od-verde)" />
          </g>
        </>
      )}
    </svg>
  )
}
