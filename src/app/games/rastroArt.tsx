import { PICTURES } from '../data/pictures'
import { TABLE } from '../data/rastroLayout'
import type { ReactNode } from 'react'

// El Rastro is painted as travel posters (scripts/pictures.mjs, from
// data/rastro-prompts.ts): a background for each stall, each seller cut out
// in four faces, and each thing for sale cut out, laid over one another
// below. Until they are painted, the drawings that follow stand in.
//
// The drawings are a hand-coloured woodcut: a black line cut in the block and
// printed over flat washes laid on by hand, each a little off its line, on
// warm paper. Hatching for shade, white lines cut out of the black. A
// street of Madrid on a Sunday morning, a stall under its awning, the
// seller behind the table and the thing on the list in front.

export const INK = '#231c15'
export const PAPER = '#f4e9d0'

// The colourist's pots
const C = {
  sky: '#bccdd0',
  sun: '#e9bd52',
  ochre: '#c8932f',
  ochreL: '#dfb560',
  terra: '#b5523a',
  terraD: '#8c3a27',
  olive: '#6b7a3a',
  oliveD: '#4f5a2a',
  slate: '#4c6782',
  slateL: '#89a2b4',
  wood: '#93603a',
  woodL: '#b98a58',
  woodD: '#5e3b22',
  brass: '#d6a845',
  copper: '#bf6c3c',
  stone: '#d8c9a6',
  wall: '#2b221b',
  cream: '#efe2c0',
}

// --- The block and the brush ---

