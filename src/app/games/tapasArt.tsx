import { PICTURES } from '../data/pictures'
import {
  BAR,
  COUNTER_AT,
  FACES,
  FRAME,
  GUEST_W,
  SCENE_H,
  SCENE_W,
  guestFace,
  itemPicture,
} from '../data/tapasLayout'
import type { ReactNode } from 'react'

// Tapas is painted as travel posters (scripts/pictures.mjs, from
// data/tapas-prompts.ts): the bar seen from behind its counter, each guest
// cut out in four faces, and each drink and dish cut out, laid over one
// another below. Until they are painted, the drawings that follow stand in.
//
// The drawings are in the clean lines of a ligne claire comic: an even
// black outline and flat colours, no shading but a second flat tone. The
// bar (hams on the beam, the green lamp, bottles on the shelves, azulejos
// to shoulder height, a steel counter), the four regulars who order at it,
// and every drink and dish, each drawn in a box of 64.

const OUT = '#1d1a17'
const WHITE = '#fffdf7'

// --- The drinks and dishes ---

const plate = (cy = 48, rx = 28, ry = 9) => (
  <>
    <ellipse cx="32" cy={cy} rx={rx} ry={ry} fill={WHITE} />
    <ellipse
      cx="32"
      cy={cy - 1.5}
      rx={rx - 7}
      ry={ry - 3.4}
      fill="none"
      strokeWidth="1.2"
    />
  </>
)

// A clay dish, cazuela, its rim and what is in it
const cazuela = (inside: string, food: ReactNode) => (
  <>
    <path d="M6 38c0 11 11 17 26 17s26-6 26-17z" fill="#b65a2e" />
    <ellipse cx="32" cy="38" rx="26" ry="9" fill="#d07a43" />
    <ellipse cx="32" cy="38" rx="21" ry="6.5" fill={inside} />
    {food}
  </>
)

// A glass of wine, its bowl filled with `wine`
const wineGlass = (wine: string, x = 32) => (
  <g transform={`translate(${x - 32} 0)`}>
    <path d="M21 8h22c0 15-4 24-11 24S21 23 21 8z" fill={WHITE} stroke="none" />
    <path
      d="M22.4 17h19.2c-1 9.5-4.4 13.5-9.6 13.5S23.4 26.5 22.4 17z"
      fill={wine}
      stroke="none"
    />
    <path d="M21 8h22c0 15-4 24-11 24S21 23 21 8z" fill="none" />
    <path d="M32 32v18" />
    <ellipse cx="32" cy="53" rx="10" ry="3" fill={WHITE} />
    <path d="M26 11c0 5 1 9 2.5 12" stroke={WHITE} strokeWidth="2" />
  </g>
)

const cup = (drink: string, extra?: ReactNode) => (
  <>
    <ellipse cx="32" cy="53" rx="23" ry="5.5" fill={WHITE} />
    <path d="M46 33c8-2 10 3 9 7s-5 6-10 6" fill="none" />
    <path
      d="M17 28h30l-2.6 17a6 6 0 0 1-6 5H25.6a6 6 0 0 1-6-5z"
      fill={WHITE}
    />
    <ellipse cx="32" cy="28" rx="15" ry="3.8" fill={drink} />
    {extra}
  </>
)

