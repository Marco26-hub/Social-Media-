// ODINO disegnato in SVG.
//
// Una PNG e' un'immagine sola: occhi e braccia non si possono muovere
// separatamente. Qui ogni parte e' un gruppo con un id, quindi il CSS puo'
// farle vivere una per una — le palpebre che si chiudono, il braccio che
// saluta — senza fotogrammi e senza un file video da caricare su ogni pagina.
//
// Il disegno segue la mascotte: scocca crema, schermo verde scuro, profili oro,
// antenna con la sfera, medaglietta al collo.

export default function OdinoFaccia({ className, intero = false }: { className?: string; intero?: boolean }) {
  return (
    <svg
      className={className}
      viewBox={intero ? '0 0 120 150' : '0 0 120 96'}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="odino-scocca" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf7" />
          <stop offset="1" stopColor="#e8e0cd" />
        </linearGradient>
        <linearGradient id="odino-verde" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d5740" />
          <stop offset="1" stopColor="#0d2620" />
        </linearGradient>
      </defs>

      {/* antenna */}
      <g className="odino-antenna">
        <rect x="58" y="6" width="4" height="14" rx="2" fill="#16452f" />
        <circle cx="60" cy="6" r="5.4" fill="#c9a227" />
      </g>

      {/* orecchie / cuffie */}
      <rect x="10" y="34" width="12" height="26" rx="6" fill="#16452f" />
      <rect x="98" y="34" width="12" height="26" rx="6" fill="#16452f" />
      <rect x="12" y="42" width="8" height="3" rx="1.5" fill="#c9a227" />
      <rect x="100" y="42" width="8" height="3" rx="1.5" fill="#c9a227" />

      {/* testa */}
      <rect x="16" y="18" width="88" height="60" rx="24" fill="url(#odino-scocca)" stroke="#c9a227" strokeWidth="2" />
      {/* schermo */}
      <rect x="24" y="25" width="72" height="46" rx="18" fill="url(#odino-verde)" />

      {/* occhi: due archi sorridenti che si chiudono a intervalli */}
      <g className="odino-occhi" style={{ transformOrigin: '60px 44px' }}>
        <path d="M37 46a8 8 0 0 1 15 0" fill="none" stroke="#f2d98b" strokeWidth="4" strokeLinecap="round" />
        <path d="M68 46a8 8 0 0 1 15 0" fill="none" stroke="#f2d98b" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* barrette sulle guance, come le onde sonore della mascotte */}
      <g className="odino-onde" fill="#f2d98b">
        <rect x="29" y="46" width="2.6" height="7" rx="1.3" />
        <rect x="33" y="43" width="2.6" height="13" rx="1.3" />
        <rect x="85" y="46" width="2.6" height="7" rx="1.3" />
        <rect x="81" y="43" width="2.6" height="13" rx="1.3" />
      </g>

      {/* sorriso */}
      <path d="M50 58c3.6 4 16.4 4 20 0" fill="none" stroke="#f2d98b" strokeWidth="4" strokeLinecap="round" />

      {intero && (
        <>
          {/* collo e corpo */}
          <rect x="54" y="78" width="12" height="8" rx="4" fill="#16452f" />
          <rect x="34" y="84" width="52" height="46" rx="18" fill="url(#odino-scocca)" stroke="#c9a227" strokeWidth="1.6" />
          <path d="M44 84h32a10 10 0 0 1-10 9h-12a10 10 0 0 1-10-9z" fill="#16452f" />
          {/* medaglietta */}
          <ellipse cx="60" cy="104" rx="15" ry="9" fill="#c9a227" />
          <text x="60" y="107" textAnchor="middle" fill="#0d2620" fontSize="7.5" fontWeight="700" fontFamily="Arial, sans-serif">ODINO</text>

          {/* braccio che saluta */}
          <g className="odino-braccio" style={{ transformOrigin: '34px 92px' }}>
            <rect x="18" y="86" width="18" height="9" rx="4.5" fill="url(#odino-scocca)" stroke="#c9a227" strokeWidth="1.2" />
            <circle cx="16" cy="90" r="7" fill="#1d5740" />
          </g>
          {/* braccio fermo, sul fianco */}
          <g>
            <rect x="84" y="92" width="17" height="9" rx="4.5" fill="url(#odino-scocca)" stroke="#c9a227" strokeWidth="1.2" />
            <circle cx="103" cy="96" r="6.5" fill="#1d5740" />
          </g>

          {/* gambe */}
          <rect x="44" y="128" width="12" height="16" rx="6" fill="url(#odino-scocca)" stroke="#c9a227" strokeWidth="1.2" />
          <rect x="64" y="128" width="12" height="16" rx="6" fill="url(#odino-scocca)" stroke="#c9a227" strokeWidth="1.2" />
        </>
      )}
    </svg>
  )
}