// A shape cut in the block and coloured by hand: the paper inside its
// line, the colour laid on a little off it, and the line over both
function Cut({
  d,
  c,
  w = 2.2,
  o = 1.1,
}: {
  d: string
  c?: string
  w?: number
  o?: number
}) {
  return (
    <>
      {c && <path d={d} fill={PAPER} />}
      {c && (
        <path
          d={d}
          fill={c}
          transform={`translate(${o} ${(o * 0.6).toFixed(2)})`}
        />
      )}
      {w > 0 && (
        <path
          d={d}
          fill="none"
          stroke={INK}
          strokeWidth={w}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </>
  )
}

// Lines cut on their own
function Ln({ d, w = 1.6, k = INK }: { d: string; w?: number; k?: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={k}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

// The shade of a shape, hatched
function Hatch({ d, o = 0.8 }: { d: string; o?: number }) {
  return <path d={d} fill="url(#ra-hatch)" opacity={o} />
}

// The patterns and the roughness every picture of the game draws on, once
// on the page
export function RastroDefs() {
  return (
    <svg className="ra-defs" aria-hidden="true" focusable="false">
      <defs>
        <pattern
          id="ra-hatch"
          width="4.5"
          height="4.5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-38)"
        >
          <line x1="0" y1="0" x2="0" y2="4.5" stroke={INK} strokeWidth="1.1" />
        </pattern>
        <pattern
          id="ra-cuts"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(8)"
        >
          <line
            x1="0"
            y1="3.5"
            x2="4.5"
            y2="3.5"
            stroke={PAPER}
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.4"
          />
        </pattern>
        <pattern
          id="ra-kilim"
          width="24"
          height="18"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0 4 L 6 1 L 12 4 L 18 1 L 24 4"
            fill="none"
            stroke={PAPER}
            strokeWidth="1.6"
          />
          <path d="M 6 11 L 9.5 7.5 L 13 11 L 9.5 14.5 Z" fill={INK} />
          <path d="M 18 11 L 21.5 7.5 L 25 11 L 21.5 14.5 Z" fill={PAPER} />
          <path d="M -6 11 L -2.5 7.5 L 1 11 L -2.5 14.5 Z" fill={PAPER} />
          <path d="M 0 17.5 H 24" stroke={INK} strokeWidth="1.2" />
        </pattern>
        <pattern
          id="ra-cobble"
          width="22"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <rect width="22" height="12" fill={C.stone} />
          <path
            d="M 2 5 C 2 1.5 9 1.5 9.5 5 C 9.5 7.5 2 7.5 2 5 Z M 13 5 C 13 1.5 20 1.5 20.5 5 C 20.5 7.5 13 7.5 13 5 Z M -3.5 11 C -3.5 7.5 3.5 7.5 4 11 C 4 13.5 -3.5 13.5 -3.5 11 Z M 7.5 11 C 7.5 7.5 14.5 7.5 15 11 C 15 13.5 7.5 13.5 7.5 11 Z M 18.5 11 C 18.5 7.5 25.5 7.5 26 11 C 26 13.5 18.5 13.5 18.5 11 Z"
            fill="none"
            stroke={INK}
            strokeWidth="1"
          />
        </pattern>
        <filter id="ra-rough" x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves="2"
            seed="11"
          />
          <feDisplacementMap
            in="SourceGraphic"
            scale="2.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="ra-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="4"
          />
          <feColorMatrix values="0 0 0 0 0.14  0 0 0 0 0.11  0 0 0 0 0.08  0.9 0 0 0 -0.32" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  )
}

// --- What is for sale, each in a box of 100 ---

// A point on a circle about (cx, cy), at an angle in degrees from the right,
// counted upwards
const at = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy - r * Math.sin(a)).toFixed(1)}`
}

function Fan() {
  const ribs = Array.from({ length: 11 }, (_, i) => 145 - i * 11)
  const leaf = `M ${at(50, 84, 22, 145)} L ${at(50, 84, 46, 145)} A 46 46 0 0 1 ${at(50, 84, 46, 35)} L ${at(50, 84, 22, 35)} A 22 22 0 0 0 ${at(50, 84, 22, 145)} Z`
  return (
    <>
      <Cut d={leaf} c={C.terra} />
      {ribs.slice(1, -1).map((deg) => (
        <Ln
          key={deg}
          d={`M ${at(50, 84, 22.5, deg)} L ${at(50, 84, 45.5, deg)}`}
          w={0.9}
        />
      ))}
      {[128, 106, 84, 62].map((deg, i) => (
        <g key={deg}>
          <circle
            cx={Number(at(50, 84, 34, deg).split(' ')[0])}
            cy={Number(at(50, 84, 34, deg).split(' ')[1])}
            r={i % 2 ? 3.4 : 4}
            fill={PAPER}
            stroke={INK}
            strokeWidth="1.1"
          />
          <circle
            cx={Number(at(50, 84, 34, deg).split(' ')[0])}
            cy={Number(at(50, 84, 34, deg).split(' ')[1])}
            r="1.2"
            fill={C.ochre}
          />
        </g>
      ))}
      <path
        d={`M ${at(50, 84, 48.5, 143)} A 48.5 48.5 0 0 1 ${at(50, 84, 48.5, 37)}`}
        fill="none"
        stroke={INK}
        strokeWidth="2.2"
        strokeDasharray="0.1 3.4"
        strokeLinecap="round"
      />
      {ribs.map((deg) => (
        <Ln
          key={deg}
          d={`M 50 84 L ${at(50, 84, deg === 145 || deg === 35 ? 46 : 22.5, deg)}`}
          w={deg === 145 || deg === 35 ? 2.6 : 1.5}
          k={deg === 145 || deg === 35 ? INK : C.woodD}
        />
      ))}
      <circle
        cx="50"
        cy="84"
        r="3.2"
        fill={C.brass}
        stroke={INK}
        strokeWidth="1.4"
      />
    </>
  )
}

const WARE_ART: Record<
  string,
  { draw: () => ReactNode; foot: number } | undefined
> = {
  libro: {
    foot: 88,
    draw: () => (
      <>
        <Cut d="M 74 17 L 82 22 L 80 90 L 72 86 Z" c={C.cream} w={2} />
        <Ln d="M 75.6 24 L 74.2 84 M 78.4 26 L 77 87" w={0.9} />
        <Cut d="M 28 13 L 75 17 L 73 86 L 26 83 Z" c={C.terra} />
        <Cut d="M 34 22 L 68 25 L 67 77 L 33 75 Z" w={1.3} />
        <Cut d="M 50.5 37 L 58 50 L 50 63 L 42.5 50 Z" c={C.brass} w={1.4} />
        <Ln
          d="M 37 28 L 41 28.4 M 64 30.6 L 60 30.2 M 37 70 L 41 70.3 M 63 72.8 L 59 72.5"
          w={1.2}
        />
        <Cut d="M 16 18 L 28 13 L 26 83 L 14 88 Z" c={C.terraD} />
        <Hatch d="M 16 18 L 28 13 L 26 83 L 14 88 Z" />
        <Ln
          d="M 15.6 30 L 27.6 25.6 M 15.2 44 L 27.2 39.6 M 14.8 58 L 26.8 53.6 M 14.4 72 L 26.4 67.6"
          w={2.2}
        />
      </>
    ),
  },
  mapa: {
    foot: 89,
    draw: () => (
      <>
        <Cut d="M 16 22 L 84 16 L 86 80 L 18 86 Z" c="#e8d5a2" />
        <Cut
          d="M 52 18.8 C 46 30 56 38 50 48 C 44 58 58 66 54 82.6 L 86 80 L 84 16 Z"
          c={C.slateL}
          w={0}
        />
        <Ln d="M 52 18.8 C 46 30 56 38 50 48 C 44 58 58 66 54 82.6" w={1.8} />
        <Ln
          d="M 63 30 q 3 -2.4 6 0 t 6 0 M 68 46 q 3 -2.4 6 0 t 6 0 M 61 62 q 3 -2.4 6 0 M 70 71 q 3 -2.4 6 0"
          w={1.1}
        />
        <path
          d="M 23 74 C 29 66 26 58 34 53 C 40 49 37 42 42 35"
          fill="none"
          stroke={C.terra}
          strokeWidth="1.8"
          strokeDasharray="3 2.6"
          strokeLinecap="round"
        />
        <circle
          cx="42.5"
          cy="34"
          r="2.8"
          fill={C.terra}
          stroke={INK}
          strokeWidth="1.2"
        />
        <Cut
          d="M 29 23 L 31 31 L 39 33 L 31 35 L 29 43 L 27 35 L 19 33 L 27 31 Z"
          c={C.brass}
          w={1.2}
        />
        <Cut
          d="M 11 21 C 11 18 19 18 19.5 21 L 22 86 C 22 89 14 89 13.5 86 Z"
          c="#d6bb82"
        />
        <Cut
          d="M 80 15 C 80 12 88 12 88.5 15 L 91 80 C 91 83 83 83 82.5 80 Z"
          c="#d6bb82"
        />
        <Hatch d="M 84.5 15 C 86.5 14 88 14.2 88.5 15 L 91 80 C 91 82 89 82.6 87.2 82.4 Z" />
      </>
    ),
  },
  disco: {
    foot: 84,
    draw: () => (
      <>
        <circle cx="64" cy="52" r="30" fill={INK} />
        {[25, 20.5, 16].map((r) => (
          <circle
            key={r}
            cx="64"
            cy="52"
            r={r}
            fill="none"
            stroke="#6a5e52"
            strokeWidth="0.9"
          />
        ))}
        <path
          d={`M ${at(64, 52, 26, 62)} A 26 26 0 0 1 ${at(64, 52, 26, 20)}`}
          fill="none"
          stroke={PAPER}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle
          cx="64"
          cy="52"
          r="9"
          fill={C.terra}
          stroke={INK}
          strokeWidth="1.4"
        />
        <circle cx="64" cy="52" r="1.6" fill={PAPER} />
        <Cut d="M 12 20 L 61 20 L 61 84 L 12 84 Z" c={C.ochreL} />
        <Cut
          d="M 37 33 C 45 33 50 39 50 46 C 50 53 45 59 37 59 C 29 59 24 53 24 46 C 24 39 29 33 37 33 Z"
          c={C.terra}
          w={1.6}
        />
        <Ln
          d="M 18 68 q 4 -4 8 0 t 8 0 t 8 0 t 8 0 t 4 -2 M 18 75 q 4 -4 8 0 t 8 0 t 8 0 t 8 0 t 4 -2"
          w={1.5}
        />
        <Ln d="M 18 26 L 30 26" w={2} />
        <Hatch d="M 52 20 L 61 20 L 61 84 L 52 84 Z" o={0.55} />
      </>
    ),
  },
  abanico: { foot: 87, draw: () => <Fan /> },
  sombrero: {
    foot: 76,
    draw: () => (
      <>
        <Cut
          d="M 7 66 C 7 55.5 93 55.5 93 66 C 93 76.5 7 76.5 7 66 Z"
          c="#3d352e"
        />
        <Cut
          d="M 29 64 L 30.5 42 L 69.5 42 L 71 64 C 62 68 38 68 29 64 Z"
          c="#3d352e"
        />
        <Cut
          d="M 30.5 42 C 30.5 36.5 69.5 36.5 69.5 42 C 69.5 47 30.5 47 30.5 42 Z"
          c="#51473e"
        />
        <Cut
          d="M 29.6 55 C 40 58.4 60 58.4 70.4 55 L 70.7 62.4 C 60 65.8 40 65.8 29.3 62.4 Z"
          c={C.terra}
          w={1.6}
        />
        <Ln d="M 35 47.5 L 35 52.5 M 38.5 48 L 38.5 52" w={1.3} k={PAPER} />
        <Ln d="M 15 64.5 C 22 61.5 30 60.6 36 60.4" w={1.2} k={PAPER} />
        <Ln d="M 70 71.6 C 78 71 84 69.6 87 68" w={1.1} k={PAPER} />
      </>
    ),
  },
  caja: {
    foot: 84,
    draw: () => (
      <>
        <Cut d="M 25 44 L 30 13 L 87 17 L 83 45 Z" c={C.woodD} />
        <Cut d="M 31 40 L 35 19 L 81 22.4 L 78 41.6 Z" c="#e4d3a8" w={1.4} />
        <Ln
          d="M 44 36 C 46 30 50 28 54 27 M 54 27 C 58 26 62 27 66 30"
          w={1.1}
          k={C.oliveD}
        />
        <circle
          cx="52"
          cy="28"
          r="3.6"
          fill={C.terra}
          stroke={INK}
          strokeWidth="1.1"
        />
        <circle
          cx="64"
          cy="31.5"
          r="2.8"
          fill={C.ochre}
          stroke={INK}
          strokeWidth="1"
        />
        <circle
          cx="43"
          cy="33"
          r="2.6"
          fill={C.terra}
          stroke={INK}
          strokeWidth="1"
        />
        <Cut d="M 16 50 L 26 44 L 87 44 L 75 50 Z" c="#3a2416" w={2} />
        <Cut
          d="M 30 46.2 L 66 46.2 L 66 48.6 L 30 48.6 Z"
          c={C.brass}
          w={0.9}
        />
        <Cut d="M 16 50 L 75 50 L 75 85 L 16 85 Z" c={C.wood} />
        <Cut d="M 75 50 L 87 44 L 87 77 L 75 85 Z" c={C.woodD} />
        <Hatch d="M 75 50 L 87 44 L 87 77 L 75 85 Z" />
        <Cut d="M 24 57.5 L 67 57.5 L 67 77.5 L 24 77.5 Z" w={1.2} />
        <Ln
          d="M 39 67.5 C 33 63 31 69 35 70 M 52 67.5 C 58 63 60 69 56 70"
          w={1.1}
          k={C.oliveD}
        />
        <circle
          cx="45.5"
          cy="67.5"
          r="4.2"
          fill={C.terra}
          stroke={INK}
          strokeWidth="1.2"
        />
        <circle cx="45.5" cy="67.5" r="1.2" fill={C.brass} />
        <Ln d="M 87 61 L 92 61" w={2.4} />
        <Cut
          d="M 92 54.5 C 97.5 54.5 97.5 67.5 92 67.5 C 94.6 64.5 94.6 57.5 92 54.5 Z"
          c={C.brass}
          w={1.4}
        />
      </>
    ),
  },
  lampara: {
    foot: 90,
    draw: () => (
      <>
        <Cut d="M 30 90 C 30 81.5 70 81.5 70 90 Z" c={C.brass} />
        <Cut d="M 46 84 L 46 55 L 54 55 L 54 84 Z" c={C.brass} />
        <Cut
          d="M 41.5 70 C 41.5 63.5 58.5 63.5 58.5 70 C 58.5 76.5 41.5 76.5 41.5 70 Z"
          c={C.brass}
        />
        <Ln d="M 51.5 58 L 51.5 66 M 51 74 L 51 82" w={1.1} k={PAPER} />
        <Cut d="M 33 17 L 67 17 L 84 51 L 16 51 Z" c={C.ochreL} />
        <Ln d="M 42 17 L 35 51 M 50 17 L 50 51 M 58 17 L 65 51" w={1.2} />
        <Hatch d="M 58 17 L 67 17 L 84 51 L 65 51 Z" />
        <Ln
          d={Array.from(
            { length: 17 },
            (_, i) => `M ${18 + i * 4} 51.5 L ${18 + i * 4} 58`,
          ).join(' ')}
          w={1.5}
          k={C.terra}
        />
        <Ln d="M 16 51 L 84 51" w={2.4} />
        <circle
          cx="50"
          cy="13"
          r="3.4"
          fill={C.brass}
          stroke={INK}
          strokeWidth="1.4"
        />
      </>
    ),
  },
  espejo: {
    foot: 93,
    draw: () => (
      <>
        <Cut
          d="M 50 3 C 57 3 61 8.5 57.5 13 C 55 10 45 10 42.5 13 C 39 8.5 43 3 50 3 Z"
          c={C.brass}
          w={1.6}
        />
        <Cut
          d="M 50 10 C 71 10 82 28 82 51 C 82 75 70 93 50 93 C 30 93 18 75 18 51 C 18 28 29 10 50 10 Z"
          c={C.brass}
        />
        <Hatch
          d="M 63 13.5 C 76 21 82 35 82 51 C 82 75 70 93 50 93 C 66 87 76 73 76 53 C 76 37 71 23 63 13.5 Z"
          o={0.6}
        />
        <Cut
          d="M 50 18 C 66 18 74 32 74 51 C 74 70 66 85 50 85 C 34 85 26 70 26 51 C 26 32 34 18 50 18 Z"
          c="#a9c0c8"
        />
        <Ln
          d="M 35 42 L 49 26 M 35 54 L 58 30 M 53 76 L 66 61"
          w={2}
          k={PAPER}
        />
        <Ln
          d="M 22 34 l 2.4 1 M 20.4 51 l 2.6 0 M 22.6 68 l 2.4 -1.2 M 77.4 34 l -2.4 1 M 79.6 51 l -2.6 0 M 77.4 68 l -2.4 -1.2"
          w={1.4}
        />
      </>
    ),
  },
  reloj: {
    foot: 93,
    draw: () => (
      <>
        <Cut d="M 10 84 L 90 84 L 92 92 L 8 92 Z" c={C.woodD} />
        <Cut d="M 18 84 L 18 52 C 18 22 82 22 82 52 L 82 84 Z" c={C.wood} />
        <Hatch d="M 69 35 C 77 39.5 82 45 82 52 L 82 84 L 74 84 L 74 52 C 74 45 72 39 69 35 Z" />
        <Cut d="M 46 23 C 46 16.5 54 16.5 54 23 Z" c={C.brass} w={1.4} />
        <circle
          cx="50"
          cy="54"
          r="22.5"
          fill={C.brass}
          stroke={INK}
          strokeWidth="2.2"
        />
        <circle
          cx="50"
          cy="54"
          r="17.5"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.8"
        />
        <Ln
          d={Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180
            const r1 = i % 3 ? 14.5 : 12.5
            return `M ${(50 + 16 * Math.sin(a)).toFixed(1)} ${(54 - 16 * Math.cos(a)).toFixed(1)} L ${(50 + r1 * Math.sin(a)).toFixed(1)} ${(54 - r1 * Math.cos(a)).toFixed(1)}`
          }).join(' ')}
          w={1.3}
        />
        <Ln d="M 50 54 L 50 42.5" w={2.4} />
        <Ln d="M 50 54 L 58.5 49.5" w={2.4} />
        <circle cx="50" cy="54" r="1.8" fill={INK} />
        <Cut d="M 14 92 L 22 92 L 21 96 L 15 96 Z" c={C.brass} w={1.2} />
        <Cut d="M 78 92 L 86 92 L 85 96 L 79 96 Z" c={C.brass} w={1.2} />
      </>
    ),
  },
  radio: {
    foot: 90,
    draw: () => (
      <>
        <Cut d="M 16 90 L 16 46 C 16 10 84 10 84 46 L 84 90 Z" c={C.wood} />
        <Hatch d="M 72.5 22 C 80 29 84 37 84 46 L 84 90 L 76 90 L 76 46 C 76 37 75 29 72.5 22 Z" />
        <Cut d="M 27 60 L 27 46 C 27 22 73 22 73 46 L 73 60 Z" c={C.ochreL} />
        <Ln
          d="M 38.5 26.5 L 38.5 60 M 50 22.5 L 50 60 M 61.5 26.5 L 61.5 60"
          w={3.2}
        />
        <Ln d="M 27 60 L 73 60" w={2.4} />
        <Cut d="M 35 80 A 15 15 0 0 1 65 80 Z" c={PAPER} w={1.8} />
        <Ln
          d={[160, 135, 110, 90, 70, 45, 20]
            .map((deg) => `M ${at(50, 80, 13, deg)} L ${at(50, 80, 10.4, deg)}`)
            .join(' ')}
          w={1}
        />
        <Ln d="M 50 80 L 56.5 70.5" w={1.5} k={C.terra} />
        <circle
          cx="25.5"
          cy="80"
          r="5"
          fill={C.woodD}
          stroke={INK}
          strokeWidth="1.8"
        />
        <circle
          cx="74.5"
          cy="80"
          r="5"
          fill={C.woodD}
          stroke={INK}
          strokeWidth="1.8"
        />
      </>
    ),
  },
}

// A thing for sale, alone, as the list shows it
export function WarePic({ id, className }: { id: string; className?: string }) {
  const art = WARE_ART[id]
  const img = painted(`rastro/ware-${id}`)
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      {img ? <image href={img} width="100" height="100" /> : art?.draw()}
    </svg>
  )
}

// A thing for sale set down at (x, foot), so wide
function WareAt({
  id,
  x,
  foot,
  size,
}: {
  id: string
  x: number
  foot: number
  size: number
}) {
  const art = WARE_ART[id]
  if (!art) return null
  const s = size / 100
  return (
    <g
      transform={`translate(${x - 50 * s} ${foot - art.foot * s}) scale(${s})`}
    >
      {art.draw()}
    </g>
  )
}

// --- Odds and ends of the market ---

function Pot({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Cut d="M -16 -20 L 16 -20 L 14 -3 C 12 1 -12 1 -14 -3 Z" c={C.copper} />
      <Hatch d="M 6 -20 L 16 -20 L 14 -3 C 13 -1 9 0 5 0 Z" o={0.7} />
      <Cut
        d="M -18 -22 C -18 -25 18 -25 18 -22 C 18 -19 -18 -19 -18 -22 Z"
        c={C.copper}
        w={1.8}
      />
      <Ln
        d="M -16 -16 C -22 -16 -22 -10 -15 -10 M 16 -16 C 22 -16 22 -10 15 -10"
        w={1.8}
      />
      <Ln d="M -9 -15 L -9 -6" w={1.2} k={PAPER} />
    </g>
  )
}

function Jug({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Cut
        d="M -8 -36 L 8 -36 L 6 -28 C 14 -22 15 -8 10 0 L -10 0 C -15 -8 -14 -22 -6 -28 Z"
        c={C.brass}
      />
      <Hatch
        d="M 4 -28 C 12 -22 13 -8 8 0 L 3 0 C 6 -8 7 -20 4 -28 Z"
        o={0.7}
      />
      <Ln d="M 8 -33 C 18 -33 18 -18 11 -14" w={2} />
      <Ln d="M -8 -36 L -12 -40" w={2} />
      <Ln d="M -5 -22 L -5 -8" w={1.3} k={PAPER} />
    </g>
  )
}

function Books({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Cut d="M -24 -8 L 22 -8 L 22 0 L -24 0 Z" c={C.slate} />
      <Cut d="M -20 -16 L 24 -16 L 24 -8 L -20 -8 Z" c={C.terra} />
      <Cut d="M -22 -23 L 18 -23 L 18 -16 L -22 -16 Z" c={C.olive} />
      <Ln
        d="M 18 -6 L 18 -2 M 20 -14 L 20 -10 M 14 -21 L 14 -18"
        w={1.1}
        k={PAPER}
      />
    </g>
  )
}

// A landscape in a gilt frame, leaning on the table
function Painting({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-7)`}>
      <Cut d="M -32 -60 L 32 -60 L 32 0 L -32 0 Z" c={C.brass} w={2.4} />
      <Cut d="M -25 -53 L 25 -53 L 25 -7 L -25 -7 Z" c={C.sky} w={1.6} />
      <Cut
        d="M -25 -24 C -14 -32 -2 -26 8 -30 C 16 -33 22 -28 25 -27 L 25 -7 L -25 -7 Z"
        c={C.olive}
        w={1.4}
      />
      <Cut
        d="M -25 -16 C -10 -20 6 -14 25 -18 L 25 -7 L -25 -7 Z"
        c={C.ochreL}
        w={1.2}
      />
      <Cut
        d="M -14 -26 C -18 -34 -14 -42 -9 -42 C -4 -42 -1 -34 -5 -27 Z"
        c={C.oliveD}
        w={1.2}
      />
      <Ln d="M -9 -27 L -9 -20" w={1.4} />
      <circle
        cx="14"
        cy="-43"
        r="4"
        fill={C.sun}
        stroke={INK}
        strokeWidth="1.1"
      />
      <Hatch d="M 26 -60 L 32 -60 L 32 0 L 26 0 Z" o={0.6} />
    </g>
  )
}