const ITEM_ART: Record<string, ReactNode> = {
  'el café': (
    <>
      <ellipse cx="32" cy="53" rx="21" ry="5" fill={WHITE} />
      <path d="M43 36c7-1 9 3 8 6s-4 5-9 5" fill="none" />
      <path
        d="M20 32h24l-2.4 14a5 5 0 0 1-5 4.3H27.4a5 5 0 0 1-5-4.3z"
        fill={WHITE}
      />
      <ellipse cx="32" cy="32" rx="12" ry="3.2" fill="#4a2814" />
      <path
        d="M28 25c-2-3 2-5 0-9M35 25c-2-3 2-5 0-9"
        strokeWidth="1.4"
        fill="none"
      />
    </>
  ),
  'el café con leche': (
    <>
      <path
        d="M18 14h28l-3 38a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4z"
        fill={WHITE}
        stroke="none"
      />
      <path
        d="M19.4 24h25.2l-2.4 28a3 3 0 0 1-3 3H24.8a3 3 0 0 1-3-3z"
        fill="#c4915e"
        stroke="none"
      />
      <path d="M19.4 24h25.2l-.5 6H19.9z" fill="#f4e3c7" stroke="none" />
      <path d="M18 14h28l-3 38a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4z" fill="none" />
      <path d="M40 4 33 40" strokeWidth="1.6" />
      <ellipse
        cx="33.5"
        cy="38"
        rx="3"
        ry="1.2"
        fill="#d9d4cc"
        strokeWidth="1.2"
      />
    </>
  ),
  'el té': cup(
    '#c27b2a',
    <>
      <path d="M37 28c2-7 5-11 11-13" fill="none" strokeWidth="1.2" />
      <rect
        x="45"
        y="9"
        width="10"
        height="11"
        rx="1.5"
        fill="#e6b43c"
        transform="rotate(14 50 14.5)"
      />
    </>,
  ),
  'el agua': (
    <>
      <path
        d="M27 9h10v6c0 3 6 5 6 11v25a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4V26c0-6 6-8 6-11z"
        fill="#d6ebf3"
      />
      <rect x="26" y="4" width="12" height="7" rx="1.5" fill="#2f6fb5" />
      <rect x="21" y="32" width="22" height="12" fill="#2f6fb5" />
      <path
        d="M24.5 38.5c3-2.5 5 2.5 8 0s5 2.5 7 0"
        stroke={WHITE}
        strokeWidth="1.6"
        fill="none"
      />
      <path d="M25 48v-2" stroke={WHITE} strokeWidth="2" />
    </>
  ),
  'el zumo': (
    <>
      <path
        d="M17 16h26l-3 36a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z"
        fill={WHITE}
        stroke="none"
      />
      <path
        d="M18.4 25h23.2l-2.3 27a3 3 0 0 1-3 3H23.7a3 3 0 0 1-3-3z"
        fill="#f39a2c"
        stroke="none"
      />
      <path d="M17 16h26l-3 36a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z" fill="none" />
      <circle cx="44" cy="17" r="9" fill="#f6b53d" />
      <circle cx="44" cy="17" r="6.4" fill="#fbd27a" strokeWidth="1.2" />
      <path
        d="M44 10.6v12.8M37.6 17h12.8M39.5 12.5l9 9M48.5 12.5l-9 9"
        stroke="#f39a2c"
        strokeWidth="1.1"
      />
    </>
  ),
  'la cerveza': (
    <>
      <path
        d="M28 7h8v9c0 4 7 6 7 13v22a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4V29c0-7 7-9 7-13z"
        fill="#7d4119"
      />
      <rect x="27" y="3.5" width="10" height="6" rx="1.5" fill="#e6b43c" />
      <rect x="21" y="31" width="22" height="13" fill="#f3e1b0" />
      <path d="M25 37.5h14" stroke="#c0392b" strokeWidth="2.4" />
      <path
        d="M38 22c2 2 2.5 4 2.5 6"
        stroke="#b9743f"
        strokeWidth="2"
        fill="none"
      />
    </>
  ),
  'la caña': (
    <>
      <path
        d="M21 22h22l-2.4 30a4 4 0 0 1-4 3.6h-9.2a4 4 0 0 1-4-3.6z"
        fill="#f2b233"
      />
      <path
        d="M19.5 23c-1.5-6 3.5-9 8-7 2-4 8-4 10 0 4.5-2 9 1 7 7z"
        fill={WHITE}
      />
      <g fill={WHITE} stroke="none">
        <circle cx="29" cy="34" r="1.3" />
        <circle cx="35" cy="40" r="1.1" />
        <circle cx="30" cy="46" r="1" />
      </g>
    </>
  ),
  'el vino': (
    <>
      <path d="M10 56V30c0-5 5-8 5-12V7h7v11c0 4 5 7 5 12v26z" fill="#2c4a37" />
      <rect x="11" y="32" width="15" height="12" fill="#efe3c4" />
      {wineGlass('#8e1f33', 40)}
    </>
  ),
  'el vino tinto': wineGlass('#7a1428'),
  'el vino blanco': wineGlass('#f0dc85'),
  'el tinto de verano': (
    <>
      <path
        d="M16 14h30l-3 38a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4z"
        fill={WHITE}
        stroke="none"
      />
      <path
        d="M17.3 22h27.4l-2.4 30a3 3 0 0 1-3 3H22.7a3 3 0 0 1-3-3z"
        fill="#c4364c"
        stroke="none"
      />
      <rect
        x="22"
        y="25"
        width="9"
        height="9"
        rx="1.5"
        fill="#f2e9ee"
        strokeWidth="1.3"
        transform="rotate(-10 26 29)"
      />
      <rect
        x="31"
        y="31"
        width="9"
        height="9"
        rx="1.5"
        fill="#f2e9ee"
        strokeWidth="1.3"
        transform="rotate(12 35 35)"
      />
      <path d="M16 14h30l-3 38a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4z" fill="none" />
      <path d="M40 8a9 9 0 0 1 9 9h-9z" fill="#f2d641" />
      <path
        d="M40 12a5 5 0 0 1 5 5"
        stroke="#fff6b8"
        strokeWidth="1.2"
        fill="none"
      />
    </>
  ),
  'el vermut': (
    <>
      <path
        d="M15 24h34l-3 26a5 5 0 0 1-5 4.4H23a5 5 0 0 1-5-4.4z"
        fill={WHITE}
        stroke="none"
      />
      <path
        d="M16.2 32h31.6l-2 18a4 4 0 0 1-4 3.4H22.2a4 4 0 0 1-4-3.4z"
        fill="#8c2a17"
        stroke="none"
      />
      <path
        d="M15 24h34l-3 26a5 5 0 0 1-5 4.4H23a5 5 0 0 1-5-4.4z"
        fill="none"
      />
      <path d="M24 46a8 8 0 0 1 16 0z" fill="#f39a2c" strokeWidth="1.4" />
      <path d="M44 8 28 40" strokeWidth="1.6" />
      <ellipse
        cx="38"
        cy="20"
        rx="4.5"
        ry="3.6"
        fill="#7d9a35"
        transform="rotate(-62 38 20)"
      />
      <circle cx="37" cy="20.6" r="1.3" fill="#d6402f" stroke="none" />
    </>
  ),
  'el refresco': (
    <>
      <path d="M44 4 36 28" strokeWidth="3.6" stroke={OUT} />
      <path d="M44 4 36 28" strokeWidth="1.8" stroke="#e8483a" />
      <path
        d="M18 14h28l-3 38a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4z"
        fill={WHITE}
        stroke="none"
      />
      <path
        d="M19.3 21h25.4l-2.4 31a3 3 0 0 1-3 3H24.7a3 3 0 0 1-3-3z"
        fill="#4a2617"
        stroke="none"
      />
      <g fill="#c9a084" stroke="none">
        <circle cx="27" cy="31" r="1.3" />
        <circle cx="35" cy="38" r="1.1" />
        <circle cx="29" cy="45" r="1.2" />
        <circle cx="37" cy="27" r="0.9" />
      </g>
      <path d="M18 14h28l-3 38a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4z" fill="none" />
      <path d="M17 14a7 7 0 0 1 12 0z" fill="#f2d641" strokeWidth="1.6" />
    </>
  ),
  'la tortilla': (
    <>
      {plate(47)}
      <path d="M14 42 42 27l10 13c-8 6-26 7-38 2z" fill="#d9a12c" />
      <path d="M14 42 42 27l10 13-38 2z" fill="#f4cf5a" />
      <g fill="#c8862c" stroke="none">
        <circle cx="34" cy="36" r="1.6" />
        <circle cx="25" cy="39" r="1.2" />
        <circle cx="43" cy="35" r="1.1" />
      </g>
      <path d="M38 8v26" strokeWidth="1.6" />
      <path d="M38 8l7 3-7 3" fill="#c0392b" strokeWidth="1.3" />
    </>
  ),
  'el jamón': (
    <>
      {plate(46, 29, 10)}
      {[
        ['M9 43c4-9 12-8 16-4s-6 10-12 9-6-3-4-5z', 'M13 43c3-3 7-3 9-1'],
        ['M22 37c5-8 14-7 18-2s-7 11-13 9-7-4-5-7z', 'M26 38c3-3 8-3 10-1'],
        ['M36 43c5-8 13-6 17-2s-6 10-12 9-7-4-5-7z', 'M40 43c3-2 7-2 9 0'],
      ].map(([d, fat]) => (
        <g key={d}>
          <path d={d} fill="#c43e4c" />
          <path d={fat} stroke={WHITE} strokeWidth="1.8" fill="none" />
        </g>
      ))}
    </>
  ),
  'el queso': (
    <>
      {plate(47)}
      {['10 44 26 28 30 42', '24 44 38 26 44 42', '38 44 50 30 56 43'].map(
        (p) => {
          const [ax, ay, bx, by, cx, cy] = p.split(' ').map(Number)
          return (
            <g key={p}>
              <path
                d={`M${ax} ${ay}L${bx} ${by}L${cx} ${cy}Z`}
                fill="#f3dc8c"
              />
              <path
                d={`M${bx} ${by}L${cx} ${cy}`}
                stroke="#5f4a2c"
                strokeWidth="3.2"
              />
              <path
                d={`M${bx} ${by}L${cx} ${cy}`}
                stroke="#8f7a52"
                strokeWidth="1"
                strokeDasharray="1.6 1.6"
              />
            </g>
          )
        },
      )}
    </>
  ),
  'la aceituna': cazuela(
    '#8e4220',
    <g>
      {[
        [22, 36],
        [31, 33],
        [40, 36],
        [26, 41],
        [36, 41],
        [45, 40],
        [18, 40],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x} cy={y} rx="4.6" ry="3.6" fill="#86a23a" />
          <ellipse
            cx={x - 1.4}
            cy={y - 1.2}
            rx="1.3"
            ry="0.8"
            fill="#d3e39a"
            stroke="none"
          />
        </g>
      ))}
    </g>,
  ),
  'la ensalada': (
    <>
      <path d="M6 34c0 13 12 20 26 20s26-7 26-20z" fill={WHITE} />
      <path
        d="M8 34c2-7 8-11 14-8 3-6 12-7 16-1 6-3 13 1 14 9z"
        fill="#5fa046"
      />
      <path
        d="M17 31c3-2 6-2 8 0M34 28c3-1 5 0 6 2"
        stroke="#2f6d27"
        strokeWidth="1.3"
        fill="none"
      />
      <circle cx="24" cy="33" r="5" fill="#d6402f" />
      <circle cx="24" cy="33" r="2.6" fill="#f07e6e" strokeWidth="1" />
      <circle cx="40" cy="31" r="5" fill="#d6402f" />
      <circle cx="40" cy="31" r="2.6" fill="#f07e6e" strokeWidth="1" />
      <ellipse
        cx="32"
        cy="27"
        rx="5"
        ry="3"
        fill="none"
        stroke="#efe6f0"
        strokeWidth="2.2"
      />
      <ellipse cx="32" cy="27" rx="5" ry="3" fill="none" strokeWidth="0.8" />
      <path d="M6 34h52" />
    </>
  ),
  'las patatas bravas': (
    <>
      {plate(47)}
      {[
        [14, 34],
        [22, 30],
        [31, 32],
        [40, 30],
        [18, 40],
        [27, 39],
        [36, 39],
        [44, 37],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <path d={`M${x} ${y}h8v7h-8z`} fill="#f0c060" />
          <path d={`M${x} ${y}l2-2h8l-2 2z`} fill="#f7dc8f" strokeWidth="1.4" />
        </g>
      ))}
      <path
        d="M15 33c6 4 10-3 15 1s9-4 13 0"
        stroke="#d0451f"
        strokeWidth="3.4"
        fill="none"
      />
      <g fill={WHITE} strokeWidth="1">
        <circle cx="24" cy="38" r="1.6" />
        <circle cx="37" cy="36" r="1.6" />
      </g>
    </>
  ),
  'los calamares': (
    <>
      {plate(47)}
      {[
        [17, 38],
        [27, 34],
        [37, 38],
        [22, 43],
        [32, 43],
        [42, 42],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x} cy={y} rx="6" ry="4.4" fill="#e8b45a" />
          <ellipse
            cx={x}
            cy={y}
            rx="2.6"
            ry="1.6"
            fill={WHITE}
            strokeWidth="1.2"
          />
        </g>
      ))}
      <path d="M44 30a8 8 0 0 1 10 6l-11 2z" fill="#f5d847" />
    </>
  ),
  'las croquetas': (
    <>
      {plate(47)}
      {[
        [11, 35],
        [23, 31],
        [35, 33],
        [17, 41],
        [30, 40],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="17" height="9" rx="4.5" fill="#d38b3a" />
          <g fill="#a8621f" stroke="none">
            <circle cx={x + 5} cy={y + 3} r="0.9" />
            <circle cx={x + 10} cy={y + 5.6} r="0.9" />
            <circle cx={x + 13} cy={y + 2.6} r="0.8" />
          </g>
        </g>
      ))}
      <path
        d="M48 38c3-4 6-3 6 0"
        stroke="#3f8a2e"
        strokeWidth="2"
        fill="none"
      />
    </>
  ),
  'las albóndigas': cazuela(
    '#b8321f',
    <g>
      {[
        [23, 35],
        [34, 34],
        [44, 37],
        [28, 41],
        [39, 41],
        [18, 40],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="5" fill="#7a4424" />
          <path
            d={`M${x - 2.4} ${y - 2}a3 3 0 0 1 3-1.6`}
            stroke="#a8693f"
            strokeWidth="1.3"
            fill="none"
          />
        </g>
      ))}
      <g fill="#4f9a3a" stroke="none">
        <circle cx="30" cy="36" r="1" />
        <circle cx="40" cy="38" r="1" />
        <circle cx="22" cy="42" r="1" />
      </g>
    </g>,
  ),
  'las gambas al ajillo': cazuela(
    '#e8b443',
    <g>
      {[
        [19, 37, -20],
        [32, 34, 10],
        [43, 38, 30],
        [26, 42, -5],
        [38, 43, 15],
      ].map(([x, y, r]) => (
        <g key={`${x}-${y}`} transform={`rotate(${r} ${x} ${y})`}>
          <path
            d={`M${x - 6} ${y}a6 5 0 0 1 12 0c0 2-2 3-4 2.4a3 3 0 0 0-4 0c-2 .6-4-.4-4-2.4z`}
            fill="#f08a5d"
          />
          <path
            d={`M${x - 2} ${y - 3.6}v2.6M${x + 1.6} ${y - 4}v2.8`}
            stroke="#c8603a"
            strokeWidth="1"
          />
        </g>
      ))}
      <g fill={WHITE} strokeWidth="1">
        <ellipse cx="27" cy="35" rx="2" ry="1.4" />
        <ellipse cx="44" cy="43" rx="2" ry="1.4" />
      </g>
      <path
        d="M14 42c3-2 6-1 8 1"
        stroke="#c62d1f"
        strokeWidth="2.4"
        fill="none"
      />
    </g>,
  ),
  'los pimientos de Padrón': (
    <>
      {plate(47)}
      {[
        [14, 40, -15],
        [26, 36, 8],
        [38, 40, -6],
        [20, 44, 12],
        [33, 45, -12],
      ].map(([x, y, r]) => (
        <g key={`${x}-${y}`} transform={`rotate(${r} ${x} ${y})`}>
          <path
            d={`M${x} ${y}c0-4 4-6 9-5s9 3 10 5c-2 2-6 3-10 3s-9-1-9-3z`}
            fill="#3f8a2e"
          />
          <path
            d={`M${x + 1} ${y - 1}c-2-1-3-3-2-5`}
            stroke="#6b8a2a"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            d={`M${x + 6} ${y - 2.4}c3-.6 6 0 8 1.2`}
            stroke="#7fbf5e"
            strokeWidth="1.2"
            fill="none"
          />
        </g>
      ))}
      <g fill={WHITE} stroke="none">
        <rect x="24" y="35" width="1.6" height="1.6" />
        <rect x="35" y="40" width="1.6" height="1.6" />
        <rect x="18" y="41" width="1.4" height="1.4" />
      </g>
    </>
  ),
  'el chorizo': (
    <>
      {plate(47)}
      <path
        d="M8 36c8-10 26-10 34-4 3 2 1 6-3 5-8-3-20-2-28 3-3 1-5-2-3-4z"
        fill="#a12a22"
      />
      {[
        [26, 41],
        [37, 42],
        [47, 39],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x} cy={y} rx="6.2" ry="4.4" fill="#c2382c" />
          <g fill="#f3c0b0" stroke="none">
            <circle cx={x - 2} cy={y - 1} r="0.9" />
            <circle cx={x + 2} cy={y + 1} r="0.9" />
            <circle cx={x + 1} cy={y - 2} r="0.7" />
            <circle cx={x - 2.4} cy={y + 1.6} r="0.7" />
          </g>
        </g>
      ))}
    </>
  ),
  'el pulpo': (
    <>
      <ellipse cx="32" cy="45" rx="28" ry="11" fill="#c58b4a" />
      <ellipse cx="32" cy="43" rx="28" ry="11" fill="#dba468" />
      {[
        [18, 41],
        [28, 38],
        [39, 40],
        [24, 46],
        [35, 46],
        [45, 45],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x} cy={y} rx="5" ry="3.8" fill="#f3e3dc" />
          <path
            d={`M${x - 5} ${y}a5 3.8 0 0 0 10 0`}
            stroke="#8a3a6a"
            strokeWidth="2.2"
            fill="none"
          />
        </g>
      ))}
      <g fill="#c8361f" stroke="none">
        <circle cx="22" cy="40" r="0.9" />
        <circle cx="31" cy="37" r="0.9" />
        <circle cx="41" cy="41" r="0.9" />
        <circle cx="27" cy="47" r="0.9" />
        <circle cx="38" cy="45" r="0.9" />
        <circle cx="47" cy="44" r="0.9" />
      </g>
      <path d="M30 38 26 24M42 40l5-14" strokeWidth="1.4" />
    </>
  ),
}

