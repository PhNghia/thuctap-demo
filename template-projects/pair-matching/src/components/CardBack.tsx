// ─── Card Back SVG ─────────────────────────────────────────────────────────────
export default function CardBack() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>
        <pattern
          id="stars"
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="10" cy="10" r="1.2" fill="rgba(255,255,255,0.25)" />
          <circle cx="3" cy="3" r="0.7" fill="rgba(255,255,255,0.15)" />
          <circle cx="17" cy="17" r="0.7" fill="rgba(255,255,255,0.15)" />
        </pattern>
      </defs>
      <rect width="100" height="100" rx="10" fill="url(#bgGrad)" />
      <rect width="100" height="100" rx="10" fill="url(#stars)" />
      {/* Border */}
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="8"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
      />
      {/* Center star */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="36"
        fill="rgba(255,255,255,0.9)"
      >
        ✨
      </text>
    </svg>
  );
}
