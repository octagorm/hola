import type { ReactNode } from 'react'
import type { Motif, Picture, Shape } from '../data/museo'

// The stand-in for a picture not yet painted: a simple print in the
// theme's colours (data/museo.ts), flat shapes with a grain of ink over
// them, drawn on the picture's own shape.

export const BOX: Record<Shape, [number, number]> = {
  portrait: [300, 450],
  landscape: [450, 300],
  square: [360, 360],
}

type Draw = (w: number, h: number, c: Picture['colors']) => ReactNode

// A row of hills, their tops waving
const hills = (
  w: number,
  y: number,
  amp: number,
  n: number,
  phase: number,
): string => {
  let d = `M0 ${y}`
  const step = w / n
  for (let i = 0; i < n; i++) {
    const x0 = i * step
    const up = (i + phase) % 2 === 0 ? -amp : amp * 0.4
    d += ` Q${x0 + step / 2} ${y + up} ${x0 + step} ${y}`
  }
  return `${d} V9999 H0Z`
}

const MOTIFS: Record<Motif, Draw> = {
  sun: (w, h, [p, a, b, k]) => (
    <>
      <rect width={w} height={h} fill={p} />
      <circle cx={w * 0.66} cy={h * 0.34} r={Math.min(w, h) * 0.2} fill={a} />
      <path d={hills(w, h * 0.58, h * 0.12, 3, 0)} fill={b} opacity=".75" />
      <path d={hills(w, h * 0.7, h * 0.1, 4, 1)} fill={b} />
      <path d={hills(w, h * 0.84, h * 0.06, 5, 0)} fill={k} />
    </>
  ),
  sea: (w, h, [p, a, b, k]) => (
    <>
      <rect width={w} height={h} fill={p} />
      <circle cx={w * 0.26} cy={h * 0.3} r={Math.min(w, h) * 0.12} fill={a} />
      <rect y={h * 0.56} width={w} height={h} fill={b} />
      {[0.64, 0.74, 0.86].map((t, i) => (
        <path
          key={t}
          d={hills(w, h * t, h * 0.025, 9 + i * 2, i)}
          fill="none"
          stroke={p}
          strokeWidth="3"
          opacity=".8"
        />
      ))}
      <path
        d={`M${w * 0.58} ${h * 0.56}l${w * 0.18} 0l-${w * 0.03} ${h * 0.05}h-${w * 0.12}Z`}
        fill={k}
      />
      <path
        d={`M${w * 0.66} ${h * 0.54}V${h * 0.3}L${w * 0.76} ${h * 0.53}Z`}
        fill={a}
        stroke={k}
        strokeWidth="2"
      />
    </>
  ),
  arch: (w, h, [p, a, b, k]) => {
    const n = 3
    const aw = w / n
    return (
      <>
        <rect width={w} height={h} fill={k} />
        {Array.from({ length: n }, (_, i) => {
          const x = i * aw + aw / 2
          const r = aw * 0.4
          const top = h * 0.3
          return (
            <g key={i}>
              <path
                d={`M${x - r} ${h}V${top + r * 0.4}A${r} ${r} 0 1 1 ${x + r} ${top + r * 0.4}V${h}Z`}
                fill={p}
              />
              {Array.from({ length: 7 }, (__, j) => {
                const t0 = Math.PI * (1.1 + (j * 0.8) / 7)
                const t1 = Math.PI * (1.1 + ((j + 1) * 0.8) / 7)
                const R = r * 1.25
                const cy = top + r * 0.4
                return (
                  <path
                    key={j}
                    d={`M${x + r * Math.cos(t0)} ${cy + r * Math.sin(t0)}L${x + R * Math.cos(t0)} ${cy + R * Math.sin(t0)}L${x + R * Math.cos(t1)} ${cy + R * Math.sin(t1)}L${x + r * Math.cos(t1)} ${cy + r * Math.sin(t1)}Z`}
                    fill={j % 2 ? a : p}
                  />
                )
              })}
              <rect
                x={x - r * 0.75}
                y={h * 0.62}
                width={r * 1.5}
                height={h * 0.38}
                fill={b}
                opacity=".55"
              />
            </g>
          )
        })}
      </>
    )
  },
  tile: (w, h, [p, a, b, k]) => {
    const s = Math.min(w, h) / 3
    const cols = Math.ceil(w / s)
    const rows = Math.ceil(h / s)
    const star = (cx: number, cy: number, r: number) => {
      const pts = Array.from({ length: 16 }, (_, i) => {
        const t = (i * Math.PI) / 8
        const rr = i % 2 ? r * 0.55 : r
        return `${cx + rr * Math.cos(t)} ${cy + rr * Math.sin(t)}`
      })
      return `M${pts.join('L')}Z`
    }
    return (
      <>
        <rect width={w} height={h} fill={p} />
        {Array.from({ length: rows }, (_, j) =>
          Array.from({ length: cols }, (__, i) => {
            const cx = i * s + s / 2
            const cy = j * s + s / 2
            return (
              <g key={`${i}-${j}`}>
                <path d={star(cx, cy, s * 0.42)} fill={a} />
                <circle cx={cx} cy={cy} r={s * 0.12} fill={b} />
                <path
                  d={`M${i * s} ${j * s}h${s}v${s}h-${s}Z`}
                  fill="none"
                  stroke={k}
                  strokeWidth="1"
                  opacity=".35"
                />
              </g>
            )
          }),
        )}
      </>
    )
  },
  tower: (w, h, [p, a, b, k]) => (
    <>
      <rect width={w} height={h} fill={p} />
      <circle cx={w * 0.78} cy={h * 0.2} r={Math.min(w, h) * 0.08} fill={a} />
      <path
        d={`M${w * 0.1} ${h}V${h * 0.5}h${w * 0.18}V${h * 0.62}h${w * 0.12}V${h * 0.28}l${w * 0.06} -${h * 0.08} ${w * 0.06} ${h * 0.08}V${h * 0.56}h${w * 0.16}V${h * 0.44}h${w * 0.2}V${h}Z`}
        fill={b}
      />
      <path
        d={`M0 ${h}V${h * 0.74}h${w * 0.3}v${h * 0.06}h${w * 0.34}v-${h * 0.1}h${w * 0.36}V${h}Z`}
        fill={a}
      />
      {[0.2, 0.42, 0.58, 0.8].map((x) => (
        <rect
          key={x}
          x={w * x}
          y={h * 0.82}
          width={w * 0.04}
          height={h * 0.07}
          fill={k}
        />
      ))}
      <rect
        x={w * 0.43}
        y={h * 0.34}
        width={w * 0.04}
        height={h * 0.06}
        fill={k}
      />
    </>
  ),
  moon: (w, h, [p, a, b, k]) => (
    <>
      <rect width={w} height={h} fill={b} />
      <rect width={w} height={h} fill={k} opacity=".45" />
      <circle cx={w * 0.7} cy={h * 0.26} r={Math.min(w, h) * 0.11} fill={p} />
      <path d={hills(w, h * 0.72, h * 0.08, 3, 1)} fill={a} opacity=".8" />
      {[0.18, 0.28, 0.82].map((x, i) => (
        <path
          key={x}
          d={`M${w * x} ${h * (0.42 + i * 0.04)}q${w * 0.05} ${h * 0.2} 0 ${h * 0.36}q-${w * 0.05} -${h * 0.16} 0 -${h * 0.36}Z`}
          fill={k}
        />
      ))}
      <path d={hills(w, h * 0.88, h * 0.04, 4, 0)} fill={k} />
    </>
  ),
  still: (w, h, [p, a, b, k]) => (
    <>
      <rect width={w} height={h} fill={p} />
      <rect y={h * 0.64} width={w} height={h} fill={a} opacity=".85" />
      <path
        d={`M${w * 0.33} ${h * 0.42}q${w * 0.09} 0 ${w * 0.07} ${h * 0.09}q-${w * 0.02} ${h * 0.06} -${w * 0.08} ${h * 0.07}`}
        fill="none"
        stroke={k}
        strokeWidth="6"
      />
      <ellipse
        cx={w * 0.26}
        cy={h * 0.52}
        rx={w * 0.09}
        ry={h * 0.13}
        fill={b}
        stroke={k}
        strokeWidth="3"
      />
      <path
        d={`M${w * 0.22} ${h * 0.4}v-${h * 0.1}h${w * 0.08}v${h * 0.1}Z`}
        fill={b}
        stroke={k}
        strokeWidth="3"
      />
      <path
        d={`M${w * 0.19} ${h * 0.3}h${w * 0.14}`}
        stroke={k}
        strokeWidth="5"
      />
      <path
        d={`M${w * 0.44} ${h * 0.58}h${w * 0.4}a${w * 0.2} ${h * 0.1} 0 0 1 -${w * 0.4} 0Z`}
        fill={k}
      />
      {[0.54, 0.64, 0.74].map((x, i) => (
        <circle
          key={x}
          cx={w * x}
          cy={h * (0.56 - (i % 2) * 0.03)}
          r={Math.min(w, h) * 0.055}
          fill={i === 1 ? b : a}
          stroke={k}
          strokeWidth="2"
        />
      ))}
      <path d={`M0 ${h * 0.64}H${w}`} stroke={k} strokeWidth="3" />
    </>
  ),
  lantern: (w, h, [p, a, b, k]) => (
    <>
      <rect width={w} height={h} fill={k} />
      {[0.2, 0.46].map((y, j) => (
        <g key={y}>
          <path
            d={`M0 ${h * y}Q${w / 2} ${h * (y + 0.12)} ${w} ${h * y}`}
            fill="none"
            stroke={p}
            strokeWidth="1.5"
            opacity=".6"
          />
          {[0.12, 0.3, 0.5, 0.7, 0.88].map((x, i) => {
            const cy = h * y + h * 0.12 * (1 - Math.pow((x - 0.5) * 2, 2)) * 0.5
            return (
              <ellipse
                key={x}
                cx={w * x}
                cy={cy + h * 0.06}
                rx={w * 0.06}
                ry={h * 0.06}
                fill={[a, b, p][(i + j) % 3]}
              />
            )
          })}
        </g>
      ))}
      <path d={hills(w, h * 0.82, h * 0.03, 6, 0)} fill={b} opacity=".7" />
    </>
  ),
  windmill: (w, h, [p, a, b, k]) => (
    <>
      <rect width={w} height={h} fill={p} />
      <rect width={w} height={h * 0.6} fill={b} opacity=".35" />
      <path d={hills(w, h * 0.66, h * 0.08, 2, 1)} fill={a} />
      {[0.28, 0.56, 0.8].map((x, i) => {
        const s = 1 - i * 0.25
        const cx = w * x
        const base = h * (0.66 - 0.04 * (1 - i))
        const tw = w * 0.05 * s
        const th = h * 0.16 * s
        return (
          <g key={x}>
            <path
              d={`M${cx - tw} ${base}l${tw * 0.3} -${th}h${tw * 1.4}l${tw * 0.3} ${th}Z`}
              fill={p}
              stroke={k}
              strokeWidth="2"
            />
            <path
              d={`M${cx - tw * 0.8} ${base - th}l${tw * 0.8} -${th * 0.35} ${tw * 0.8} ${th * 0.35}Z`}
              fill={k}
            />
            <path
              d={`M${cx - th * 0.7} ${base - th - th * 0.5}L${cx + th * 0.7} ${base - th + th * 0.5}M${cx + th * 0.7} ${base - th - th * 0.5}L${cx - th * 0.7} ${base - th + th * 0.5}`}
              stroke={k}
              strokeWidth={3 * s}
            />
          </g>
        )
      })}
    </>
  ),
  grid: (w, h, [p, a, b, k]) => {
    const cols = w > h ? 3 : 2
    const rows = w > h ? 2 : 3
    const m = 10
    const cw = (w - m * (cols + 1)) / cols
    const ch = (h - m * (rows + 1)) / rows
    return (
      <>
        <rect width={w} height={h} fill={p} />
        {Array.from({ length: rows }, (_, j) =>
          Array.from({ length: cols }, (__, i) => {
            const x = m + i * (cw + m)
            const y = m + j * (ch + m)
            const n = i + j * cols
            return (
              <g key={n}>
                <rect
                  x={x}
                  y={y}
                  width={cw}
                  height={ch}
                  fill={p}
                  stroke={k}
                  strokeWidth="2.5"
                />
                <rect
                  x={x}
                  y={y + ch * 0.62}
                  width={cw}
                  height={ch * 0.38}
                  fill={n % 2 ? a : b}
                  opacity=".7"
                />
                {n % 3 === 0 ? (
                  <circle
                    cx={x + cw * 0.5}
                    cy={y + ch * 0.42}
                    r={Math.min(cw, ch) * 0.18}
                    fill={n % 2 ? b : a}
                  />
                ) : n % 3 === 1 ? (
                  <path
                    d={`M${x + cw * 0.3} ${y + ch * 0.62}l${cw * 0.2} -${ch * 0.36} ${cw * 0.2} ${ch * 0.36}Z`}
                    fill={k}
                  />
                ) : (
                  <rect
                    x={x + cw * 0.36}
                    y={y + ch * 0.3}
                    width={cw * 0.28}
                    height={ch * 0.32}
                    fill={n % 2 ? b : a}
                    stroke={k}
                    strokeWidth="2"
                  />
                )}
              </g>
            )
          }),
        )}
      </>
    )
  },
  flower: (w, h, [p, a, b, k]) => {
    const spots: Array<[number, number, number]> = [
      [0.24, 0.3, 1],
      [0.7, 0.24, 0.8],
      [0.5, 0.56, 1.2],
      [0.2, 0.76, 0.8],
      [0.8, 0.72, 1],
    ]
    const r = Math.min(w, h) * 0.07
    return (
      <>
        <rect width={w} height={h} fill={p} />
        {spots.map(([x, y, s], i) => (
          <g key={i} transform={`translate(${w * x} ${h * y}) scale(${s})`}>
            <path
              d={`M0 0q${r * 2} ${r * 2} ${r * 3.4} ${r * 0.6}q-${r * 2} -${r * 2.4} -${r * 3.4} -${r * 0.6}Z`}
              fill={b}
            />
            <path
              d={`M0 0q-${r * 2} ${r * 2} -${r * 3} ${r * 0.2}q${r * 1.8} -${r * 2.2} ${r * 3} -${r * 0.2}Z`}
              fill={b}
              opacity=".8"
            />
            {Array.from({ length: 6 }, (_, j) => {
              const t = (j * Math.PI) / 3
              return (
                <circle
                  key={j}
                  cx={Math.cos(t) * r}
                  cy={Math.sin(t) * r}
                  r={r * 0.7}
                  fill={a}
                />
              )
            })}
            <circle r={r * 0.55} fill={k} />
          </g>
        ))}
      </>
    )
  },
}

export function StandIn({
  pic,
  className = '',
}: {
  pic: Picture
  className?: string
}) {
  const [w, h] = BOX[pic.shape]
  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g filter="url(#mu-print)">{MOTIFS[pic.motif](w, h, pic.colors)}</g>
      <rect width={w} height={h} filter="url(#mu-grain)" opacity=".5" />
    </svg>
  )
}

// The filters the stand-ins share: edges a little uneven, as printed, and
// a grain of paper over them. Once on the page.
export function PrintDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="mu-print" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".06"
            numOctaves="2"
            seed="4"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
        </filter>
        <filter id="mu-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".9"
            numOctaves="2"
            seed="7"
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 .2  0 0 0 0 .15  0 0 0 0 .1  0 0 0 .35 0" />
        </filter>
      </defs>
    </svg>
  )
}