// A drink or a dish as painted or drawn, for a box of 64 placed where it
// is wanted
export function ItemShape({ id }: { id: string }) {
  if (ITEMS_PAINTED)
    return (
      <image
        href={painted(itemPicture(id))}
        x="2"
        y="2"
        width="60"
        height="60"
      />
    )
  return (
    <g
      stroke={OUT}
      strokeWidth="2.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {ITEM_ART[id]}
    </g>
  )
}

export function ItemPic({
  id,
  className = '',
}: {
  id: string
  className?: string
}) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <ItemShape id={id} />
    </svg>
  )
}

// --- The regulars ---

// wait, talk, happy and hmm, each a face on a painted guest's sheet
export type Mood = (typeof FACES)[number]

interface Look {
  skin: string
  hair: string
  // The hair, drawn behind the head and over it
  back?: ReactNode
  front: ReactNode
  body: ReactNode
  extra?: ReactNode
  // A beard, drawn under the mouth
  beard?: ReactNode
  // An older face: lines by the eyes
  old?: boolean
}

const SKIN_LINE = '#9a5a3c'

// Each guest drawn around the middle of their head, at 0 0, down to the
// counter's edge at 120
const LOOKS: Record<string, Look> = {
  Lucía: {
    skin: '#eab68f',
    hair: '#3b2416',
    back: (
      <>
        <path
          d="M18-30c22 2 28 22 22 44-3 10 2 22 8 28-13 1-22-8-24-22-2-13 4-30-6-50z"
          fill="#3b2416"
        />
        <path d="M17-25c4-2 8 0 9 4-4 3-8 3-11 0z" fill="#d6402f" />
      </>
    ),
    front: (
      <path
        d="M-27-4c-3-22 10-34 28-34 16 0 27 11 26 28-6-9-15-15-28-15-10 0-18 7-26 21z"
        fill="#3b2416"
      />
    ),
    body: (
      <>
        <path d="M-62 120c0-40 16-62 62-62s62 22 62 62z" fill="#e3a63a" />
        <path d="M-16 59 0 84 16 59" fill="#eab68f" />
        <path
          d="M-30 66c-4 18-4 36-2 54M30 66c4 18 4 36 2 54"
          fill="none"
          strokeWidth="1.6"
        />
      </>
    ),
    extra: (
      <>
        <circle
          cx="-27"
          cy="14"
          r="4.6"
          fill="none"
          stroke="#e6b43c"
          strokeWidth="2.2"
        />
        <circle
          cx="27"
          cy="14"
          r="4.6"
          fill="none"
          stroke="#e6b43c"
          strokeWidth="2.2"
        />
      </>
    ),
  },
  Manolo: {
    skin: '#d9a07a',
    hair: '#b9b4ac',
    old: true,
    front: (
      <>
        <path d="M-28 2c-2-9 0-15 5-18 1 7 1 13 0 19z" fill="#b9b4ac" />
        <path d="M28 2c2-9 0-15-5-18-1 7-1 13 0 19z" fill="#b9b4ac" />
        <path
          d="M-8-27c4-2 12-2 16 0"
          fill="none"
          stroke="#c98d68"
          strokeWidth="1.6"
        />
      </>
    ),
    body: (
      <>
        <path d="M-64 120c0-40 18-62 64-62s64 22 64 62z" fill="#2c3e63" />
        <path d="M-18 58 0 92 18 58z" fill={WHITE} />
        <path d="M-18 58-8 74 0 64 8 74 18 58" fill={WHITE} />
        <path d="M-22 60 0 106M22 60 0 106" fill="none" strokeWidth="1.6" />
        <path d="M-40 92h14" strokeWidth="1.6" />
      </>
    ),
    extra: (
      <path
        d="M-14 16c4-4 10-4 14-1 4-3 10-3 14 1-2 5-8 6-14 3-6 3-12 2-14-3z"
        fill="#d8d3cb"
      />
    ),
  },
  Carmen: {
    skin: '#f0c3a3',
    hair: '#e3dfd6',
    old: true,
    back: (
      <path
        d="M-30 8c-12-12-6-36 10-42 6-12 30-12 38 0 16 6 20 30 10 42z"
        fill="#e3dfd6"
      />
    ),
    front: (
      <path
        d="M-27-6c-4-12 4-26 14-26 4-8 20-8 26 0 10 0 17 12 14 26-4-8-10-12-18-12-4 4-12 4-16 0-10 0-16 4-20 12z"
        fill="#e3dfd6"
      />
    ),
    body: (
      <>
        <path d="M-62 120c0-40 16-62 62-62s62 22 62 62z" fill="#3e7a5c" />
        <path d="M-14 58 0 78 14 58z" fill={WHITE} />
        <path d="M-14 58-4 120M14 58 4 120" fill="none" strokeWidth="1.6" />
        <circle cx="-9" cy="92" r="1.8" fill={WHITE} />
        <circle cx="-8" cy="106" r="1.8" fill={WHITE} />
        <circle cx="22" cy="74" r="4" fill="#d6402f" />
      </>
    ),
    extra: (
      <>
        <circle
          cx="-10"
          cy="1"
          r="7.5"
          fill="none"
          stroke="#b33a3a"
          strokeWidth="2.2"
        />
        <circle
          cx="10"
          cy="1"
          r="7.5"
          fill="none"
          stroke="#b33a3a"
          strokeWidth="2.2"
        />
        <path d="M-2.5 0h5" stroke="#b33a3a" strokeWidth="2" />
        <circle cx="-26" cy="14" r="2.6" fill={WHITE} />
        <circle cx="26" cy="14" r="2.6" fill={WHITE} />
      </>
    ),
  },
  Javi: {
    skin: '#b47c58',
    hair: '#1f1a17',
    front: (
      <path
        d="M-27-2c-6-14 0-30 10-32 2-8 14-10 20-5 8-6 22-2 23 10 6 6 5 20 1 27-2-8-6-14-12-16-4 4-10 4-14 1-6 3-14 3-18 0-6 3-9 9-10 15z"
        fill="#1f1a17"
      />
    ),
    body: (
      <>
        <path d="M-64 120c0-40 18-62 64-62s64 22 64 62z" fill="#4c74a6" />
        <path d="M-20 59c4 10 12 14 20 14s16-4 20-14z" fill="#e2793a" />
        <path d="M-20 59 0 120M20 59 0 120" fill="none" strokeWidth="1.6" />
        <path d="M-44 86h12v8h-12z" fill="#3d5f8a" />
      </>
    ),
    beard: (
      <path
        d="M-26 6c0 16 10 28 26 28s26-12 26-28c-4 8-8 10-12 10-4-4-10-6-14-6s-10 2-14 6c-4 0-8-2-12-10zM-9 20a9 6 0 0 0 18 0a9 6 0 0 0-18 0z"
        fill="#2b211b"
        fillRule="evenodd"
      />
    ),
  },
}

