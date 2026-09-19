// Decorative artwork drawn from the logo's ploughed-field motif.
// Pure SVG, no images — so it is crisp at every size and adds no download weight.

/** Build a smooth wavy curve across the width, as an array of [x, y] points. */
function curve(k: number, width: number, height: number, spread: number) {
  const pts: [number, number][] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = -20 + t * (width + 40);
    // rows fan out from top-right to bottom-left, like a field seen at an angle
    const base = k * spread - 90 + t * (height * 0.28 - k * spread * 0.35);
    const wobble = 20 * Math.sin(t * 5.2 + k * 0.62) + 9 * Math.sin(t * 11 + k);
    pts.push([x, base + wobble + t * t * 40]);
  }
  return pts;
}

const toPath = (pts: [number, number][]) =>
  pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

// Filled band between two consecutive curves.
function band(a: [number, number][], b: [number, number][]) {
  return `${toPath(a)} ${b
    .slice()
    .reverse()
    .map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ")} Z`;
}

const FILLS = [
  "#0B4F28", "#14652F", "#0A4A27", "#1B7A3A", "#0E5A2C", "#2E7D32",
  "#0B4F28", "#CF9B26", "#14652F", "#1B7A3A", "#0A4A27", "#2E7D32",
  "#0E5A2C", "#14652F", "#0B4F28", "#1B7A3A",
];

export function FieldArt({ className = "" }: { className?: string }) {
  const W = 480;
  const H = 600;
  const curves = Array.from({ length: 17 }, (_, k) => curve(k, W, H, 62));
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="Aerial view of ploughed farmland"
    >
      <rect width={W} height={H} fill="#05391D" />
      {curves.slice(0, -1).map((c, i) => (
        <path key={i} d={band(c, curves[i + 1])} fill={FILLS[i % FILLS.length]} />
      ))}
      {/* fine furrow lines */}
      {curves.map((c, i) => (
        <path
          key={`l${i}`}
          d={toPath(c)}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

/** Thin flowing lines used as a quiet background on forest-green sections. */
export function FieldLines({ className = "" }: { className?: string }) {
  const W = 900;
  const H = 420;
  const lines = Array.from({ length: 15 }, (_, k) => {
    const pts = curve(k, W, H, 30);
    return { d: toPath(pts), gold: k % 5 === 2 };
  });
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMaxYMid slice"
      className={className}
      // fade the lines out towards the text side so copy always stays legible
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, #000 55%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 55%)",
      }}
      aria-hidden="true"
    >
      {lines.map((l, i) => (
        <path
          key={i}
          d={l.d}
          fill="none"
          stroke={l.gold ? "rgba(207,155,38,0.42)" : "rgba(255,255,255,0.08)"}
          strokeWidth={l.gold ? 1.6 : 1}
        />
      ))}
    </svg>
  );
}