// A lady's silhouette in an oval frame, as antique dealers have them
function Portrait({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Ln d="M 0 -24 L 0 -18" w={1.2} k={PAPER} />
      <Cut
        d="M 0 -18 C 11 -18 15 -9 15 0 C 15 10 10 18 0 18 C -10 18 -15 10 -15 0 C -15 -9 -11 -18 0 -18 Z"
        c={C.brass}
        w={1.8}
      />
      <Cut
        d="M 0 -13 C 7.6 -13 10.4 -6.4 10.4 0 C 10.4 7 7 13 0 13 C -7 13 -10.4 7 -10.4 0 C -10.4 -6.4 -7.6 -13 0 -13 Z"
        c={C.cream}
        w={1.2}
      />
      <path
        d="M -6 13 C -6 8 -3 6.6 -1.6 6 C -3.4 4.6 -4 2.6 -3.4 0.4 L -5.4 -0.6 L -3.6 -2 C -4 -6 -1.6 -9 2 -9 C 6 -9 7.4 -5.6 6.4 -2.6 C 7.6 -1.6 7.6 0.6 6 1.6 C 6 4.6 5 6 4 6.6 C 7 7.6 8.4 10 8.6 12.6 C 4 14.4 -2 14.4 -6 13 Z"
        fill={INK}
      />
    </g>
  )
}