export const GUEST_NAMES = Object.keys(LOOKS)

// --- The paintings ---

// A painting's address, once it is painted
function painted(name: string) {
  return PICTURES.has(name) ? `/${name}.webp` : undefined
}

// The drinks and dishes, the guests and the bar are each painted only once
// all of them are, so that neither the carta nor the day mixes paintings
// and drawings
const ITEMS_PAINTED = Object.keys(ITEM_ART).every((id) =>
  PICTURES.has(itemPicture(id)),
)
const GUESTS_PAINTED = GUEST_NAMES.every((who) =>
  FACES.every((face) => PICTURES.has(guestFace(who, face))),
)
const BAR_PAINTED = PICTURES.has(BAR) && GUESTS_PAINTED && ITEMS_PAINTED

// A guest's cut-out, GUEST_W wide from (0, 0), in the face of the mood,
// breathing; while ordering the speaking face (the waiting one with its
// mouth open, scripts/mouths.py) is shown over the waiting one every other
// moment, so that only the mouth moves
function GuestFrames({
  who,
  mood,
  talking,
}: {
  who: string
  mood: Mood
  talking: boolean
}) {
  const h = (GUEST_W * FRAME.h) / FRAME.w
  return (
    <g className={`tp-paint ${mood} ${talking ? 'talking' : ''}`}>
      <image
        href={painted(guestFace(who, mood === 'talk' ? 'wait' : mood))}
        width={GUEST_W}
        height={h}
      />
      {/* always there, so that it is loaded before it is wanted */}
      <image
        className="tp-mo"
        href={painted(guestFace(who, 'talk'))}
        width={GUEST_W}
        height={h}
      />
    </g>
  )
}

