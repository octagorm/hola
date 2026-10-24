import { memo } from 'react'
import { NX, NY, PARK, PLACES, SQUARE } from '../data/taxi'
import { LOT, MAP, PITCH, STREET, WALK, crossingXY, inGrid } from '../lib/taxi'
import type { Kind, Lot } from '../data/taxi'

// Taxi's map, drawn flat as a travel poster of the thirties would draw a
// town plan: terracotta roofs, sand pavements, slate streets, olive trees
// and a garden belt round it all. It stands in for the painting taxi/map
// until that is made (scripts/pictures.mjs), and under the painting only
// the streets are drawn (Roads), faintly, so that the taxi always drives on
// a street the player can see even if the painting is a little off. All in
// the town's units (lib/taxi.ts): the map is MAP square.

export const INK = {
  garden: '#a9b47a',
  lawn: '#9caf6c',
  tree: '#6c8a46',
  treeDark: '#4f6b3a',
  walk: '#ead6aa',
  road: '#68768a',
  line: '#f4ead3',
  roof: ['#cf6d45', '#d8885a', '#c35e3c', '#dc9a68'],
  roofShade: 'rgba(110, 40, 20, 0.28)',
  paving: '#eadfc4',
  water: '#79adb2',
  cream: '#f3e8cf',
  slate: '#53627a',
  green: '#3e8f68',
  plum: '#8a5a6b',
  red: '#c9583a',
}

const S2 = STREET / 2
// Where crossing i is, along either axis
const at = (i: number) => crossingXY(i, 0).x
const LO = at(0) - S2 - WALK
const HI = at(NX - 1) + S2 + WALK

// The four corners of a lot
const lotBox = (l: Lot) => {
  const x = at(l.bx) + S2 + WALK + (l.q & 1 ? LOT : 0)
  const y = at(l.by) + S2 + WALK + (l.q & 2 ? LOT : 0)
  return { x, y, s: LOT }
}