// A round clock on a wall
function WallClock({ x, y, r = 11 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={C.woodL} stroke={INK} strokeWidth="2" />
      <circle r={r * 0.72} fill={PAPER} stroke={INK} strokeWidth="1.3" />
      <Ln d={`M 0 0 L 0 ${-r * 0.55} M 0 0 L ${r * 0.4} ${r * 0.12}`} w={1.4} />
    </g>
  )
}

// --- The sellers ---

export type SellerId = 'paco' | 'rosa' | 'julian' | 'pilar'
export type Mood = 'wait' | 'good' | 'cross'

// The head, with whatever is behind it, on it and over it. In a box from
// -24 to 24 across, its top at 0.
const HEAD =
  'M 0 4 C 12 4 18 14 18 27 C 18 40 11 49 0 49 C -11 49 -18 40 -18 27 C -18 14 -12 4 0 4 Z'
const HEAD_SHADE =
  'M 6 6 C 14 9 18 17 18 27 C 18 40 11 49 2 49 C 9 44 12.5 36 12.5 27 C 12.5 18 10.5 11 6 6 Z'

function Head({
  skin,
  mood,
  talking,
  back,
  under,
  over,
}: {
  skin: string
  mood: Mood
  talking: boolean
  back?: ReactNode
  under?: ReactNode
  over?: ReactNode
}) {
  const happy = mood === 'good'
  const cross = mood === 'cross'
  return (
    <>
      {back}
      <Cut d="M -7 40 L -7 55 L 7 55 L 7 40 Z" c={skin} w={2} />
      <Cut d="M -16.6 23 C -22.5 21 -23 33 -16.6 33.5" c={skin} w={2} />
      <Cut d="M 16.6 23 C 22.5 21 23 33 16.6 33.5" c={skin} w={2} />
      <Cut d={HEAD} c={skin} />
      <Hatch d={HEAD_SHADE} o={0.55} />
      {under}
      {(happy || talking) && (
        <>
          <circle cx="-10.5" cy="34" r="3.3" fill={C.terra} opacity="0.35" />
          <circle cx="10.5" cy="34" r="3.3" fill={C.terra} opacity="0.35" />
        </>
      )}
      {happy ? (
        <Ln
          d="M -9.2 26.6 Q -6.5 23 -3.8 26.6 M 3.8 26.6 Q 6.5 23 9.2 26.6"
          w={1.8}
        />
      ) : (
        <>
          <ellipse cx="-6.5" cy="26" rx="1.9" ry="2.2" fill={INK} />
          <ellipse cx="6.5" cy="26" rx="1.9" ry="2.2" fill={INK} />
        </>
      )}
      <Ln
        d={
          cross
            ? 'M -10.5 18.6 L -3 21.6 M 3 21.6 L 10.5 18.6'
            : happy
              ? 'M -10 18.4 Q -6.5 15.6 -3 18.4 M 3 18.4 Q 6.5 15.6 10 18.4'
              : 'M -10 20 Q -6.5 18 -3 20 M 3 20 Q 6.5 18 10 20'
        }
        w={1.8}
      />
      <Ln
        d="M 0.6 25.5 C -0.8 30 -3 33 -1.2 34.6 C 0.4 35.6 2 35.2 3 34.2"
        w={1.5}
      />
      {talking ? (
        <>
          <ellipse
            className="ra-mo"
            cx="0"
            cy="41"
            rx="3.6"
            ry="3"
            fill="#5a2219"
            stroke={INK}
            strokeWidth="1.3"
          />
          <path
            className="ra-ms"
            d="M -4.5 40.6 Q 0 42 4.5 40.6"
            fill="none"
            stroke={INK}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      ) : happy ? (
        <path
          d="M -6 39 Q 0 47 6 39 Q 0 41.6 -6 39 Z"
          fill="#5a2219"
          stroke={INK}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      ) : (
        <Ln
          d={
            cross
              ? 'M -4.6 42.8 Q 0 39.4 4.6 42.8'
              : 'M -4.5 40.6 Q 0 41.8 4.5 40.6'
          }
          w={1.7}
        />
      )}
      {over}
    </>
  )
}