function Face({ look, mood }: { look: Look; mood: Mood }) {
  return (
    <>
      {/* eyes */}
      {mood === 'happy' ? (
        <path d="M-14 0q4-5 8 0M6 0q4-5 8 0" fill="none" strokeWidth="2.4" />
      ) : (
        <g fill={OUT} stroke="none">
          <ellipse cx="-10" cy="0" rx="2.6" ry="3.2" />
          <ellipse cx="10" cy="0" rx="2.6" ry="3.2" />
        </g>
      )}
      {/* brows */}
      {mood === 'hmm' ? (
        <path d="M-15-10-5-8M5-7l10-5" fill="none" strokeWidth="2.2" />
      ) : (
        <path d="M-15-9q5-3 10 0M5-9q5-3 10 0" fill="none" strokeWidth="2.2" />
      )}
      {look.old && (
        <path
          d="M-20 3l-3 1M20 3l3 1"
          fill="none"
          strokeWidth="1.2"
          stroke={SKIN_LINE}
        />
      )}
      {/* nose */}
      <path d="M1 3c2 4 3 7 0 9" fill="none" strokeWidth="1.8" />
      {/* cheeks */}
      <g fill="#f08c74" opacity=".45" stroke="none">
        <circle cx="-16" cy="10" r="4.4" />
        <circle cx="16" cy="10" r="4.4" />
      </g>
      {/* mouth */}
      {mood === 'happy' && (
        <path d="M-9 17q9 9 18 0z" fill="#8a2a2a" strokeWidth="2" />
      )}
      {mood === 'hmm' && (
        <path d="M-7 20q3-3 6 0t6 0" fill="none" strokeWidth="2" />
      )}
      {(mood === 'wait' || mood === 'talk') && (
        <g className="tp-mouth">
          <path
            className="shut"
            d="M-6 19q6 3 12 0"
            fill="none"
            strokeWidth="2"
          />
          {mood === 'talk' && (
            <ellipse
              className="open"
              cx="0"
              cy="20"
              rx="5.4"
              ry="4.2"
              fill="#8a2a2a"
              strokeWidth="2"
            />
          )}
        </g>
      )}
    </>
  )
}

