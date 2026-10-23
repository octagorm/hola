import type { ReactNode } from 'react'

// The keepsakes of Los cajones (data/cajones.ts), each drawn simply, as if
// cut from coloured paper: flat shapes with a dark outline, on a 100 × 100
// square. Each could be painted later, on one sheet of small objects.

const INK = '#2b1d14'
const CREAM = '#f6ead2'
const WHITE = '#fbf6ea'
const RED = '#c0392b'
const OCHRE = '#d79a32'
const GOLD = '#e2b23a'
const BRASS = '#c9993d'
const BLUE = '#3d6e9e'
const SKY = '#8fb3cf'
const GREEN = '#5a8a4a'
const LEAF = '#7aa457'
const WOOD = '#9a5b2e'
const DARK = '#6b3b1d'
const SILVER = '#c3c7cc'
const PINK = '#e8a6a0'
const ORANGE = '#e47d2a'
const TEAL = '#2f8a8a'

const ART: Record<string, ReactNode> = {
  hanky: (
    <>
      <path d="M22 26 74 18 82 70 30 80Z" fill={WHITE} strokeDasharray="0" />
      <path d="M28 31 70 25 76 66 34 73Z" fill="none" strokeWidth="1.2" />
      <path
        d="M22 26q4 4 8 0 4 4 8 0 4 4 8 0 4 4 8 0 4 4 8 0 4 4 8-4"
        fill="none"
        strokeWidth="1.4"
      />
      <path
        d="M30 80q-1-5 4-6 1 5 5 3 0 5 5 3 0 5 5 2 1 5 5 2 1 5 5 1 1 5 5 1 1 5 5 0"
        fill="none"
        strokeWidth="1.4"
      />
      <path d="M58 48q4-6 8 0-4 6-8 0Z" fill={PINK} strokeWidth="1.5" />
    </>
  ),
  card: (
    <>
      <rect x="14" y="30" width="72" height="42" rx="2" fill={WHITE} />
      <path d="M24 44H58M24 52H48" strokeWidth="3" />
      <path d="M24 62H40" strokeWidth="1.6" />
      <path d="M66 52 72 46 78 52 72 58Z" fill={RED} strokeWidth="1.6" />
    </>
  ),
  thimble: (
    <>
      <path d="M32 78 36 34Q50 16 64 34L68 78Z" fill={BRASS} />
      <path d="M30 78H70V84H30Z" fill={GOLD} />
      {[40, 48, 56].map((y) =>
        [40, 46, 52, 58].map((x) => (
          <circle
            key={`${x}${y}`}
            cx={x + (y === 48 ? 3 : 0)}
            cy={y}
            r="1.4"
            fill={INK}
            stroke="none"
          />
        )),
      )}
      <path d="M36 66H64" strokeWidth="1.4" />
    </>
  ),
  die: (
    <>
      <path d="M22 38 50 24 78 38 50 52Z" fill={WHITE} />
      <path d="M22 38V68L50 82V52Z" fill={CREAM} />
      <path d="M78 38V68L50 82V52Z" fill="#e6d6b4" />
      <g fill={INK} stroke="none">
        <ellipse cx="50" cy="38" rx="3.4" ry="2" />
        <circle cx="32" cy="52" r="2.6" />
        <circle cx="40" cy="66" r="2.6" />
        <circle cx="58" cy="56" r="2.4" />
        <circle cx="64" cy="61" r="2.4" />
        <circle cx="70" cy="66" r="2.4" />
      </g>
    </>
  ),
  photo: (
    <>
      <path
        d="M18 22h64v56H18Z"
        fill={WHITE}
        strokeDasharray="3 2"
        strokeWidth="2"
      />
      <rect x="24" y="28" width="52" height="40" fill="#d8c39a" />
      <path d="M24 60q26-10 52 0v8H24Z" fill="#a98c5c" strokeWidth="1.4" />
      <g fill="#6d5636" strokeWidth="1.4">
        <circle cx="38" cy="42" r="4" />
        <path d="M32 58q6-12 12 0Z" />
        <circle cx="52" cy="40" r="4.4" />
        <path d="M45 58q7-14 14 0Z" />
        <circle cx="64" cy="48" r="3" />
        <path d="M60 58q4-8 8 0Z" />
      </g>
    </>
  ),
  spoon: (
    <>
      <path d="M46 46 20 84q-2 4 2 4 3 0 5-3L52 50Z" fill={WOOD} />
      <ellipse
        cx="60"
        cy="32"
        rx="16"
        ry="21"
        transform="rotate(35 60 32)"
        fill={WOOD}
      />
      <ellipse
        cx="61"
        cy="31"
        rx="10"
        ry="14"
        transform="rotate(35 61 31)"
        fill={DARK}
        strokeWidth="1.4"
      />
    </>
  ),
  key: (
    <>
      <circle cx="28" cy="50" r="15" fill={DARK} />
      <circle cx="28" cy="50" r="7" fill={CREAM} />
      <path d="M43 46H84V54H43Z" fill={DARK} />
      <path d="M70 54V66H76V54M80 54V62H84V54" fill={DARK} />
      <path
        d="M20 30q-8-12 2-14 6 0 6 10M36 30q8-12-2-14-6 0-6 10"
        fill={RED}
        strokeWidth="2"
      />
    </>
  ),
  top: (
    <>
      <path d="M50 88 26 52Q30 30 50 28 70 30 74 52Z" fill={WOOD} />
      <path d="M27 50q23 10 46 0" fill="none" strokeWidth="6" stroke={RED} />
      <path d="M27 50q23 10 46 0" fill="none" strokeWidth="1.4" />
      <path d="M46 28V14h8v14" fill={DARK} />
      <path d="M50 88v4" strokeWidth="3" />
    </>
  ),
  mirror: (
    <>
      <circle cx="50" cy="52" r="30" fill={BRASS} />
      <circle cx="50" cy="52" r="23" fill={SKY} />
      <path d="M36 44q6-10 16-12" fill="none" stroke={WHITE} strokeWidth="4" />
      <path d="M42 22h16v-6H42Z" fill={GOLD} />
      <path d="M50 22a30 30 0 0 0-12 2" fill="none" strokeWidth="1.4" />
    </>
  ),
  brush: (
    <>
      <path d="M78 18 84 24 48 62 40 54Z" fill={RED} />
      <path d="M40 54 48 62 42 68 34 60Z" fill={SILVER} />
      <path d="M34 60 42 68Q34 84 16 86 18 68 34 60Z" fill={DARK} />
      <path d="M22 80q4-6 10-8" fill="none" stroke={BLUE} strokeWidth="3" />
      <path d="M26 84q4-4 6-8" fill="none" stroke={GOLD} strokeWidth="3" />
    </>
  ),
  hourglass: (
    <>
      <rect x="26" y="14" width="48" height="8" rx="2" fill={WOOD} />
      <rect x="26" y="78" width="48" height="8" rx="2" fill={WOOD} />
      <path
        d="M32 22V26Q32 42 48 50 32 58 32 74V78H68V74Q68 58 52 50 68 42 68 26V22Z"
        fill="#e7eef2"
      />
      <path
        d="M38 34Q50 40 62 34Q60 42 50 48 40 42 38 34Z"
        fill={GOLD}
        strokeWidth="1.4"
      />
      <path d="M36 76Q50 60 64 76Z" fill={GOLD} strokeWidth="1.4" />
      <path d="M50 50V70" stroke={GOLD} strokeWidth="1.6" />
      <path d="M30 22V78M70 22V78" strokeWidth="3" />
    </>
  ),
  map: (
    <>
      <path d="M14 26 36 18 60 26 86 18V74L60 82 36 74 14 82Z" fill={CREAM} />
      <path d="M36 18V74M60 26V82" strokeWidth="1.6" />
      <path
        d="M24 38q8-6 18 0t20 2 16-6q-2 16 0 28-12 4-22-2t-22 0q-6-12-10-22Z"
        fill="#e3cf9e"
        strokeWidth="1.4"
      />
      <path
        d="M28 64 42 50 56 54 72 40"
        fill="none"
        stroke={RED}
        strokeWidth="2.4"
        strokeDasharray="4 3"
      />
      <circle cx="72" cy="40" r="3" fill={RED} />
    </>
  ),
  heart: (
    <>
      <path
        d="M50 84Q16 60 18 38q2-16 16-16 10 0 16 10 6-10 16-10 14 0 16 16 2 22-32 46Z"
        fill={SILVER}
      />
      <path
        d="M50 74Q26 56 28 40q2-8 8-8"
        fill="none"
        stroke={WHITE}
        strokeWidth="3"
      />
      <path d="M46 14q4-6 8 0v8h-8Z" fill={SILVER} />
      <path
        d="M50 46l3 6 6 1-5 4 2 6-6-3-6 3 2-6-5-4 6-1Z"
        fill={GOLD}
        strokeWidth="1.2"
      />
    </>
  ),
  notebook: (
    <>
      <rect x="24" y="16" width="52" height="70" rx="3" fill={DARK} />
      <rect
        x="30"
        y="16"
        width="46"
        height="70"
        fill="#4a2e1a"
        strokeWidth="0"
      />
      <rect x="24" y="16" width="52" height="70" rx="3" fill="none" />
      <path d="M66 14V88" stroke="#1b1611" strokeWidth="4" />
      <rect
        x="36"
        y="30"
        width="24"
        height="14"
        fill={CREAM}
        strokeWidth="1.4"
      />
      <path d="M44 34q4-3 6 0 0 3-3 4v2" fill="none" strokeWidth="1.6" />
    </>
  ),
  windmill: (
    <>
      <path d="M36 86 40 42H60L64 86Z" fill={WHITE} />
      <path d="M36 44 50 26 64 44Z" fill={INK} />
      <path d="M46 86V72q4-6 8 0v14Z" fill={WOOD} strokeWidth="1.6" />
      <g strokeWidth="1.8">
        <path d="M50 34 22 16 18 22 46 38Z" fill={CREAM} />
        <path d="M50 34 78 16 82 22 54 38Z" fill={CREAM} />
        <path d="M50 34 70 62 64 66 46 38Z" fill={CREAM} />
        <path d="M50 34 30 62 36 66 54 38Z" fill={CREAM} />
      </g>
      <circle cx="50" cy="34" r="3" fill={INK} />
    </>
  ),
  butterfly: (
    <>
      <path d="M50 46Q30 10 14 26 10 44 48 52Z" fill={BLUE} />
      <path d="M50 46Q70 10 86 26 90 44 52 52Z" fill={BLUE} />
      <path d="M48 52Q20 56 26 76 36 84 50 58Z" fill={ORANGE} />
      <path d="M52 52Q80 56 74 76 64 84 50 58Z" fill={ORANGE} />
      <circle cx="28" cy="30" r="4" fill={WHITE} strokeWidth="1.2" />
      <circle cx="72" cy="30" r="4" fill={WHITE} strokeWidth="1.2" />
      <path d="M50 38V76" strokeWidth="4" />
      <path
        d="M50 38q-4-10-10-14M50 38q4-10 10-14"
        fill="none"
        strokeWidth="1.6"
      />
    </>
  ),
  napkin: (
    <>
      <path d="M18 30 70 20 84 70 30 82Z" fill={WHITE} />
      <path d="M18 30 52 50 30 82M52 50 84 70" fill="none" strokeWidth="1.2" />
      <path d="M58 30q6 4 12 0" fill="none" stroke={RED} strokeWidth="2" />
      <path
        d="M24 34q20-4 40-10"
        fill="none"
        stroke={BLUE}
        strokeWidth="1.4"
        strokeDasharray="3 2"
      />
    </>
  ),
  bag: (
    <>
      <path d="M36 36q0-20 14-20t14 20" fill="none" strokeWidth="4" />
      <path d="M24 36H76L70 84H30Z" fill={CREAM} />
      <g strokeWidth="1.3" fill="none">
        <path d="M30 46H72M31 58H71M32 70H69" />
        <path d="M38 36 36 84M50 36V84M62 36 64 84" />
      </g>
      <circle cx="44" cy="34" r="7" fill={ORANGE} />
      <path d="M56 22q8 4 6 16" fill={LEAF} />
    </>
  ),
  ticket: (
    <>
      <path
        d="M14 30H86V44a6 6 0 0 0 0 12V70H14V56a6 6 0 0 0 0-12Z"
        fill="#e9d79f"
      />
      <path d="M62 30V70" strokeDasharray="3 3" strokeWidth="1.6" />
      <path d="M22 40H54M22 48H46" strokeWidth="2.4" />
      <path d="M22 58h10l4-6h12l4 6h4v4H22Z" fill={RED} strokeWidth="1.4" />
      <circle cx="74" cy="50" r="5" fill={CREAM} strokeWidth="1.4" />
    </>
  ),
  ring: (
    <>
      <ellipse cx="50" cy="58" rx="28" ry="24" fill={GOLD} />
      <ellipse cx="50" cy="58" rx="19" ry="16" fill={CREAM} />
      <path
        d="M28 52q8-18 30-18"
        fill="none"
        stroke="#f6dd8a"
        strokeWidth="3"
      />
      <path d="M44 22 50 14 56 22 50 30Z" fill="#dfe8ef" />
    </>
  ),
  umbrella: (
    <>
      <path
        d="M14 48Q50 6 86 48q-6-6-12 0-6-6-12 0-6-6-12 0-6-6-12 0-6-6-12 0-6-6-12 0Z"
        fill={RED}
      />
      <path
        d="M50 18q-10 12-12 30M50 18q10 12 12 30"
        fill="none"
        strokeWidth="1.4"
      />
      <path d="M50 14V78q0 8-8 8-6 0-6-6" fill="none" strokeWidth="3" />
    </>
  ),
  clock: (
    <>
      <circle cx="34" cy="22" r="10" fill={BRASS} />
      <circle cx="66" cy="22" r="10" fill={BRASS} />
      <path d="M28 82 22 90M72 82 78 90" strokeWidth="4" />
      <circle cx="50" cy="54" r="30" fill={RED} />
      <circle cx="50" cy="54" r="23" fill={WHITE} />
      <path d="M50 54V36M50 54 62 60" strokeWidth="3" strokeLinecap="round" />
      <g stroke="none" fill={INK}>
        <circle cx="50" cy="34" r="1.6" />
        <circle cx="70" cy="54" r="1.6" />
        <circle cx="50" cy="74" r="1.6" />
        <circle cx="30" cy="54" r="1.6" />
      </g>
    </>
  ),
  stamp: (
    <>
      <ellipse cx="50" cy="24" rx="12" ry="10" fill={WOOD} />
      <path d="M44 32h12v20H44Z" fill={WOOD} />
      <path d="M26 52H74V64H26Z" fill={DARK} />
      <path d="M28 64H72V72H28Z" fill={INK} />
      <path d="M20 88H80" strokeWidth="1.6" />
      <circle cx="50" cy="84" r="0" />
      <path
        d="M36 80 44 76 52 80 60 76 68 80"
        fill="none"
        stroke={BLUE}
        strokeWidth="2.4"
      />
    </>
  ),
  cazuela: (
    <>
      <ellipse cx="50" cy="48" rx="36" ry="12" fill={ORANGE} />
      <path d="M14 48Q16 78 50 80 84 78 86 48" fill={WOOD} />
      <ellipse
        cx="50"
        cy="48"
        rx="29"
        ry="8"
        fill="#e8b04a"
        strokeWidth="1.6"
      />
      <path
        d="M38 46q4-6 8 0M54 48q4-6 8 0"
        fill="none"
        stroke={RED}
        strokeWidth="3"
      />
      <path d="M8 46h6M86 46h6" strokeWidth="5" />
    </>
  ),
  saffron: (
    <>
      <rect x="26" y="34" width="48" height="46" rx="4" fill={RED} />
      <ellipse cx="50" cy="34" rx="24" ry="7" fill={GOLD} />
      <rect
        x="32"
        y="46"
        width="36"
        height="22"
        fill={CREAM}
        strokeWidth="1.4"
      />
      <path d="M44 62q2-10 6-12 4 2 6 12" fill="#8a5aa0" strokeWidth="1.2" />
      <path d="M50 50V46M48 50l-2-4M52 50l2-4" stroke={RED} strokeWidth="1.6" />
      <path
        d="M62 22q-2 6 2 10M70 20q0 6-4 10"
        fill="none"
        stroke={RED}
        strokeWidth="2.4"
      />
    </>
  ),
  recipe: (
    <>
      <path d="M22 16H74L80 22V86H22Z" fill={WHITE} />
      <g fill="none" strokeWidth="1.6" stroke={BLUE}>
        <path d="M30 30q6-4 12 0t12 0 12 0" />
        <path d="M30 42q8-3 16 0t14 0" />
        <path d="M30 52q6-3 12 0t16 0 6 0" />
        <path d="M30 62q8-3 16 0t10 0" />
        <path d="M30 72q6-3 12 0" />
      </g>
      <ellipse
        cx="66"
        cy="74"
        rx="8"
        ry="6"
        fill={GOLD}
        opacity=".55"
        stroke="none"
      />
    </>
  ),
  cup: (
    <>
      <path d="M22 34H70V58Q70 80 46 80 22 80 22 58Z" fill={WHITE} />
      <path d="M70 40q16 0 14 14-2 10-16 8" fill="none" strokeWidth="5" />
      <path
        d="M70 40q16 0 14 14-2 10-16 8"
        fill="none"
        stroke={WHITE}
        strokeWidth="2"
      />
      <ellipse cx="46" cy="34" rx="24" ry="6" fill="#5b2f1c" />
      <path d="M14 84q32 8 68 0" fill="none" strokeWidth="2" />
      <path
        d="M38 24q-4-8 2-14M52 24q-4-8 2-14"
        fill="none"
        strokeWidth="1.4"
      />
    </>
  ),
  acorn: (
    <>
      <path d="M30 50Q30 86 50 88 70 86 70 50Z" fill={OCHRE} />
      <path d="M26 50Q26 26 50 26 74 26 74 50Z" fill={WOOD} />
      <g fill="none" strokeWidth="1.2">
        <path d="M32 36l6 6M42 30l6 6M54 30l6 6M64 36l6 6M30 46l6-6M40 46l6-6M52 46l6-6M62 46l6-6" />
      </g>
      <path d="M50 26q0-10 8-14" fill="none" strokeWidth="3" />
      <path d="M58 12q18-6 24 8-14 6-24-8Z" fill={GREEN} strokeWidth="1.6" />
    </>
  ),
  corkscrew: (
    <>
      <path d="M20 26q0-8 8-8H72q8 0 8 8t-8 8H28q-8 0-8-8Z" fill={WOOD} />
      <path d="M48 34h4v10h-4Z" fill={SILVER} />
      <path
        d="M50 44q10 3 0 7-10 3 0 7 10 3 0 7-10 3 0 7 8 3 0 8"
        fill="none"
        stroke={SILVER}
        strokeWidth="5"
      />
      <path
        d="M50 44q10 3 0 7-10 3 0 7 10 3 0 7-10 3 0 7 8 3 0 8"
        fill="none"
        strokeWidth="1.2"
      />
    </>
  ),
  cacao: (
    <>
      <path
        d="M50 12Q80 30 76 58 70 86 50 90 30 86 24 58 20 30 50 12Z"
        fill={ORANGE}
      />
      <g fill="none" strokeWidth="1.6">
        <path d="M50 14V88" />
        <path d="M38 20Q30 52 40 86M62 20Q70 52 60 86" />
      </g>
      <path d="M50 12q-2-6 4-8" fill="none" strokeWidth="3" />
    </>
  ),
  rose: (
    <>
      <path d="M50 52 52 92" strokeWidth="3" stroke={GREEN} />
      <path d="M52 70q16-8 22 0-14 8-22 0Z" fill={GREEN} strokeWidth="1.6" />
      <path d="M50 72q-16-10-22-2 14 8 22 2Z" fill={GREEN} strokeWidth="1.6" />
      <path d="M30 32q0-20 20-20t20 20q0 20-20 22-20-2-20-22Z" fill={RED} />
      <path
        d="M40 30q4-10 12-8t8 10q-2 10-10 10"
        fill="none"
        strokeWidth="1.6"
      />
      <path d="M46 30q4-4 8 0-2 4-6 4" fill="none" strokeWidth="1.4" />
      <path d="M40 80 62 76 64 82 42 86Z" fill={GOLD} strokeWidth="1.4" />
      <path d="M42 82 63 79" stroke={RED} strokeWidth="2" />
    </>
  ),
  fan: (
    <>
      <path d="M50 84 12 46Q50 2 88 46Z" fill={RED} />
      <path d="M50 84 22 52Q50 22 78 52Z" fill={CREAM} strokeWidth="1.4" />
      <g strokeWidth="1.2" fill="none">
        <path d="M50 84 12 46M50 84 20 34M50 84 32 24M50 84 50 20M50 84 68 24M50 84 80 34M50 84 88 46" />
      </g>
      <circle cx="40" cy="44" r="4" fill={RED} strokeWidth="1.2" />
      <circle cx="58" cy="40" r="4" fill={RED} strokeWidth="1.2" />
      <circle cx="50" cy="84" r="4" fill={GOLD} />
    </>
  ),
  shell: (
    <>
      <path d="M50 84 16 46Q20 16 50 14 80 16 84 46Z" fill="#f2d7b3" />
      <g fill="none" strokeWidth="1.4">
        <path d="M50 84 26 22M50 84 38 16M50 84V14M50 84 62 16M50 84 74 22M50 84 20 36M50 84 80 36" />
      </g>
      <path d="M40 84H60L56 92H44Z" fill="#f2d7b3" />
      <path d="M50 30V58M38 42H62" stroke={RED} strokeWidth="5" />
      <path d="M50 30l-4 6M50 30l4 6" stroke={RED} strokeWidth="3" />
    </>
  ),
  beret: (
    <>
      <ellipse cx="50" cy="56" rx="38" ry="20" fill="#2f2a2a" />
      <ellipse cx="50" cy="66" rx="24" ry="6" fill={INK} />
      <path d="M50 36q2-8 6-8" fill="none" strokeWidth="3" />
      <path
        d="M22 50q20-10 44-8"
        fill="none"
        stroke="#5a5050"
        strokeWidth="3"
      />
    </>
  ),
  ninot: (
    <>
      <path d="M34 90 38 62H62L66 90Z" fill={BLUE} />
      <path d="M38 62 34 48Q50 40 66 48L62 62Z" fill={GOLD} />
      <circle cx="50" cy="32" r="16" fill="#f3d2b6" />
      <circle cx="42" cy="36" r="3.4" fill={PINK} stroke="none" />
      <circle cx="58" cy="36" r="3.4" fill={PINK} stroke="none" />
      <g fill={INK} stroke="none">
        <circle cx="44" cy="29" r="1.8" />
        <circle cx="56" cy="29" r="1.8" />
      </g>
      <path d="M45 39q5 4 10 0" fill="none" strokeWidth="1.6" />
      <path d="M34 26q16-20 32 0-6-4-16-4t-16 4Z" fill={DARK} />
      <path d="M30 52 20 44M70 52 80 44" strokeWidth="4" />
    </>
  ),
  lemon: (
    <>
      <path d="M50 30q-6-12 4-18" fill="none" strokeWidth="3" />
      <path d="M52 22q18-12 30 2-14 10-30-2Z" fill={GREEN} strokeWidth="1.6" />
      <path d="M50 22q-20-10-30 6 16 6 30-6Z" fill={LEAF} strokeWidth="1.6" />
      <path
        d="M14 58q0-24 34-28 40-2 40 26 0 26-38 28-36 0-36-26Z"
        fill="#f2d23a"
      />
      <path d="M8 58q4-4 8-2M92 56q-4-4-8-2" strokeWidth="3" />
      <path d="M30 46q10-8 24-8" fill="none" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  sand: (
    <>
      <path d="M44 14h12v10H44Z" fill={WOOD} />
      <path
        d="M42 24h16v8q16 8 16 26v22q0 6-6 6H32q-6 0-6-6V58q0-18 16-26Z"
        fill="#e6f0f2"
      />
      <path
        d="M27 62q12-6 23 0t23 0v18q0 6-6 6H33q-6 0-6-6Z"
        fill="#ecd08a"
        strokeWidth="1.4"
      />
      <path d="M46 72q4-6 8 0Z" fill={PINK} strokeWidth="1.2" />
      <path d="M34 40q4-4 8-6" fill="none" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  coin: (
    <>
      <circle cx="50" cy="50" r="34" fill="#b07a3a" />
      <circle
        cx="50"
        cy="50"
        r="27"
        fill="none"
        strokeWidth="1.4"
        strokeDasharray="2 3"
      />
      <path
        d="M40 72q-4-14 2-22-4-6 0-14 4-10 14-8 8 2 8 10-2 6 2 10-4 2-4 6 6 4 2 8-6 2-6 10Z"
        fill="#8a5a28"
        strokeWidth="1.6"
      />
      <path d="M42 30q6-6 16-2" fill="none" stroke={GREEN} strokeWidth="2.4" />
    </>
  ),
  tile: (
    <>
      <rect x="14" y="14" width="72" height="72" fill={WHITE} />
      <path
        d="M50 20 58 34 74 30 68 44 80 50 68 56 74 70 58 66 50 80 42 66 26 70 32 56 20 50 32 44 26 30 42 34Z"
        fill={BLUE}
      />
      <path
        d="M50 36 54 46 64 50 54 54 50 64 46 54 36 50 46 46Z"
        fill={GOLD}
        strokeWidth="1.4"
      />
      <g fill={GREEN} strokeWidth="1.4">
        <path d="M14 14h10l-10 10Z" />
        <path d="M86 14H76l10 10Z" />
        <path d="M14 86h10l-10-10Z" />
        <path d="M86 86H76l10-10Z" />
      </g>
    </>
  ),
  frame: (
    <>
      <rect x="18" y="20" width="64" height="62" fill={GOLD} />
      <rect x="28" y="30" width="44" height="42" fill="#a33a2e" />
      <path
        d="M18 20 28 30M82 20 72 30M18 82 28 72M82 82 72 72"
        strokeWidth="1.4"
      />
      <g fill="none" stroke="#f3d77a" strokeWidth="2">
        <path d="M22 26q4-3 8 0M44 24q6-3 12 0M70 26q4-3 8 0M22 76q4 3 8 0M70 76q4 3 8 0" />
      </g>
    </>
  ),
  salamander: (
    <>
      <path
        d="M20 60q-6-14 6-22 10-6 20 0 10 8 22 6 12-2 16 6 2 8-8 10-14 0-22 6-14 6-26 2-10-2-10-8Z"
        fill={GREEN}
      />
      <g stroke="none">
        <circle cx="30" cy="48" r="4" fill={GOLD} />
        <circle cx="44" cy="52" r="5" fill={ORANGE} />
        <circle cx="58" cy="54" r="4" fill={BLUE} />
        <circle cx="70" cy="56" r="3.6" fill={GOLD} />
        <circle cx="38" cy="62" r="3.4" fill={TEAL} />
        <circle cx="54" cy="64" r="3" fill={RED} />
      </g>
      <circle cx="80" cy="52" r="2" fill={INK} />
      <path
        d="M30 64 22 78M50 66 52 80M38 42 30 30M60 50 66 38"
        strokeWidth="4"
      />
      <path d="M20 60q-8 6-10 16" fill="none" strokeWidth="5" />
    </>
  ),
  film: (
    <>
      <path d="M10 34 90 22 92 62 12 74Z" fill={INK} />
      <g fill={CREAM} stroke="none">
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M${16 + i * 19} ${41 - i * 2.85} l15 -2.25 1.3 20 -15 2.25Z`}
          />
        ))}
      </g>
      <g fill={WHITE} stroke="none">
        {Array.from({ length: 9 }, (_, i) => (
          <rect
            key={i}
            x={14 + i * 8.6}
            y={35.6 - i * 1.3}
            width="3"
            height="2.4"
          />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <rect
            key={`b${i}`}
            x={15.5 + i * 8.6}
            y={67 - i * 1.3}
            width="3"
            height="2.4"
          />
        ))}
      </g>
      <circle cx="44" cy="46" r="4" fill={GOLD} stroke="none" />
    </>
  ),
  skull: (
    <>
      <path
        d="M22 46q0-30 28-30t28 30q0 14-10 18v12H32V64q-10-4-10-18Z"
        fill={WHITE}
      />
      <circle cx="38" cy="46" r="8" fill={TEAL} />
      <circle cx="62" cy="46" r="8" fill={TEAL} />
      <circle cx="38" cy="46" r="3" fill={PINK} strokeWidth="1.2" />
      <circle cx="62" cy="46" r="3" fill={PINK} strokeWidth="1.2" />
      <path d="M50 54 46 62H54Z" fill={INK} />
      <path d="M38 70h24M42 66v8M50 66v8M58 66v8" strokeWidth="1.6" />
      <g fill="#e05a8a" strokeWidth="1.2">
        <circle cx="44" cy="26" r="4" />
        <circle cx="56" cy="26" r="4" />
        <circle cx="50" cy="22" r="4" fill={GOLD} />
      </g>
    </>
  ),
  record: (
    <>
      <circle cx="50" cy="50" r="38" fill={INK} />
      <g fill="none" stroke="#4a4040" strokeWidth="1.2">
        <circle cx="50" cy="50" r="32" />
        <circle cx="50" cy="50" r="26" />
        <circle cx="50" cy="50" r="20" />
      </g>
      <circle cx="50" cy="50" r="13" fill={GOLD} />
      <circle cx="50" cy="50" r="2" fill={INK} />
      <path
        d="M26 34q8-10 20-12"
        fill="none"
        stroke="#6a5e5e"
        strokeWidth="3"
      />
    </>
  ),
  mate: (
    <>
      <path d="M28 56q0-24 22-24t22 24q0 28-22 30-22-2-22-30Z" fill="#8a6a3a" />
      <path d="M30 40h40l-2 6H32Z" fill={SILVER} />
      <ellipse cx="50" cy="38" rx="18" ry="5" fill={GREEN} />
      <path d="M56 38 70 8" stroke={SILVER} strokeWidth="5" />
      <path d="M56 38 70 8" strokeWidth="1.2" />
      <path d="M36 62q14 6 28 0" fill="none" strokeWidth="1.4" />
      <path d="M38 72l4-4 4 4 4-4 4 4 4-4 4 4" fill="none" strokeWidth="1.4" />
    </>
  ),
  emerald: (
    <>
      <path d="M32 22H68L82 40V60L68 78H32L18 60V40Z" fill="#2f9a6a" />
      <path
        d="M38 32H62L70 44V56L62 68H38L30 56V44Z"
        fill="#5cc08e"
        strokeWidth="1.4"
      />
      <path
        d="M32 22 38 32M68 22 62 32M82 40 70 44M82 60 70 56M68 78 62 68M32 78 38 68M18 60 30 56M18 40 30 44"
        strokeWidth="1.4"
      />
      <path d="M40 38 48 36" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  castanets: (
    <>
      <path
        d="M22 50q-2-24 18-26 18 0 18 22 0 24-18 26-18-2-18-22Z"
        fill={WOOD}
      />
      <path
        d="M48 56q-2-22 18-24 18 0 18 20 0 24-18 26-18-2-18-22Z"
        fill={DARK}
      />
      <circle cx="40" cy="46" r="3" fill={CREAM} />
      <circle cx="66" cy="54" r="3" fill={CREAM} />
      <path
        d="M40 24q6-12 14-6t12 14"
        fill="none"
        stroke={RED}
        strokeWidth="3"
      />
      <path d="M50 18q-4 10 2 14" fill="none" stroke={RED} strokeWidth="3" />
    </>
  ),
  maracas: (
    <>
      <path d="M40 54 24 86" strokeWidth="7" stroke={WOOD} />
      <path d="M40 54 24 86" strokeWidth="1.2" />
      <ellipse
        cx="44"
        cy="36"
        rx="15"
        ry="20"
        transform="rotate(25 44 36)"
        fill={RED}
      />
      <path d="M60 54 76 86" strokeWidth="7" stroke={WOOD} />
      <path d="M60 54 76 86" strokeWidth="1.2" />
      <ellipse
        cx="58"
        cy="36"
        rx="15"
        ry="20"
        transform="rotate(-25 58 36)"
        fill={GOLD}
      />
      <path
        d="M50 30q8 4 16 0M50 40q8 4 14 0"
        fill="none"
        stroke={GREEN}
        strokeWidth="2.6"
      />
      <path d="M34 26q4 6 12 6" fill="none" stroke={WHITE} strokeWidth="2.6" />
    </>
  ),
  lantern: (
    <>
      <path d="M50 8V20" strokeWidth="2" />
      <path d="M40 20h20v6H40ZM40 76h20v6H40Z" fill={INK} />
      <path d="M40 26Q14 52 40 76H60Q86 52 60 26Z" fill={WHITE} />
      <g fill={RED} stroke="none">
        <circle cx="38" cy="40" r="4" />
        <circle cx="54" cy="36" r="4" />
        <circle cx="66" cy="48" r="4" />
        <circle cx="46" cy="54" r="4" />
        <circle cx="32" cy="58" r="3.4" />
        <circle cx="60" cy="64" r="4" />
        <circle cx="46" cy="70" r="3" />
      </g>
      <path
        d="M28 40q22 6 44 0M24 52q26 6 52 0M28 64q22 6 44 0"
        fill="none"
        strokeWidth="1.2"
      />
    </>
  ),
  neckerchief: (
    <>
      <path d="M12 24H88L50 86Z" fill={RED} />
      <path d="M20 30H80L50 78Z" fill="none" stroke="#e86a5a" strokeWidth="2" />
      <path d="M40 24q10 12 20 0" fill="#a32a22" />
      <path d="M44 30 38 46M56 30 62 46" strokeWidth="5" />
    </>
  ),
  letter: (
    <>
      <path d="M14 28H86V76H14Z" fill={CREAM} />
      <path d="M14 28 50 56 86 28" fill="#efe0bf" />
      <path d="M14 76 40 50M86 76 60 50" fill="none" strokeWidth="1.4" />
      <circle cx="50" cy="56" r="9" fill={RED} />
      <path
        d="M46 52q4 4 8 0M46 60q4-4 8 0"
        fill="none"
        stroke="#7a1a14"
        strokeWidth="1.6"
      />
    </>
  ),
  veil: (
    <>
      <path
        d="M38 14q-12 6-14 22-6 30-12 52Q50 94 88 88 80 60 74 36 72 20 62 14Z"
        fill={WHITE}
        opacity=".95"
      />
      <g fill="none" strokeWidth="1.2" opacity=".7">
        <path d="M44 16q-6 30-18 70M52 16q0 34-8 74M58 16q6 34 6 74M64 18q10 30 18 68" />
      </g>
      <path d="M38 14q12-6 24 0" fill="none" strokeWidth="3" />
    </>
  ),
  raft: (
    <>
      <path d="M10 66H90L84 78H16Z" fill={GOLD} />
      <path d="M16 66V58M28 66V60M72 66V60M84 66V58" strokeWidth="2" />
      <path d="M44 66V40q6-8 12 0V66Z" fill={GOLD} />
      <circle cx="50" cy="32" r="7" fill={GOLD} />
      <path d="M44 28q6-10 12 0" fill="#f6dd8a" strokeWidth="1.4" />
      <g fill={GOLD} strokeWidth="1.6">
        <path d="M26 66V50q3-4 6 0V66Z" />
        <circle cx="29" cy="46" r="4" />
        <path d="M68 66V50q3-4 6 0V66Z" />
        <circle cx="71" cy="46" r="4" />
      </g>
      <path d="M20 72H80" strokeWidth="1.2" />
    </>
  ),
  book: (
    <>
      <path d="M50 26Q34 16 14 22V78Q34 72 50 82Z" fill={CREAM} />
      <path d="M50 26Q66 16 86 22V78Q66 72 50 82Z" fill={WHITE} />
      <path d="M50 26V82" strokeWidth="2" />
      <g fill="none" strokeWidth="1.2">
        <path d="M22 34q12-2 22 2M22 44q12-2 22 2M22 54q12-2 22 2M56 36q10-4 22-2M56 46q10-4 22-2M56 56q10-4 22-2" />
      </g>
      <path d="M86 22 76 22 86 32Z" fill={RED} strokeWidth="1.4" />
      <path d="M58 66q4-6 10-2 4 6-2 8" fill={GOLD} strokeWidth="1.2" />
    </>
  ),
  folder: (
    <>
      <path d="M14 30H40L46 24H86V80H14Z" fill={OCHRE} />
      <path d="M14 36H86V80H14Z" fill="#e7b04a" />
      <path d="M50 36V80" stroke={RED} strokeWidth="3" />
      <path
        d="M50 56q-10-6-12 2 4 6 12-2 10-6 12 2-4 6-12-2Z"
        fill={RED}
        strokeWidth="1.4"
      />
    </>
  ),
  nail: (
    <>
      <path d="M30 26H70L66 34H34Z" fill={SILVER} />
      <path d="M46 34H54V76L50 90 46 76Z" fill={SILVER} />
      <path d="M48 38V74" stroke={WHITE} strokeWidth="1.6" />
      <path
        d="M20 88q16-6 26 0M54 88q14-6 26 0"
        fill="none"
        stroke={WOOD}
        strokeWidth="2.4"
      />
    </>
  ),
  bell: (
    <>
      <path d="M50 10v8" strokeWidth="3" />
      <circle cx="50" cy="12" r="4" fill={BRASS} />
      <path
        d="M50 18Q30 18 30 44q0 22-12 30H82Q70 66 70 44 70 18 50 18Z"
        fill={BRASS}
      />
      <path d="M16 74H84V80H16Z" fill={GOLD} />
      <circle cx="50" cy="86" r="5" fill={DARK} />
      <path
        d="M38 30q-4 10-4 26"
        fill="none"
        stroke="#f3d77a"
        strokeWidth="3"
      />
    </>
  ),
  postcard: (
    <>
      <rect x="10" y="22" width="80" height="56" fill={WHITE} />
      <rect x="15" y="27" width="70" height="46" fill={SKY} strokeWidth="1.4" />
      <path d="M15 58q35-6 70 0v15H15Z" fill={BLUE} strokeWidth="1.4" />
      <g fill={WHITE} strokeWidth="1.2">
        <path d="M24 58V46h10v12ZM36 58V42h12v16ZM50 58V44h10v14Z" />
        <path d="M42 42V32l3-4 3 4v10Z" />
      </g>
      <path d="M62 66h14l-3 4h-9Z" fill={RED} strokeWidth="1.2" />
      <circle cx="74" cy="36" r="5" fill={GOLD} strokeWidth="1.2" />
    </>
  ),
  musicbox: (
    <>
      <path d="M16 44H84V82H16Z" fill={WOOD} />
      <path d="M16 44 26 22H90L84 44Z" fill={DARK} />
      <path d="M20 50H80V78H20Z" fill="none" strokeWidth="1.2" />
      <path d="M84 60h8v-6" fill="none" strokeWidth="3" />
      <g fill={GOLD} strokeWidth="1.2">
        <circle cx="50" cy="64" r="8" />
      </g>
      <path
        d="M58 16q2-8 8-6v10M70 14q2-8 8-6v10"
        fill="none"
        strokeWidth="2"
      />
      <circle cx="62" cy="20" r="3" fill={INK} />
      <circle cx="74" cy="18" r="3" fill={INK} />
    </>
  ),
  penguin: (
    <>
      <path
        d="M50 12q22 0 24 34 2 30-8 40H34q-10-10-8-40 2-34 24-34Z"
        fill={INK}
      />
      <path
        d="M50 30q14 2 14 26 0 22-6 30H42q-6-8-6-30 0-24 14-26Z"
        fill={WHITE}
      />
      <path d="M46 26l4 6 4-6Z" fill={ORANGE} strokeWidth="1.2" />
      <circle cx="43" cy="22" r="2" fill={WHITE} stroke="none" />
      <circle cx="57" cy="22" r="2" fill={WHITE} stroke="none" />
      <path
        d="M38 86h10l-2 4h-10ZM52 86h10l2 4H54Z"
        fill={ORANGE}
        strokeWidth="1.2"
      />
      <path d="M24 46q-6 16 4 26M76 46q6 16-4 26" fill="none" strokeWidth="4" />
    </>
  ),
  lens: (
    <>
      <path d="M58 58 84 84" stroke={DARK} strokeWidth="10" />
      <path d="M58 58 84 84" strokeWidth="1.4" />
      <circle cx="42" cy="42" r="26" fill={BRASS} />
      <circle cx="42" cy="42" r="20" fill="#cfe2ec" />
      <path d="M30 34q4-8 12-10" fill="none" stroke={WHITE} strokeWidth="4" />
    </>
  ),
  compass: (
    <>
      <circle cx="50" cy="52" r="34" fill={BRASS} />
      <circle cx="50" cy="52" r="27" fill={CREAM} />
      <path d="M50 28 56 52 50 76 44 52Z" fill={WHITE} strokeWidth="1.4" />
      <path d="M50 28 56 52H44Z" fill={RED} strokeWidth="1.4" />
      <circle cx="50" cy="52" r="3" fill={INK} />
      <path d="M46 14h8v6h-8Z" fill={GOLD} />
      <path d="M26 52h4M70 52h4M50 76v-2" strokeWidth="1.6" />
    </>
  ),
  coral: (
    <>
      <path
        d="M47 80V62Q40 56 34 44 30 36 31 26M34 44Q26 42 20 34M41 56Q50 46 52 34 53 26 50 18M52 34Q60 30 64 22M47 66Q58 62 66 50 70 42 76 38M66 50Q72 52 80 50"
        fill="none"
        stroke={INK}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M47 80V62Q40 56 34 44 30 36 31 26M34 44Q26 42 20 34M41 56Q50 46 52 34 53 26 50 18M52 34Q60 30 64 22M47 66Q58 62 66 50 70 42 76 38M66 50Q72 52 80 50"
        fill="none"
        stroke={RED}
        strokeWidth="5.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M30 88Q32 78 47 78 62 78 66 88Z" fill={SILVER} />
    </>
  ),
  box: (
    <>
      <path d="M20 40H80V80H20Z" fill={WOOD} />
      <path d="M16 32H84V42H16Z" fill={DARK} />
      <path d="M46 42v10h8V42" fill={GOLD} strokeWidth="1.4" />
    </>
  ),
}

export function KeepsakeArt({
  art,
  className = '',
}: {
  art: string
  className?: string
}) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <g
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {ART[art] ?? ART.box}
      </g>
    </svg>
  )
}

// The keepsake in its tissue paper: a soft bundle, folded and tied, with
// the keepsake faintly through it
export function Wrapped({
  art,
  className = '',
}: {
  art: string
  className?: string
}) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <g opacity=".35">
        <g stroke={INK} strokeWidth="2.4" strokeLinejoin="round">
          {ART[art] ?? ART.box}
        </g>
      </g>
      <g stroke="#b9a58a" strokeWidth="1.4" strokeLinejoin="round">
        <path
          d="M14 40Q12 22 30 18 46 10 60 16 82 14 88 34 94 54 86 70 80 88 58 86 40 92 24 82 8 72 12 56Z"
          fill="#fbf3ea"
          fillOpacity=".78"
        />
        <path
          d="M20 30q16 14 28 8M84 30Q68 44 56 40M18 70q18-10 32-6M84 72q-16-12-30-8"
          fill="none"
        />
        <path d="M50 18 54 40 50 62 46 84" fill="none" opacity=".6" />
      </g>
      <path
        d="M32 50q18 6 36 0"
        fill="none"
        stroke="#c97f86"
        strokeWidth="2.6"
      />
      <path
        d="M50 53q-10-12-14-4 2 8 14 4 10-12 14-4-2 8-14 4"
        fill="#e8a6a0"
        stroke="#a85a62"
        strokeWidth="1.4"
      />
    </svg>
  )
}