const BODY = 'M -46 114 C -46 78 -38 61 -16 54 L 16 54 C 38 61 46 78 46 114 Z'
const BODY_SHADE =
  'M 22 56.5 C 38 63 46 80 46 114 L 30 114 C 32 90 30 70 22 56.5 Z'

interface Look {
  skin: string
  back?: ReactNode
  under?: ReactNode
  over?: ReactNode
  body: ReactNode
}

const LOOKS: Record<SellerId, Look> = {
  // An old bookseller: a beret, a grey beard, shirtsleeves and a waistcoat
  paco: {
    skin: '#d9a57c',
    under: (
      <>
        <Cut
          d="M -16.6 29 C -17 43 -9 53.5 0 53.5 C 9 53.5 17 43 16.6 29 C 14 35 10 38 6 38.4 C 3 37 -3 37 -6 38.4 C -10 38 -14 35 -16.6 29 Z"
          c="#bdb6a8"
        />
        <Ln
          d="M -12 41 l 1 4 M -8 45.5 l 0.8 4 M -3.5 47.5 l 0.4 4 M 3.5 47.5 l -0.4 4 M 8 45.5 l -0.8 4 M 12 41 l -1 4"
          w={1}
        />
      </>
    ),
    over: (
      <>
        <Cut
          d="M -9 37 C -5 33.6 -1 34.4 0 36 C 1 34.4 5 33.6 9 37 C 5 39 1 38.2 0 37.6 C -1 38.2 -5 39 -9 37 Z"
          c="#9f988a"
          w={1.4}
        />
        <Cut d="M -18 12 L -16.4 27 L -13.6 14 Z" c="#bdb6a8" w={1.4} />
        <Cut d="M 18 12 L 16.4 27 L 13.6 14 Z" c="#bdb6a8" w={1.4} />
        <Cut
          d="M -21.5 14 C -25.5 3 -10 -6 4 -5 C 17 -4 26.5 4 21.5 14 C 10 9.4 -10 9.4 -21.5 14 Z"
          c="#2f2b29"
        />
        <Ln d="M 2 -5 L 3.4 -9.4" w={2.4} />
        <Ln d="M -13 2.4 C -7 -1.6 1 -2.6 8 -1.8" w={1.2} k={PAPER} />
      </>
    ),
    body: (
      <>
        <Cut d={BODY} c="#ece2cc" />
        <Cut
          d="M -44 114 C -44 80 -37 63 -17 55 L 0 84 L 0 114 Z"
          c="#3d4750"
        />
        <Cut d="M 44 114 C 44 80 37 63 17 55 L 0 84 L 0 114 Z" c="#3d4750" />
        <Hatch
          d="M 44 114 C 44 80 37 63 17 55 L 8 70 C 24 80 30 96 30 114 Z"
          o={0.7}
        />
        <Ln d="M -7 54 L -2 61 L 0 56.5 L 2 61 L 7 54" w={1.6} />
        <circle
          cx="0"
          cy="92"
          r="1.7"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1"
        />
        <circle
          cx="0"
          cy="102"
          r="1.7"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1"
        />
        <Ln
          d="M -36 84 C -30 86 -26 86 -22 84 M 36 84 C 30 86 26 86 22 84"
          w={1.2}
          k={PAPER}
        />
      </>
    ),
  },
  // A lively woman with a carnation in her hair and a shawl
  rosa: {
    skin: '#e3b28b',
    back: (
      <>
        <Cut d="M 4 -1 C 4 -11 22 -11 22 -1 C 22 8 4 8 4 -1 Z" c="#2a2220" />
        <Ln d="M 8 -4 C 11 -7 15 -7 18 -4" w={1} k={PAPER} />
      </>
    ),
    over: (
      <>
        <Cut
          d="M -19 25 C -21 6 -9 -1.5 1 -1.5 C 12 -1.5 21 7 19 25 C 17 15 11 10.6 1 10.6 C -9 10.6 -16 15 -19 25 Z"
          c="#2a2220"
        />
        <Ln
          d="M 0 0 C -8 1.5 -14 8 -16.4 17 M 2.4 0 C 10 1.5 15.4 8 17.4 17"
          w={1.1}
          k={PAPER}
        />
        <Cut
          d="M 17 1 C 15 -4 21 -7 24 -3 C 28 -4 30 2 26.4 4 C 28 8 22 11 20 7.6 C 16 9 13.6 4 17 1 Z"
          c={C.terra}
          w={1.5}
        />
        <Ln d="M 20.4 1 L 22.6 4.4 M 24 -0.6 L 21.4 3.6" w={1} />
        <Cut
          d="M 15 9 C 12 11 11 15 13.4 16 C 14 13 15.4 11 15 9 Z"
          c={C.olive}
          w={1.1}
        />
        <circle
          cx="-18"
          cy="37"
          r="3.6"
          fill="none"
          stroke={INK}
          strokeWidth="3"
        />
        <circle
          cx="-18"
          cy="37"
          r="3.6"
          fill="none"
          stroke={C.brass}
          strokeWidth="1.5"
        />
        <circle
          cx="18"
          cy="37"
          r="3.6"
          fill="none"
          stroke={INK}
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="37"
          r="3.6"
          fill="none"
          stroke={C.brass}
          strokeWidth="1.5"
        />
      </>
    ),
    body: (
      <>
        <Cut d={BODY} c="#d9a441" />
        <Cut
          d="M -46 98 C -46 74 -38 61 -16 54 L -6 66 L 0 75 L 6 66 L 16 54 C 38 61 46 74 46 98 C 30 93 14 94 0 106 C -14 94 -30 93 -46 98 Z"
          c={C.terra}
        />
        <Hatch
          d="M 24 58 C 38 64 46 76 46 98 C 40 96 34 95 30 95 C 32 82 30 68 24 58 Z"
          o={0.65}
        />
        {[
          [-30, 76],
          [-18, 88],
          [30, 76],
          [18, 88],
          [-36, 90],
          [36, 90],
        ].map(([x, y]) => (
          <g key={`${x} ${y}`}>
            <circle
              cx={x}
              cy={y}
              r="3.2"
              fill={PAPER}
              stroke={INK}
              strokeWidth="1"
            />
            <circle cx={x} cy={y} r="1" fill={C.ochre} />
          </g>
        ))}
        <Ln
          d="M -44 99 l -1 6 M -38 97.2 l -0.8 6 M -32 96 l -0.5 6 M -26 95.4 l -0.3 6 M -20 96 l 0 6 M -14 97.8 l 0.3 6 M -8 101 l 0.5 6 M 44 99 l 1 6 M 38 97.2 l 0.8 6 M 32 96 l 0.5 6 M 26 95.4 l 0.3 6 M 20 96 l 0 6 M 14 97.8 l -0.3 6 M 8 101 l -0.5 6"
          w={1.3}
        />
      </>
    ),
  },
  // An antique dealer: white hair, round spectacles, a bow tie
  julian: {
    skin: '#e6bc98',
    over: (
      <>
        <Cut
          d="M -18 23 C -19.4 8 -9 1 2 1 C 13 1 19.4 9 18 23 C 16 14 11 9 4 9 C -2 9 -7 7.4 -9 5 C -12 9 -16 14 -18 23 Z"
          c="#e4dfd2"
        />
        <Ln d="M -12 8 C -10 6 -8 5 -5 4.6 M 6 5 C 11 5.4 14.6 8 16 12" w={1} />
        <Cut
          d="M -9 36.4 C -5 33.4 -1 34.2 0 35.8 C 1 34.2 5 33.4 9 36.4 C 5 38.6 1 37.6 0 37.2 C -1 37.6 -5 38.6 -9 36.4 Z"
          c="#ece7db"
          w={1.3}
        />
        <circle
          cx="-6.6"
          cy="26"
          r="5.2"
          fill="#ffffff"
          fillOpacity="0.16"
          stroke={INK}
          strokeWidth="1.5"
        />
        <circle
          cx="6.6"
          cy="26"
          r="5.2"
          fill="#ffffff"
          fillOpacity="0.16"
          stroke={INK}
          strokeWidth="1.5"
        />
        <Ln
          d="M -1.4 25.4 Q 0 24.2 1.4 25.4 M -11.8 25 L -17 23.6 M 11.8 25 L 17 23.6"
          w={1.3}
        />
      </>
    ),
    body: (
      <>
        <Cut d={BODY} c="#7a5536" />
        <Cut d="M -13 54.5 L 0 86 L 13 54.5 Z" c="#efe6d2" w={1.8} />
        <Hatch d={BODY_SHADE} o={0.7} />
        <Ln
          d="M -13 54.5 L -6.4 70 L -11 73 L 0 88 M 13 54.5 L 6.4 70 L 11 73 L 0 88"
          w={1.8}
        />
        <Cut d="M 0 57.5 L -8.4 52.6 L -8.4 62.4 Z" c={C.terra} w={1.4} />
        <Cut d="M 0 57.5 L 8.4 52.6 L 8.4 62.4 Z" c={C.terra} w={1.4} />
        <circle
          cx="0"
          cy="57.5"
          r="2.1"
          fill={C.terraD}
          stroke={INK}
          strokeWidth="1.2"
        />
        <Cut
          d="M -32 76 L -22 76 L -23.6 71 L -27 73.4 L -30 70.6 Z"
          c={C.ochreL}
          w={1.3}
        />
        <Ln d="M -34 76 L -20 76" w={1.6} />
      </>
    ),
  },
  // An older woman: a grey bob, pearls, a cardigan and a red neckerchief
  pilar: {
    skin: '#e8c0a0',
    back: (
      <>
        <Cut
          d="M -21.4 37 C -25.6 12 -14 -1 0 -1 C 14 -1 25.6 12 21.4 37 C 17.4 39 15.4 35 15 30 L -15 30 C -15.4 35 -17.4 39 -21.4 37 Z"
          c="#c9c3b6"
        />
        <Ln
          d="M -22 20 C -23.4 26 -22.6 31 -20.4 35 M 22 20 C 23.4 26 22.6 31 20.4 35"
          w={1}
        />
      </>
    ),
    over: (
      <>
        <Cut
          d="M -18.4 23 C -20.4 6 -8 -0.4 2 -0.4 C 13 -0.4 20.4 8 18.4 23 C 15.4 14 8 11 0 13 C -6 14.4 -12.4 16.4 -18.4 23 Z"
          c="#c9c3b6"
        />
        <Ln
          d="M -14 12 C -11 9 -7 8.6 -3 9.4 M 4 5 C 9 5.4 13 8 15 11 M -19.4 30 C -21 33 -20.6 35 -19.6 36"
          w={1.1}
        />
        <circle
          cx="-17.6"
          cy="36.6"
          r="2.4"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.2"
        />
        <circle
          cx="17.6"
          cy="36.6"
          r="2.4"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.2"
        />
      </>
    ),
    body: (
      <>
        <Cut d={BODY} c={C.olive} />
        <Cut d="M -12 54.5 L 0 78 L 12 54.5 Z" c="#efe6d2" w={1.8} />
        <Hatch d={BODY_SHADE} o={0.7} />
        <Cut
          d="M -10 53 C -4 57.6 4 57.6 10 53 L 3.6 62.6 L 0 70 L -3.6 62.6 Z"
          c={C.terra}
          w={1.6}
        />
        <Ln d="M -12 54.5 L 0 80 L 12 54.5 M 0 80 L 0 114" w={1.8} />
        {[88, 98, 108].map((y) => (
          <circle
            key={y}
            cx="3.4"
            cy={y}
            r="1.8"
            fill={C.brass}
            stroke={INK}
            strokeWidth="1"
          />
        ))}
        <Ln d="M -38 92 L -24 92 L -24 104 M 38 92 L 24 92 L 24 104" w={1.4} />
      </>
    ),
  },
}