// A guest from the chest up, round their head at 0 0
export function GuestShape({ who, mood }: { who: string; mood: Mood }) {
  const look = LOOKS[who] ?? LOOKS.Lucía
  return (
    <g
      stroke={OUT}
      strokeWidth="2.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {look.back}
      {look.body}
      <path d="M-11 22v18c0 8 22 8 22 0V22z" fill={look.skin} />
      <ellipse cx="-27" cy="5" rx="5" ry="7" fill={look.skin} />
      <ellipse cx="27" cy="5" rx="5" ry="7" fill={look.skin} />
      <ellipse cx="0" cy="0" rx="27" ry="31" fill={look.skin} />
      {look.front}
      {look.beard}
      <Face look={look} mood={mood} />
      {look.extra}
    </g>
  )
}

// A guest's face alone, for the day's list at the end
export function GuestFace({
  who,
  className = '',
}: {
  who: string
  className?: string
}) {
  return (
    <svg
      className={className}
      viewBox={GUESTS_PAINTED ? '120 0 240 240' : '-40 -42 80 80'}
      aria-hidden="true"
    >
      {GUESTS_PAINTED ? (
        <image
          href={painted(guestFace(who, 'wait'))}
          width={FRAME.w}
          height={FRAME.h}
        />
      ) : (
        <GuestShape who={who} mood="wait" />
      )}
    </svg>
  )
}

