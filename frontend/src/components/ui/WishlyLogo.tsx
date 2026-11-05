/**
 * Wishly brand assets — dandelion logo approved Nov 2026.
 *
 * <WishlyIcon />        — icon box only (for navbar, favicon, small contexts)
 * <WishlyWordmark />    — icon + "wishly" italic text (for landing, auth pages)
 * <WishlyFavicon />     — raw SVG string exported for index.html / manifest
 */

interface SizeProps {
  size?: number;
}

/* ─────────────────────────────────────────────
   Icon box — the dandelion in its amber rounded square
───────────────────────────────────────────── */
export function WishlyIcon({ size = 36 }: SizeProps) {
  const s = size;
  const b = s * 0.08;   // box padding
  const cx = s / 2;
  const cy = s / 2;
  const r  = s * 0.22;  // center dot radius
  const stemBot = s - b - 2;
  const rx = s * 0.28;  // box corner radius

  // Scale factors relative to 76px design
  const k = s / 76;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      aria-label="Wishly logo"
      role="img"
    >
      <defs>
        <linearGradient id={`bg-${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FED7AA" />
        </linearGradient>
        <linearGradient id={`stem-${s}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect x={b} y={b} width={s - b * 2} height={s - b * 2} rx={rx} fill={`url(#bg-${s})`} />

      {/* Stem */}
      <line x1={cx} y1={stemBot} x2={cx} y2={cy + r + 1} stroke={`url(#stem-${s})`} strokeWidth={2.2 * k} strokeLinecap="round" />

      {/* Leaf */}
      <path
        d={`M${cx} ${stemBot - 12 * k} Q${cx - 10 * k} ${stemBot - 16 * k} ${cx - 14 * k} ${stemBot - 24 * k} Q${cx - 6 * k} ${stemBot - 20 * k} ${cx} ${stemBot - 12 * k}Z`}
        fill="#D97706"
        opacity="0.5"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3.5 * k} fill="#F59E0B" />

      {/* Seed lines + tip circles — 7 directions */}
      {[
        [cx,           cy - r,         cx,                cy - r - 18 * k],  // top
        [cx + 2.5 * k, cy - r + 1 * k, cx + 13 * k,      cy - r - 16 * k],  // top-right
        [cx + r,       cy,             cx + r + 16 * k,   cy - 5 * k],       // right
        [cx + r - 1*k, cy + r - 1*k,  cx + r + 13 * k,   cy + r + 11 * k],  // bottom-right
        [cx - 2.5 * k, cy - r + 1 * k,cx - 13 * k,       cy - r - 16 * k],  // top-left
        [cx - r,       cy,             cx - r - 16 * k,   cy - 5 * k],       // left
        [cx - r + 1*k, cy + r - 1*k,  cx - r - 13 * k,   cy + r + 11 * k],  // bottom-left
      ].map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth={1.4 * k} strokeLinecap="round" />
          <circle
            cx={x2 + (x2 - x1) * 0.08}
            cy={y2 + (y2 - y1) * 0.08}
            r={3 * k}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={1.4 * k}
          />
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Full wordmark — icon + text side by side
───────────────────────────────────────────── */
export function WishlyWordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const configs = {
    sm: { iconSize: 28, fontSize: 22, gap: 8,  tagline: false },
    md: { iconSize: 36, fontSize: 28, gap: 10, tagline: false },
    lg: { iconSize: 76, fontSize: 52, gap: 16, tagline: true  },
  };
  const { iconSize, fontSize, gap, tagline } = configs[size];
  const totalW = iconSize + gap + fontSize * 3.6;
  const totalH = tagline ? iconSize + 22 : iconSize;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalW} ${totalH}`}
      width={totalW}
      height={totalH}
      aria-label="Wishly"
      role="img"
    >
      {/* Icon */}
      <WishlyIconInline size={iconSize} x={0} y={0} />

      {/* Wordmark text */}
      <text
        x={iconSize + gap}
        y={iconSize * 0.72}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={fontSize}
        fontWeight="700"
        fontStyle="italic"
        fill="#1C1917"
        letterSpacing="-0.5"
      >
        wishly
      </text>

      {/* Tagline */}
      {tagline && (
        <text
          x={iconSize + gap + 1}
          y={totalH - 2}
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontSize="10.5"
          fontWeight="400"
          fill="#A8A29E"
          letterSpacing="3.5"
        >
          YOUR DREAM SANCTUARY
        </text>
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Internal helper — renders the icon inline
   inside an existing SVG (uses foreignObject-free approach)
───────────────────────────────────────────── */
function WishlyIconInline({ size: s, x, y }: { size: number; x: number; y: number }) {
  const b  = s * 0.08;
  const cx = x + s / 2;
  const cy = y + s / 2;
  const k  = s / 76;
  const r  = s * 0.22;
  const rx = s * 0.28;
  const stemBot = y + s - b - 2;
  const id = `wl-${s}`;

  return (
    <g>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FED7AA" />
        </linearGradient>
        <linearGradient id={`st-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>

      <rect x={x + b} y={y + b} width={s - b * 2} height={s - b * 2} rx={rx} fill={`url(#bg-${id})`} />

      <line x1={cx} y1={stemBot} x2={cx} y2={cy + r + 1} stroke={`url(#st-${id})`} strokeWidth={2.2 * k} strokeLinecap="round" />

      <path
        d={`M${cx} ${stemBot - 12 * k} Q${cx - 10 * k} ${stemBot - 16 * k} ${cx - 14 * k} ${stemBot - 24 * k} Q${cx - 6 * k} ${stemBot - 20 * k} ${cx} ${stemBot - 12 * k}Z`}
        fill="#D97706" opacity="0.5"
      />

      <circle cx={cx} cy={cy} r={3.5 * k} fill="#F59E0B" />

      {[
        [cx,            cy - r,        cx,              cy - r - 18 * k],
        [cx + 2.5 * k,  cy - r + 1*k,  cx + 13 * k,    cy - r - 16 * k],
        [cx + r,        cy,            cx + r + 16 * k, cy - 5 * k],
        [cx + r - 1*k,  cy + r - 1*k,  cx + r + 13*k,  cy + r + 11 * k],
        [cx - 2.5 * k,  cy - r + 1*k,  cx - 13 * k,    cy - r - 16 * k],
        [cx - r,        cy,            cx - r - 16 * k, cy - 5 * k],
        [cx - r + 1*k,  cy + r - 1*k,  cx - r - 13*k,  cy + r + 11 * k],
      ].map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth={1.4 * k} strokeLinecap="round" />
          <circle cx={x2! + (x2! - x1!) * 0.08} cy={y2! + (y2! - y1!) * 0.08} r={3 * k} fill="none" stroke="#F59E0B" strokeWidth={1.4 * k} />
        </g>
      ))}
    </g>
  );
}