// A seller from the waist up, standing at (0, 0) at the top of their head
function SellerBust({
  who,
  mood,
  talking,
}: {
  who: SellerId
  mood: Mood
  talking: boolean
}) {
  const look = LOOKS[who]
  return (
    <g className={`ra-seller ${mood}`}>
      {look.body}
      <g className="ra-head">
        <Head
          skin={look.skin}
          mood={mood}
          talking={talking}
          back={look.back}
          under={look.under}
          over={look.over}
        />
      </g>
    </g>
  )
}

// A seller's face, for the lines they said
export function SellerFace({
  who,
  talking = false,
  className,
}: {
  who: SellerId
  talking?: boolean
  className?: string
}) {
  if (sellerPainted(who))
    return (
      <svg className={className} viewBox="90 20 300 300" aria-hidden="true">
        <SellerFrames who={who} mood="wait" talking={talking} w={480} />
      </svg>
    )
  const look = LOOKS[who]
  return (
    <svg className={className} viewBox="-31 -13 62 66" aria-hidden="true">
      <Head
        skin={look.skin}
        mood="wait"
        talking={talking}
        back={look.back}
        under={look.under}
        over={look.over}
      />
    </svg>
  )
}

// --- The paintings ---

// A painting's address, once it is painted
function painted(name: string) {
  return PICTURES.has(name) ? `/${name}.webp` : undefined
}

const sellerPainted = (who: SellerId) =>
  ['wait', 'talk', 'good', 'cross'].every((f) =>
    PICTURES.has(`rastro/${who}-${f}`),
  )

// A seller's cut-out, w wide from (0, 0), in the face of the mood, the
// mouth moving while they speak: the speaking face shown over the waiting
// one every other moment, and a bob for the other moods
function SellerFrames({
  who,
  mood,
  talking,
  w,
}: {
  who: SellerId
  mood: Mood
  talking: boolean
  w: number
}) {
  const h = (w * 560) / 480
  return (
    <g className={`ra-paint ${mood} ${talking ? 'talking' : ''}`}>
      <image href={`/rastro/${who}-${mood}.webp`} width={w} height={h} />
      {talking && mood === 'wait' && (
        <image
          className="ra-mo"
          href={`/rastro/${who}-talk.webp`}
          width={w}
          height={h}
        />
      )}
    </g>
  )
}

// The painted stall: its background, the seller behind the table and the
// thing for sale on it
function PaintedStall({
  bg,
  who,
  ware,
  mood,
  talking,
  className,
}: {
  bg: string
  who: SellerId | null
  ware: string | null
  mood: Mood
  talking: boolean
  className?: string
}) {
  const table = 240 * TABLE[who ?? 'street']
  const wareImg = ware && painted(`rastro/ware-${ware}`)
  return (
    <svg
      className={`ra-scene ${className ?? ''}`}
      viewBox="0 0 400 240"
      role="img"
      aria-label="En bod på El Rastro en søndagsmorgen"
    >
      <image href={bg} width="400" height="240" />
      {who && (
        <g key={who} transform={`translate(${130 - 54} ${table + 3 - 126})`}>
          <g className="ra-who">
            <SellerFrames who={who} mood={mood} talking={talking} w={108} />
          </g>
        </g>
      )}
      {ware && wareImg && (
        <g className="ra-ware">
          <image
            key={ware}
            href={wareImg}
            x={262 - 38}
            y={table + 12 - 76}
            width="76"
            height="76"
          />
        </g>
      )}
    </svg>
  )
}

// --- The stalls ---

const AWNING: Record<SellerId | 'none', string> = {
  paco: C.slate,
  rosa: C.terra,
  julian: C.olive,
  pilar: C.ochre,
  none: C.terra,
}

const CLOTH: Record<SellerId | 'none', string> = {
  paco: C.terra,
  rosa: C.slate,
  julian: C.ochre,
  pilar: C.slate,
  none: C.slate,
}