// --- The bar ---

function Tiles() {
  return (
    <pattern
      id="tp-tiles"
      width="22"
      height="22"
      patternUnits="userSpaceOnUse"
      x="0"
      y="122"
    >
      <rect width="22" height="22" fill="#f7f1e3" />
      <g fill="#e6b43c">
        <path d="M0 0h4a4 4 0 0 1-4 4z" />
        <path d="M22 0v4a4 4 0 0 1-4-4z" />
        <path d="M0 22v-4a4 4 0 0 1 4 4z" />
        <path d="M22 22h-4a4 4 0 0 1 4-4z" />
      </g>
      <g fill="#2f5f9e">
        <path d="M11 3c3 3 3 5 0 8-3-3-3-5 0-8z" />
        <path d="M11 19c3-3 3-5 0-8-3 3-3 5 0 8z" />
        <path d="M3 11c3-3 5-3 8 0-3 3-5 3-8 0z" />
        <path d="M19 11c-3-3-5-3-8 0 3 3 5 3 8 0z" />
      </g>
      <circle cx="11" cy="11" r="1.8" fill="#e6b43c" />
      <path d="M0 0H22V22" fill="none" stroke="#9fb3cf" strokeWidth=".8" />
    </pattern>
  )
}

function Ham({ x, tilt }: { x: number; tilt: number }) {
  return (
    <g transform={`rotate(${tilt} ${x} 14)`}>
      <path d={`M${x} 14v10`} />
      <path
        d={`M${x - 4} 24h8l1 6c10 6 16 22 14 38-2 14-12 20-18 20s-16-6-18-20c-2-16 4-32 12-38z`}
        fill="#b4642d"
      />
      <path
        d={`M${x - 3} 40c-6 6-8 18-6 28M${x + 6} 44c3 8 3 18 0 26`}
        fill="none"
        stroke="#8a4520"
        strokeWidth="1.6"
      />
      <path d={`M${x - 4} 27h9`} stroke="#e6b43c" strokeWidth="3" />
      <ellipse
        cx={x + 1}
        cy="78"
        rx="5"
        ry="3"
        fill="#e9d2b0"
        strokeWidth="1.4"
      />
    </g>
  )
}

function Bottle({
  x,
  y,
  c,
  h = 26,
}: {
  x: number
  y: number
  c: string
  h?: number
}) {
  return (
    <g>
      <path
        d={`M${x - 2} ${y - h}h4v6c0 2 4 3 4 7v${h - 13}h-12v${-(h - 13)}c0-4 4-5 4-7z`}
        fill={c}
      />
      <rect
        x={x - 6}
        y={y - 12}
        width="12"
        height="7"
        fill="#efe3c4"
        strokeWidth="1.4"
      />
    </g>
  )
}

const SHELF = [
  { y: 58, bottles: ['#2c4a37', '#7a1428', '#2c4a37', '#3d2a1e', '#7a1428'] },
  { y: 102, bottles: ['#7a1428', '#c99a2e', '#2c4a37', '#7a1428', '#2c4a37'] },
]

// Where the things on the tray stand, in the order they were put there:
// a row of six in front, and the rest behind it
function trayPlaces(n: number): Array<{ x: number; y: number; s: number }> {
  const front = Math.min(n, 6)
  const row = (k: number, y: number, s: number, gap: number) =>
    Array.from({ length: k }, (_, i) => ({
      x: 200 + (i - (k - 1) / 2) * gap,
      y,
      s,
    }))
  return [...row(front, 206, 0.66, 40), ...row(n - front, 196, 0.56, 34)]
}