// A small hash, so that the same lot is always drawn the same
const hash = (a: number, b: number, c: number) =>
  ((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0

function Tree({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x + r * 0.25} cy={y + r * 0.3} r={r} fill={INK.treeDark} />
      <circle cx={x} cy={y} r={r} fill={INK.tree} />
      <circle
        cx={x - r * 0.3}
        cy={y - r * 0.3}
        r={r * 0.45}
        fill="#86a257"
        opacity={0.8}
      />
    </g>
  )
}

// The streets: the slate road, its centre line and the zebra crossings
function Streets({ faint = false }: { faint?: boolean }) {
  const a = at(0) - S2
  const b = at(NX - 1) + S2
  const parts: Array<React.ReactNode> = []
  for (let i = 0; i < NX; i++) {
    parts.push(
      <rect key={`v${i}`} x={at(i) - S2} y={a} width={STREET} height={b - a} />,
      <rect key={`h${i}`} x={a} y={at(i) - S2} width={b - a} height={STREET} />,
    )
  }
  const lines: Array<React.ReactNode> = []
  const zebras: Array<React.ReactNode> = []
  for (let i = 0; i < NX; i++)
    for (let j = 0; j < NY; j++) {
      const c = crossingXY(i, j)
      // the centre line to the next crossing east and south
      if (i < NX - 1)
        lines.push(
          <line
            key={`le${i}${j}`}
            x1={c.x + S2 + 3}
            x2={c.x + PITCH - S2 - 3}
            y1={c.y}
            y2={c.y}
          />,
        )
      if (j < NY - 1)
        lines.push(
          <line
            key={`ls${i}${j}`}
            x1={c.x}
            x2={c.x}
            y1={c.y + S2 + 3}
            y2={c.y + PITCH - S2 - 3}
          />,
        )
      // a zebra on each street that leaves the crossing
      for (const [dx, dy] of [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ])
        if (inGrid(i + dx, j + dy))
          for (let n = 0; n < 6; n++) {
            const across = -S2 + 1.2 + n * 2.5
            const near = S2 + 1
            zebras.push(
              dx === 0 ? (
                <rect
                  key={`z${i}${j}${dx}${dy}${n}`}
                  x={c.x + across}
                  y={dy < 0 ? c.y - near - 3.2 : c.y + near}
                  width={1.3}
                  height={3.2}
                />
              ) : (
                <rect
                  key={`z${i}${j}${dx}${dy}${n}`}
                  x={dx < 0 ? c.x - near - 3.2 : c.x + near}
                  y={c.y + across}
                  width={3.2}
                  height={1.3}
                />
              ),
            )
          }
    }
  return (
    <g opacity={faint ? 0.42 : 1}>
      <g fill={INK.road}>{parts}</g>
      <g
        stroke={INK.line}
        strokeWidth={0.7}
        strokeDasharray="3.5 3"
        opacity={0.85}
      >
        {lines}
      </g>
      <g fill={INK.line} opacity={0.9}>
        {zebras}
      </g>
    </g>
  )
}

// A house seen from above: a hipped roof of tiles, lit from the top left
function House({ l }: { l: Lot }) {
  const { x, y, s } = lotBox(l)
  const h = hash(l.bx, l.by, l.q)
  const g = 0.6
  const x0 = x + g
  const y0 = y + g
  const x1 = x + s - g
  const y1 = y + s - g
  // now and then a courtyard with a tree, inside the block's corner
  if (h % 7 === 3) {
    return (
      <g>
        <rect
          x={x0}
          y={y0}
          width={x1 - x0}
          height={y1 - y0}
          fill={INK.roof[1]}
        />
        <rect
          x={x0 + 5}
          y={y0 + 5}
          width={x1 - x0 - 10}
          height={y1 - y0 - 10}
          fill={INK.paving}
        />
        <Tree x={x + s / 2} y={y + s / 2} r={4.2} />
      </g>
    )
  }
  const fill = INK.roof[h % INK.roof.length]
  // one roof, or two side by side
  const split = h % 3 === 0
  const roofs = split
    ? h % 2
      ? [
          [x0, y0, x0 + (x1 - x0) / 2 - 0.3, y1],
          [x0 + (x1 - x0) / 2 + 0.3, y0, x1, y1],
        ]
      : [
          [x0, y0, x1, y0 + (y1 - y0) / 2 - 0.3],
          [x0, y0 + (y1 - y0) / 2 + 0.3, x1, y1],
        ]
    : [[x0, y0, x1, y1]]
  return (
    <g>
      {roofs.map(([a, b, c, d], k) => {
        const mx = (a + c) / 2
        const my = (b + d) / 2
        const w = c - a
        const hh = d - b
        // the ridge runs along the longer side; the faces to the right and
        // below are in shade, from the far corner round to the ridge
        const r =
          w >= hh
            ? [a + hh / 2, my, c - hh / 2, my]
            : [mx, d - w / 2, mx, b + w / 2]
        return (
          <g key={k}>
            <rect
              x={a}
              y={b}
              width={w}
              height={hh}
              fill={k ? INK.roof[(h + 1) % 4] : fill}
            />
            <polygon
              points={`${c},${b} ${c},${d} ${a},${d} ${r[0]},${r[1]} ${r[2]},${r[3]}`}
              fill={INK.roofShade}
            />
          </g>
        )
      })}
    </g>
  )
}

// A place: a building of its own kind, filling its lot
function Building({ kind, l }: { kind: Kind; l: Lot }) {
  const { x, y, s } = lotBox(l)
  const g = 0.6
  const x0 = x + g
  const y0 = y + g
  const w = s - 2 * g
  const cx = x + s / 2
  const cy = y + s / 2
  // which way the corner it stands on faces: toward the two streets
  const ox = l.q & 1 ? 1 : -1
  const oy = l.q & 2 ? 1 : -1
  // the edge of the lot on the street side, across and along
  const sx = ox > 0 ? x0 + w : x0
  const sy = oy > 0 ? y0 + w : y0
  switch (kind) {
    case 'bank':
      return (
        <g>
          <rect x={x0} y={y0} width={w} height={w} fill={INK.slate} />
          <rect
            x={x0 + 3}
            y={y0 + 3}
            width={w - 6}
            height={w - 6}
            fill="#6c7b93"
          />
          <rect x={cx - 4} y={cy - 4} width={8} height={8} fill="#a9c1c9" />
          {[0, 1, 2, 3, 4].map((n) => (
            <rect
              key={n}
              x={x0 + 2 + n * ((w - 5) / 4)}
              y={oy > 0 ? y0 + w - 2.2 : y0 + 0.8}
              width={1.4}
              height={1.4}
              fill={INK.cream}
            />
          ))}
        </g>
      )
    case 'bar':
      return (
        <g>
          <rect x={x0} y={y0} width={w} height={w} fill={INK.walk} />
          <rect
            x={ox > 0 ? x0 : x0 + w * 0.42}
            y={oy > 0 ? y0 : y0 + w * 0.42}
            width={w * 0.58}
            height={w * 0.58}
            fill={INK.roof[2]}
          />
          {[
            [0.2, 0.2],
            [0.2, 0.55],
            [0.55, 0.2],
          ].map(([a, b], n) => {
            const ux = ox > 0 ? x0 + w * (1 - a) : x0 + w * a
            const uy = oy > 0 ? y0 + w * (1 - b) : y0 + w * b
            return (
              <g key={n}>
                <circle cx={ux} cy={uy} r={3.4} fill={INK.red} />
                <circle cx={ux} cy={uy} r={2} fill={INK.cream} />
                <circle cx={ux} cy={uy} r={0.8} fill={INK.red} />
              </g>
            )
          })}
        </g>
      )
    case 'church':
      return (
        <g>
          <rect x={x0} y={y0} width={w} height={w} fill={INK.paving} />
          <rect
            x={cx - 4}
            y={y0 + 2}
            width={8}
            height={w - 4}
            fill={INK.cream}
          />
          <rect
            x={x0 + 3}
            y={cy - 4}
            width={w - 6}
            height={8}
            fill={INK.cream}
          />
          <rect
            x={cx - 4}
            y={y0 + 2}
            width={4}
            height={w - 4}
            fill="rgba(110,40,20,0.12)"
          />
          <circle cx={cx} cy={cy} r={4.6} fill="#c9a46a" />
          <circle cx={cx} cy={cy} r={2.2} fill="#e8cf96" />
          <rect
            x={cx - 3}
            y={oy > 0 ? y0 + w - 6.5 : y0 + 0.5}
            width={6}
            height={6}
            fill={INK.roof[2]}
          />
        </g>
      )
    case 'cinema':
      return (
        <g>
          <rect x={x0} y={y0} width={w} height={w} fill={INK.plum} />
          <rect
            x={x0 + 3}
            y={y0 + 3}
            width={w - 6}
            height={w - 6}
            fill="#9d6c7c"
          />
          {Array.from({ length: 8 }, (_, n) => (
            <rect
              key={n}
              x={x0 + n * (w / 8)}
              y={oy > 0 ? y0 + w - 3.4 : y0}
              width={w / 8}
              height={3.4}
              fill={n % 2 ? INK.cream : INK.red}
            />
          ))}
        </g>
      )
    case 'hotel':
      return (
        <g>
          <rect x={x0} y={y0} width={w} height={w} fill={INK.cream} />
          <rect
            x={x0 + 1.5}
            y={y0 + 1.5}
            width={w - 3}
            height={w - 3}
            fill="none"
            stroke="#d9c49c"
            strokeWidth={1}
          />
          <rect
            x={cx - 6}
            y={cy - 3.5}
            width={12}
            height={7}
            rx={1.2}
            fill="#6fb2bf"
            stroke="#f8f1df"
            strokeWidth={1}
          />
          <circle cx={x0 + 4} cy={y0 + 4} r={1.8} fill={INK.red} />
          <circle cx={x0 + w - 4} cy={y0 + w - 4} r={1.8} fill={INK.red} />
        </g>
      )
    case 'hospital':
      // an H, as hospitals were built round their gardens
      return (
        <g>
          <rect x={x0} y={y0} width={w} height={w} fill={INK.lawn} />
          <rect
            x={x0 + 1.5}
            y={y0 + 1.5}
            width={6}
            height={w - 3}
            fill="#f4efe2"
          />
          <rect
            x={x0 + w - 7.5}
            y={y0 + 1.5}
            width={6}
            height={w - 3}
            fill="#f4efe2"
          />
          <rect
            x={x0 + 7}
            y={cy - 2.5}
            width={w - 14}
            height={5}
            fill="#f4efe2"
          />
          <rect
            x={x0 + 4}
            y={y0 + 1.5}
            width={3.5}
            height={w - 3}
            fill="rgba(80,60,40,0.1)"
          />
        </g>
      )
    case 'pharmacy':
      return (
        <g>
          <rect x={x0} y={y0} width={w} height={w} fill="#e5d3b0" />
          <rect
            x={x0 + 2.5}
            y={y0 + 2.5}
            width={w - 5}
            height={w - 5}
            fill="#ecdfc3"
          />
          <g
            transform={`translate(${sx - ox * 5} ${sy - oy * 5})`}
            fill={INK.green}
          >
            <rect x={-1.4} y={-4} width={2.8} height={8} />
            <rect x={-4} y={-1.4} width={8} height={2.8} />
          </g>
        </g>
      )
    case 'market':
      return (
        <g>
          <rect x={x0} y={y0} width={w} height={w} fill={INK.cream} />
          {[0, 1, 2].map((r) =>
            Array.from({ length: 6 }, (_, n) => (
              <rect
                key={`${r}-${n}`}
                x={x0 + n * (w / 6)}
                y={y0 + 1 + r * (w / 3)}
                width={w / 6}
                height={w / 3 - 2}
                fill={n % 2 ? INK.cream : r === 1 ? '#5f8f7a' : INK.red}
              />
            )),
          )}
        </g>
      )
    case 'museum':
      return (
        <g>
          <rect x={x0} y={y0} width={w} height={w} fill={INK.cream} />
          <rect
            x={x0 + 6}
            y={y0 + 6}
            width={w - 12}
            height={w - 12}
            fill={INK.lawn}
          />
          {Array.from({ length: 4 }, (_, n) => {
            const t = x0 + 6 + (n * (w - 12)) / 3
            return (
              <g key={n} fill="#cdb98f">
                <circle cx={t} cy={y0 + 6} r={0.9} />
                <circle cx={t} cy={y0 + w - 6} r={0.9} />
                <circle cx={x0 + 6} cy={t} r={0.9} />
                <circle cx={x0 + w - 6} cy={t} r={0.9} />
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r={1.8} fill={INK.water} />
        </g>
      )
    case 'station':
      return (
        <g>
          <rect x={x0} y={y0} width={w} height={w} fill={INK.paving} />
          <rect
            x={x0 + 1.5}
            y={y0 + 2}
            width={w - 3}
            height={w - 4}
            rx={4}
            fill="#8fa9b2"
          />
          {Array.from({ length: 7 }, (_, n) => (
            <line
              key={n}
              x1={x0 + 2 + n * ((w - 4) / 6)}
              x2={x0 + 2 + n * ((w - 4) / 6)}
              y1={y0 + 2.5}
              y2={y0 + w - 2.5}
              stroke="#6f8a96"
              strokeWidth={0.6}
            />
          ))}
          <rect
            x={x0 + 1.5}
            y={cy - 1}
            width={w - 3}
            height={2}
            fill="#6f8a96"
          />
        </g>
      )
    default:
      return null
  }
}

// The town square: paving, a fountain, four trees
function Square() {
  const x = at(SQUARE.bx) + S2 + WALK
  const y = at(SQUARE.by) + S2 + WALK
  const s = 2 * LOT
  const c = s / 2
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} fill={INK.paving} />
      <rect
        x={x + 3}
        y={y + 3}
        width={s - 6}
        height={s - 6}
        fill="none"
        stroke="#dccaa3"
        strokeWidth={1.2}
      />
      <circle cx={x + c} cy={y + c} r={9} fill="#dccaa3" />
      <circle cx={x + c} cy={y + c} r={7} fill={INK.water} />
      <circle cx={x + c} cy={y + c} r={2} fill="#bfe0de" />
      {[
        [9, 9],
        [s - 9, 9],
        [9, s - 9],
        [s - 9, s - 9],
      ].map(([a, b]) => (
        <Tree key={`${a}-${b}`} x={x + a} y={y + b} r={5} />
      ))}
    </g>
  )
}

// The park: lawn, two paths across, trees
function Park() {
  const x = at(PARK.bx) + S2 + WALK
  const y = at(PARK.by) + S2 + WALK
  const s = 2 * LOT
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} fill={INK.lawn} />
      <g stroke="#e4d2a3" strokeWidth={3}>
        <line x1={x} y1={y} x2={x + s} y2={y + s} />
        <line x1={x + s} y1={y} x2={x} y2={y + s} />
      </g>
      <circle cx={x + s / 2} cy={y + s / 2} r={4.5} fill="#e4d2a3" />
      {[
        [10, s / 2],
        [s - 10, s / 2],
        [s / 2, 9],
        [s / 2, s - 9],
        [6, 6],
        [s - 6, s - 6],
      ].map(([a, b]) => (
        <Tree key={`${a}-${b}`} x={x + a} y={y + b} r={4.6} />
      ))}
    </g>
  )
}

// The garden belt round the town: lawn, a gravel walk round it, plane
// trees in rows
function Belt() {
  const trees: Array<React.ReactNode> = []
  const m = LO - 14
  const n = Math.round((HI + 14 - m) / 16)
  for (let k = 0; k <= n; k++) {
    const t = m + (k * (HI + 14 - m)) / n
    for (const [x, y] of [
      [t, m],
      [t, HI + 14],
      [m, t],
      [HI + 14, t],
    ])
      trees.push(<Tree key={`${x}-${y}`} x={x} y={y} r={5.5} />)
  }
  // a second, looser row further out
  for (let k = 0; k < 14; k++) {
    const t = 18 + k * ((MAP - 36) / 13)
    const h = hash(k, 3, 9)
    const off = 26 + (h % 7)
    for (const [x, y] of [
      [t, off],
      [t, MAP - off],
      [off, t],
      [MAP - off, t],
    ])
      trees.push(<Tree key={`o${x}-${y}`} x={x} y={y} r={4 + (h % 3)} />)
  }
  return (
    <g>
      <rect x={0} y={0} width={MAP} height={MAP} fill={INK.garden} />
      <rect
        x={LO - 6}
        y={LO - 6}
        width={HI - LO + 12}
        height={HI - LO + 12}
        fill="none"
        stroke="#ddc99a"
        strokeWidth={3}
      />
      {trees}
    </g>
  )
}

// The whole map, flat
export const FlatMap = memo(function FlatMap() {
  const lots: Array<React.ReactNode> = []
  for (let bx = 0; bx < NX - 1; bx++)
    for (let by = 0; by < NY - 1; by++) {
      if (bx === SQUARE.bx && by === SQUARE.by) continue
      if (bx === PARK.bx && by === PARK.by) continue
      for (const q of [0, 1, 2, 3] as const) {
        const l = { bx, by, q }
        const place = PLACES.find(
          (p) => p.lot.bx === bx && p.lot.by === by && p.lot.q === q,
        )
        lots.push(
          place ? (
            <Building key={`${bx}${by}${q}`} kind={place.kind} l={l} />
          ) : (
            <House key={`${bx}${by}${q}`} l={l} />
          ),
        )
      }
    }
  return (
    <svg
      className="tx-flat"
      viewBox={`0 0 ${MAP} ${MAP}`}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <Belt />
      <rect x={LO} y={LO} width={HI - LO} height={HI - LO} fill={INK.walk} />
      <Streets />
      <Square />
      <Park />
      {lots}
    </svg>
  )
})

// Only the streets, faint, over the painting
export const Roads = memo(function Roads() {
  return (
    <svg
      className="tx-flat"
      viewBox={`0 0 ${MAP} ${MAP}`}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <Streets faint />
    </svg>
  )
})

// The middle of a lot, for its sign
export const lotMiddle = (l: Lot) => {
  const { x, y, s } = lotBox(l)
  return { x: x + s / 2, y: y + s / 2 }
}

// The taxi from above, pointing up: a white car of Madrid with the red
// band on its front doors, its sign on the roof, and its indicators
export function Cab({ blink }: { blink: 'left' | 'right' | null }) {
  return (
    <svg
      className={`tx-cab ${blink ? `blink-${blink}` : ''}`}
      viewBox="-5 -8 10 16"
      aria-hidden="true"
    >
      <rect
        x={-4.3}
        y={-7.2}
        width={8.6}
        height={15}
        rx={2.4}
        fill="rgba(40,30,20,.25)"
      />
      <rect
        x={-4}
        y={-7.6}
        width={8}
        height={15}
        rx={2.3}
        fill="#fbf7ee"
        stroke="#3a3f52"
        strokeWidth={0.35}
      />
      {/* windscreen and rear window */}
      <path
        d="M-3.2 -3.6 Q0 -4.6 3.2 -3.6 L2.7 -1.6 L-2.7 -1.6Z"
        fill="#3c4a63"
      />
      <path d="M-2.8 4.3 L2.8 4.3 L3.1 5.6 Q0 6.3 -3.1 5.6Z" fill="#3c4a63" />
      {/* the red band, diagonally over the front doors */}
      <path d="M-4 -1.2 L-4 0.6 L-2.6 2.2 L-2.6 0.4Z" fill="#c9372c" />
      <path d="M4 -1.2 L4 0.6 L2.6 2.2 L2.6 0.4Z" fill="#c9372c" />
      {/* the roof sign */}
      <rect
        x={-1.6}
        y={0.2}
        width={3.2}
        height={1.6}
        rx={0.4}
        fill="#f1d27a"
        stroke="#3a3f52"
        strokeWidth={0.25}
      />
      {/* headlights */}
      <rect
        x={-3.3}
        y={-7.6}
        width={1.6}
        height={0.7}
        rx={0.3}
        fill="#ffe9a6"
      />
      <rect x={1.7} y={-7.6} width={1.6} height={0.7} rx={0.3} fill="#ffe9a6" />
      {/* indicators */}
      <circle className="ind left" cx={-3.6} cy={-6.6} r={0.8} />
      <circle className="ind left" cx={-3.6} cy={6.6} r={0.8} />
      <circle className="ind right" cx={3.6} cy={-6.6} r={0.8} />
      <circle className="ind right" cx={3.6} cy={6.6} r={0.8} />
    </svg>
  )
}