// What hangs at the back of each stall, either side of the seller: low on
// the left, high on the right, over the thing on the table
function Wall({ who }: { who: SellerId | 'none' }) {
  switch (who) {
    case 'paco':
      return (
        <>
          <Spines x={12} y={84} n={9} />
          <Shelf x={10} y={84} w={56} />
          <Spines x={14} y={116} n={8} />
          <Shelf x={10} y={116} w={56} />
          <Spines x={192} y={80} n={12} />
          <Shelf x={188} y={80} w={70} />
        </>
      )
    case 'rosa':
      return (
        <>
          <WareAt id="abanico" x={38} foot={108} size={58} />
          <WareAt id="abanico" x={232} foot={88} size={46} />
          <Ln d="M 38 79 L 38 72 M 232 66 L 232 60" w={1.2} k={PAPER} />
        </>
      )
    case 'julian':
      return (
        <>
          <Ln d="M 38 54 L 26 60 M 38 54 L 50 60" w={1.2} k={PAPER} />
          <g transform="translate(38 112) scale(0.9)">
            <Painting x={0} y={0} />
          </g>
          <Portrait x={236} y={78} />
        </>
      )
    case 'pilar':
      return (
        <>
          <WallClock x={36} y={76} r={13} />
          <WallClock x={58} y={104} r={8} />
          <WallClock x={214} y={70} r={9} />
          <WallClock x={242} y={80} r={12} />
        </>
      )
    default:
      return (
        <>
          <WallClock x={38} y={80} r={13} />
          <WareAt id="abanico" x={232} foot={88} size={46} />
          <g transform="translate(130 118)">
            <Painting x={0} y={0} />
          </g>
        </>
      )
  }
}

function Shelf({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <Cut
      d={`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + 4} L ${x} ${y + 4} Z`}
      c={C.woodL}
      w={1.6}
    />
  )
}

// Books on a shelf, spine by spine
function Spines({ x, y, n }: { x: number; y: number; n: number }) {
  const colours = [C.terra, C.ochre, C.slate, C.olive, C.terraD, C.cream]
  let left = x
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const w = 4 + ((i * 7) % 3)
        const h = 17 + ((i * 5) % 7)
        const lean = i % 5 === 3 ? 3 : 0
        const d = `M ${left} ${y} L ${left + w} ${y} L ${left + w + lean} ${y - h} L ${left + lean} ${y - h} Z`
        left += w + 0.6
        return (
          <g key={i}>
            <Cut d={d} c={colours[(i * 4) % colours.length]} w={1.3} o={0.6} />
          </g>
        )
      })}
    </>
  )
}

// Each seller's things, and what else is on their table
const STOCK: Record<SellerId | 'none', Array<string>> = {
  paco: ['libro', 'disco', 'mapa'],
  rosa: ['caja', 'sombrero', 'abanico'],
  julian: ['lampara', 'espejo'],
  pilar: ['radio', 'reloj'],
  none: ['libro', 'radio'],
}

function Table({ who, ware }: { who: SellerId | 'none'; ware: string | null }) {
  const [left, right] = STOCK[who].filter((id) => id !== ware)
  return (
    <>
      {left && <WareAt id={left} x={32} foot={153} size={44} />}
      {who === 'paco' && <Books x={84} y={153} s={0.8} />}
      {(who === 'rosa' || who === 'julian') && <Jug x={84} y={153} s={0.72} />}
      {who === 'pilar' && <Pot x={86} y={153} s={0.72} />}
      {right ? (
        <WareAt id={right} x={281} foot={153} size={36} />
      ) : who === 'julian' ? (
        <Pot x={283} y={153} s={0.66} />
      ) : (
        <Jug x={283} y={153} s={0.72} />
      )}
    </>
  )
}

// A white tent further down the street, on its two poles
function Tent({ x, y, w }: { x: number; y: number; w: number }) {
  const n = 4
  const step = w / n
  let edge = `M ${x} ${y + 10}`
  for (let i = 0; i < n; i++)
    edge += ` Q ${x + step * (i + 0.5)} ${y + 14.5} ${x + step * (i + 1)} ${y + 10}`
  return (
    <>
      <Ln
        d={`M ${x + 2} ${y + 11} L ${x + 2} ${y + 23} M ${x + w - 2} ${y + 11} L ${x + w - 2} ${y + 23}`}
        w={1.5}
      />
      <Ln d={`M ${x + 5} ${y + 18} L ${x + w - 5} ${y + 18}`} w={2.4} />
      <Cut
        d={`M ${x} ${y + 10} L ${x + 7} ${y} L ${x + w - 7} ${y} L ${x + w} ${y + 10} Z`}
        c={PAPER}
        w={1.5}
      />
      <Ln
        d={`M ${x + w / 2 - 4} ${y} L ${x + w / 2 - 6} ${y + 10} M ${x + w / 2 + 4} ${y} L ${x + w / 2 + 6} ${y + 10}`}
        w={0.9}
      />
      <Cut d={`${edge} Z`} c={PAPER} w={1.3} />
    </>
  )
}