// The tray on the counter with what has been put there, each thing taken
// off by a touch; in flat colours with no outline over the painted bar
function Tray({
  tray,
  onTake,
  serving,
  flat = false,
}: {
  tray: Array<string>
  onTake?: (i: number) => void
  serving: boolean
  flat?: boolean
}) {
  const places = trayPlaces(tray.length)
  // (the back row is drawn first, so the front one stands before it)
  const order = tray
    .map((id, i) => ({ id, i, p: places[i] }))
    .sort((a, b) => a.p.y - b.p.y)
  return (
    <g className={`tp-tray ${serving ? 'served' : ''}`}>
      <ellipse
        cx="200"
        cy="232"
        rx="150"
        ry="15"
        fill={flat ? '#56646b' : '#3f454d'}
      />
      <ellipse
        cx="200"
        cy="229"
        rx="142"
        ry="11"
        fill={flat ? '#7d8b8f' : '#5a616b'}
        strokeWidth="1.4"
      />
      {order.map(({ id, i, p }) => (
        <g
          key={`${id}-${i}`}
          transform={`translate(${p.x - 32 * p.s} ${p.y + 28 - 64 * p.s})`}
          onClick={() => onTake?.(i)}
        >
          {/* (moved by its own group, as a style's transform would
              take the place of the one above) */}
          <g className="tp-on">
            <g transform={`scale(${p.s})`}>
              <rect width="64" height="64" fill="transparent" stroke="none" />
              <ItemShape id={id} />
            </g>
          </g>
        </g>
      ))}
    </g>
  )
}

// The painted bar: the room beyond the counter, the guest standing behind
// it, and the tray on it
function PaintedBar({
  guest,
  mood,
  talking,
  tray,
  onTake,
  serving,
}: {
  guest: string | null
  mood: Mood
  talking: boolean
  tray: Array<string>
  onTake?: (i: number) => void
  serving: boolean
}) {
  const counter = SCENE_H * COUNTER_AT
  const h = (GUEST_W * FRAME.h) / FRAME.w
  return (
    <svg
      className="tp-scene"
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      role="img"
      aria-label="Baren, sett fra innsiden av disken"
    >
      <image
        href={painted(BAR)}
        width={SCENE_W}
        height={SCENE_H}
        preserveAspectRatio="xMidYMid slice"
      />
      {guest && (
        <g className={`tp-guest ${mood}`} key={guest}>
          <g
            transform={`translate(${(SCENE_W - GUEST_W) / 2} ${counter + 3 - h})`}
          >
            <GuestFrames who={guest} mood={mood} talking={talking} />
          </g>
        </g>
      )}
      <g stroke="none">
        <Tray tray={tray} onTake={onTake} serving={serving} flat />
      </g>
    </svg>
  )
}

// The bar as the player sees it from behind the counter: the guest across
// it, and the tray on it with what has been put there. A thing on the
// tray is taken off by a touch.
export function BarScene({
  guest,
  mood,
  tray,
  onTake,
  serving = false,
  talking = false,
}: {
  guest: string | null
  mood: Mood
  // What is on the tray, in the order put there
  tray: Array<string>
  onTake?: (i: number) => void
  // Served: the tray goes over the counter
  serving?: boolean
  // The guest is speaking
  talking?: boolean
}) {
  if (BAR_PAINTED)
    return (
      <PaintedBar
        guest={guest}
        mood={mood}
        talking={talking}
        tray={tray}
        onTake={onTake}
        serving={serving}
      />
    )
  return (
    <svg
      className="tp-scene"
      viewBox="0 0 400 250"
      role="img"
      aria-label="Baren, sett fra innsiden av disken"
    >
      <defs>
        <Tiles />
      </defs>
      <g
        stroke={OUT}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <rect
          x="0"
          y="0"
          width="400"
          height="250"
          fill="#f3e6c8"
          stroke="none"
        />
        <rect
          x="0"
          y="122"
          width="400"
          height="80"
          fill="url(#tp-tiles)"
          stroke="none"
        />
        <path d="M0 118h400v5H0z" fill="#2f5f9e" />
        {/* the shelves, right */}
        {SHELF.map((s) => (
          <g key={s.y}>
            {s.bottles.map((c, i) => (
              <Bottle
                key={i}
                x={300 + i * 20}
                y={s.y}
                c={c}
                h={i % 2 ? 24 : 28}
              />
            ))}
            <path d={`M284 ${s.y}h112v6H284z`} fill="#8a4b2a" />
          </g>
        ))}
        {/* the beam, the hams and the lamp */}
        <path d="M0 0h400v14H0z" fill="#6b3920" />
        <Ham x={34} tilt={-3} />
        <Ham x={78} tilt={2} />
        <Ham x={122} tilt={-1} />
        <path d="M262 14v24" />
        <path d="M244 52c0-10 8-16 18-16s18 6 18 16z" fill="#2f6b4f" />
        <path d="M254 52a8 5 0 0 0 16 0z" fill="#fff3b8" />
        {/* the guest */}
        {guest && (
          <g className={`tp-guest ${mood}`} key={guest}>
            <g transform="translate(200 108)">
              <GuestShape who={guest} mood={mood} />
            </g>
          </g>
        )}
        {/* the counter */}
        <path d="M0 196h400v54H0z" fill="#c9d0d6" />
        <path d="M0 196h400v5H0z" fill="#e8ecef" />
        <path d="M0 240h400" stroke="#9aa3ab" strokeWidth="1.4" />
        {/* the tray */}
        <Tray tray={tray} onTake={onTake} serving={serving} />
      </g>
    </svg>
  )
}
