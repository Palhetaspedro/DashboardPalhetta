// ─── Logo conceitual Palhetta ─────────────────────────────────────────────
// Design: "P" prismático com anel de gradiente e diamante central
// Cores: roxo (#7c3aed) + azul (#3b82f6) do tema

// Small icon for navbar (36x36 area)
export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Fundo circular com gradiente */}
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="innerGlow" x1="60" y1="40" x2="160" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Hexágono externo */}
      <path
        d="M100 10 L178 55 L178 145 L100 190 L22 145 L22 55 Z"
        fill="url(#logoGrad)"
        stroke="url(#innerGlow)"
        strokeWidth="2"
      />

      {/* "P" estilizado */}
      <path
        d="M60 55 L60 145 L60 145"
        stroke="white"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M60 55 C60 55, 130 55, 130 85 C130 115, 60 115, 60 115"
        stroke="white"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      {/* Diamante decorativo */}
      <path
        d="M150 130 L160 140 L150 150 L140 140 Z"
        fill="rgba(255,255,255,0.5)"
      />
    </svg>
  );
}

// Full logo for auth page and prominent display
export function LogoFull({ size = 140 }: { size?: number }) {
  const h = size;
  const w = size * 3.2;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 480 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="140" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="lg2" x1="160" y1="20" x2="460" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#7c3aed" floodOpacity="0.4" />
        </filter>
        <linearGradient id="textGrad" x1="160" y1="30" x2="460" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Hex icon */}
      <g filter="url(#shadow)">
        <path
          d="M70 10 L130 40 L130 100 L70 130 L10 100 L10 40 Z"
          fill="url(#lg1)"
        />
        {/* Inner hex accent */}
        <path
          d="M70 22 L118 46 L118 94 L70 118 L22 94 L22 46 Z"
          fill="rgba(255,255,255,0.08)"
        />

        {/* "P" letter */}
        <path
          d="M40 38 L40 102"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M40 38 C40 38, 90 38, 90 58 C90 78, 40 78, 40 78"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Small diamonds */}
        <path d="M105 88 L112 96 L105 104 L98 96 Z" fill="rgba(255,255,255,0.45)" />
        <path d="M115 72 L119 77 L115 82 L111 77 Z" fill="rgba(255,255,255,0.25)" />
      </g>

      {/* Text: Palhetta */}
      <text
        x="160"
        y="88"
        fontFamily="'DM Sans', system-ui, sans-serif"
        fontSize="62"
        fontWeight="800"
        letterSpacing="-2"
        fill="url(#textGrad)"
      >
        Palhetta
      </text>

      {/* Tagline */}
      <text
        x="164"
        y="112"
        fontFamily="'DM Sans', system-ui, sans-serif"
        fontSize="13"
        fontWeight="600"
        letterSpacing="4"
        fill="#a78bfa"
        opacity="0.7"
      >
        MARKETPLACE
      </text>

      {/* Decorative dots */}
      <circle cx="455" cy="55" r="3" fill="#7c3aed" opacity="0.3" />
      <circle cx="465" cy="45" r="2" fill="#3b82f6" opacity="0.25" />
      <circle cx="470" cy="60" r="1.5" fill="#a78bfa" opacity="0.2" />
    </svg>
  );
}

// Compact logo for navbar
export function LogoNavbar({ dark }: { dark: boolean }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="nlg" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path
        d="M100 8 L180 54 L180 146 L100 192 L20 146 L20 54 Z"
        fill="url(#nlg)"
      />
      <path
        d="M100 24 L164 60 L164 140 L100 176 L36 140 L36 60 Z"
        fill="rgba(255,255,255,0.07)"
      />
      <path d="M55 42 L55 130" stroke="white" strokeWidth="9" strokeLinecap="round" />
      <path d="M55 42 C55 42, 115 42, 115 70 C115 98, 55 98, 55 98" stroke="white" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M145 110 L155 120 L145 130 L135 120 Z" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}