// The street beyond the stall: the sky of a Sunday morning, a church's
// dome and towers, the houses, and the white tents further down
function Street() {
  return (
    <>
      <rect x="0" y="0" width="400" height="160" fill={C.sky} />
      <Ln
        d="M 290 8 H 330 M 344 8 H 398 M 300 15 H 322 M 362 15 H 398 M 286 63 H 296 M 372 26 H 398"
        w={1}
      />
      <circle
        cx="356"
        cy="22"
        r="9.5"
        fill={C.sun}
        stroke={INK}
        strokeWidth="1.8"
      />
      <Ln
        d={[0, 45, 90, 135, 180, 225, 270, 315]
          .map((deg) => `M ${at(356, 22, 12.5, deg)} L ${at(356, 22, 16, deg)}`)
          .join(' ')}
        w={1.4}
      />
      <Cut
        d="M 380 40 C 380 33 388 31 391 35 C 393 29 402 29 404 34 L 404 42 L 382 42 C 380 42 380 41 380 40 Z"
        c={PAPER}
        w={1.4}
      />
      {/* the church: towers, the front, the drum and the dome */}
      <Cut d="M 297 64 L 303.5 44 L 310 64 Z" c={C.slate} w={1.8} />
      <Cut d="M 362 64 L 368.5 44 L 375 64 Z" c={C.slate} w={1.8} />
      <Ln
        d="M 303.5 44 L 303.5 38 M 301.6 40 L 305.4 40 M 368.5 44 L 368.5 38 M 366.6 40 L 370.4 40"
        w={1.3}
      />
      <Cut d="M 296 64 L 311 64 L 311 140 L 296 140 Z" c="#e1c88f" w={1.8} />
      <Cut d="M 361 64 L 376 64 L 376 140 L 361 140 Z" c="#e1c88f" w={1.8} />
      <Cut d="M 311 94 L 361 94 L 361 140 L 311 140 Z" c="#e8d3a2" w={1.8} />
      <Cut d="M 314 78 L 358 78 L 358 94 L 314 94 Z" c="#e1c88f" w={1.6} />
      <Cut d="M 314 79 C 314 52 358 52 358 79 Z" c={C.slate} w={1.9} />
      <Ln
        d="M 326 58.6 C 324 66 324 72 325 79 M 336 55 L 336 79 M 346 58.6 C 348 66 348 72 347 79"
        w={1.1}
        k={PAPER}
      />
      <Cut d="M 332 50 L 340 50 L 340 56 L 332 56 Z" c="#e1c88f" w={1.3} />
      <Cut d="M 331 50 C 331 44 341 44 341 50 Z" c={C.slate} w={1.3} />
      <Ln d="M 336 44.6 L 336 37 M 333.4 40 L 338.6 40" w={1.3} />
      <Ln
        d="M 320 90 L 320 84 M 329 90 L 329 84 M 343 90 L 343 84 M 352 90 L 352 84"
        w={2}
      />
      <Cut
        d="M 328 140 L 328 118 C 328 108 344 108 344 118 L 344 140 Z"
        c={C.wall}
        w={1.6}
      />
      <Ln
        d="M 300.6 76 L 300.6 84 M 306.4 76 L 306.4 84 M 365.6 76 L 365.6 84 M 371.4 76 L 371.4 84 M 303.5 104 L 303.5 114 M 368.5 104 L 368.5 114"
        w={2.2}
      />
      <Ln d="M 317 104 L 317 112 M 355 104 L 355 112" w={2.2} />
      {/* the houses: ochre, and terracotta at the edge */}
      <Cut d="M 378 30 L 404 30 L 404 140 L 378 140 Z" c={C.terra} w={1.9} />
      <Hatch d="M 378 30 L 382 30 L 382 140 L 378 140 Z" o={0.7} />
      {[48, 76, 104].map((y) => (
        <g key={y}>
          <Cut
            d={`M 386 ${y} L 396 ${y} L 396 ${y + 14} L 386 ${y + 14} Z`}
            c={C.wall}
            w={1.3}
          />
          <Ln
            d={`M 383 ${y + 14} L 399 ${y + 14} M 384 ${y + 14} L 384 ${y + 19} M 388 ${y + 14} L 388 ${y + 19} M 392 ${y + 14} L 392 ${y + 19} M 396 ${y + 14} L 396 ${y + 19} M 383 ${y + 19} L 399 ${y + 19}`}
            w={1.1}
          />
        </g>
      ))}
      <Cut d="M 262 72 L 296 72 L 296 140 L 262 140 Z" c={C.ochreL} w={1.9} />
      {[82, 108].map((y) => (
        <g key={y}>
          <Cut
            d={`M 272 ${y} L 281 ${y} L 281 ${y + 13} L 272 ${y + 13} Z`}
            c={C.wall}
            w={1.3}
          />
          <Ln
            d={`M 269 ${y + 13} L 284 ${y + 13} M 269 ${y + 17} L 284 ${y + 17}`}
            w={1.1}
          />
        </g>
      ))}
      {/* the tents further down, and one early buyer */}
      <rect x="262" y="132" width="142" height="30" fill={C.stone} />
      <Ln d="M 262 132 H 404" w={1.6} />
      <Tent x={276} y={118} w={36} />
      <Tent x={346} y={121} w={38} />
      <Cut
        d="M 326 125 C 326 122 330 122 330 125 C 330 128 326 128 326 125 Z"
        c="#d9a57c"
        w={1.2}
      />
      <Cut
        d="M 323.6 124 L 332.4 124 L 331 121.6 L 325 121.6 Z"
        c={INK}
        w={1}
      />
      <Cut
        d="M 324 128 L 332 128 L 333.4 144 L 322.6 144 Z"
        c={C.slate}
        w={1.3}
      />
      {/* a plane tree over the stall's corner */}
      <Cut
        d="M 246 46 C 230 40 236 14 254 14 C 258 -2 288 -6 294 10 C 310 8 316 30 302 40 C 300 50 280 52 270 46 C 262 52 252 52 246 46 Z"
        c={C.olive}
      />
      <Hatch
        d="M 282 44 C 296 46 300 40 302 34 C 308 26 306 16 296 14 C 300 24 296 36 282 44 Z"
        o={0.75}
      />
      <Ln
        d="M 254 30 q 4 -4 8 0 M 268 20 q 4 -4 8 0 M 280 32 q 4 -4 8 0 M 262 40 q 3 -3 6 0"
        w={1.2}
        k={PAPER}
      />
      <Ln d="M 276 46 L 278 72" w={4} />
    </>
  )
}

// The awning over the stall, in stripes, with a scalloped edge
function Awning({ c }: { c: string }) {
  const n = 16
  const x0 = -6
  const sw = 17
  const x1 = x0 + n * sw
  return (
    <>
      <g transform="translate(1.1 0.7)">
        {Array.from({ length: n }, (_, i) => (
          <path
            key={i}
            d={`M ${x0 + i * sw} -4 L ${x0 + (i + 1) * sw} -4 L ${x0 + (i + 1) * sw} 38 L ${x0 + i * sw} 38 Z`}
            fill={i % 2 ? PAPER : c}
          />
        ))}
      </g>
      <Ln d={`M ${x0} 7 H ${x1} M ${x0} 14 H ${x1}`} w={1} />
      <Hatch d={`M ${x0} 27 L ${x1} 27 L ${x1} 38 L ${x0} 38 Z`} o={0.55} />
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + i * sw
        return (
          <g key={i}>
            <Cut
              d={`M ${x} 38 L ${x + sw} 38 L ${x + sw} 45 Q ${x + sw / 2} 56 ${x} 45 Z`}
              c={i % 2 ? PAPER : c}
              w={1.8}
            />
          </g>
        )
      })}
      <Ln d={`M ${x0} 38 H ${x1}`} w={2.6} />
    </>
  )
}

// The scene at a stall: the street, the stall, its seller (none on the
// way in), and the thing on the list on the table
export function StallScene({
  who,
  ware,
  mood = 'wait',
  talking = false,
  className,
}: {
  who: SellerId | null
  ware: string | null
  mood?: Mood
  talking?: boolean
  className?: string
}) {
  const w = who ?? 'none'
  const bg = painted(who ? `rastro/stall-${who}` : 'rastro/street')
  if (
    bg &&
    (!who || sellerPainted(who)) &&
    (!ware || painted(`rastro/ware-${ware}`))
  )
    return (
      <PaintedStall
        bg={bg}
        who={who}
        ware={ware}
        mood={mood}
        talking={talking}
        className={className}
      />
    )
  return (
    <svg
      className={`ra-scene ${className ?? ''}`}
      viewBox="0 0 400 240"
      role="img"
      aria-label="En bod på El Rastro en søndagsmorgen"
    >
      <g filter="url(#ra-rough)">
        <Street />
        {/* the cobbles in front */}
        <rect x="262" y="160" width="142" height="84" fill="url(#ra-cobble)" />
        <Ln d="M 262 160 H 404" w={1.8} />
        {/* the back of the stall */}
        <rect x="4" y="40" width="262" height="112" fill={C.wall} />
        <rect x="4" y="40" width="262" height="112" fill="url(#ra-cuts)" />
        <Ln
          d="M 48 50 V 150 M 112 50 V 150 M 176 50 V 150 M 236 50 V 150"
          w={0.8}
          k="#5d4a3a"
        />
        <Wall who={w} />
        {/* the seller, behind the table */}
        {who && (
          <g key={who} transform="translate(120 63) scale(1.08)">
            <g className="ra-who">
              <SellerBust who={who} mood={mood} talking={talking} />
            </g>
          </g>
        )}
        <Awning c={AWNING[w]} />
        <Cut d="M 0 38 L 7 38 L 7 152 L 0 152 Z" c={C.wood} w={1.8} />
        <Cut d="M 259 38 L 266 38 L 266 152 L 259 152 Z" c={C.wood} w={1.8} />
        {/* the table: its top, and the cloth hanging from it */}
        <Cut d="M -4 146 L 300 146 L 306 158 L -4 158 Z" c={C.woodL} w={2} />
        <Ln d="M 20 150 H 90 M 120 153 H 200 M 230 150 H 280" w={0.9} />
        <Cut d="M -4 158 L 306 158 L 306 244 L -4 244 Z" c={CLOTH[w]} w={2} />
        <rect
          x="-4"
          y="171"
          width="310"
          height="73"
          fill="url(#ra-kilim)"
          opacity="0.9"
        />
        <Ln d="M -4 171 H 306 M -4 166 H 306" w={1.4} />
        <Hatch d="M 280 158 L 306 158 L 306 244 L 280 244 Z" o={0.55} />
        <Table who={w} ware={ware} />
        {ware && (
          <g className="ra-ware">
            <WareAt id={ware} x={206} foot={155} size={80} />
          </g>
        )}
        {/* in front, on the cobbles */}
        <Painting x={352} y={234} />
        <Jug x={394} y={238} s={0.9} />
      </g>
      <rect width="400" height="240" filter="url(#ra-grain)" opacity="0.5" />
    </svg>
  )
}
