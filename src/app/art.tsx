import type { ReactNode } from 'react'
import type { Motif } from './data/camino'

// Hola's pictures, drawn in ink with a wash of colour: the plain of La
// Mancha with Don Quijote, Sancho and the windmills; the pictures of the
// index and the games; and the stamps of the credential. The filters that
// roughen the lines are in ui.tsx (InkDefs).

const INK = '#1b1611'
const PAPER = '#f8f1e0'

// --- La Mancha ---

export type View =
  'home' | 'narrow' | 'hidalgo' | 'dulcinea' | 'venta' | 'sancho' | 'molinos'

// Each picture is a part of the one plain
const VIEW: Record<View, string> = {
  home: '0 0 1600 540',
  narrow: '390 96 990 384',
  hidalgo: '470 214 520 256',
  dulcinea: '540 150 620 320',
  venta: '40 236 800 236',
  sancho: '360 226 520 250',
  molinos: '610 60 750 416',
}

// Whether a chapter of Don Quijote has a picture of its own in the plain
export const hasView = (id: string): id is View => id in VIEW

// Sancho joins him in the fourth chapter
const ALONE: Array<View> = ['hidalgo', 'dulcinea', 'venta']

export function Scene({
  view = 'home',
  className = '',
  whole = false,
}: {
  view?: View
  className?: string
  // The whole view shows, with more of the plain on either side, rather
  // than the view filling its frame
  whole?: boolean
}) {
  const fit = whole
    ? 'xMidYMax meet'
    : view === 'home'
      ? 'xMidYMid slice'
      : 'xMidYMax slice'
  return (
    <svg
      className={className}
      viewBox={VIEW[view]}
      preserveAspectRatio={fit}
      aria-hidden="true"
    >
      <g filter="url(#q-wash)">
        <circle cx="1170" cy="210" r="150" fill="#d0472f" opacity=".72" />
        <path
          d="M260 470C500 440 900 456 1600 444V520H200Z"
          fill="#d29a2e"
          opacity=".42"
        />
        {view !== 'home' && (
          <path
            d="M20 470C120 460 200 462 300 458V520H20ZM1600 444C1680 446 1740 448 1820 446V520H1600Z"
            fill="#d29a2e"
            opacity=".42"
          />
        )}
        <path
          d="M380 110C520 96 700 104 860 118"
          stroke="#6f97bd"
          strokeWidth="26"
          opacity=".28"
          fill="none"
        />
        <path
          d="M300 170C420 160 560 164 660 172"
          stroke="#6f97bd"
          strokeWidth="18"
          opacity=".22"
          fill="none"
        />
        {view === 'dulcinea' && (
          <path
            d="M640 232C640 214 664 210 672 226 680 210 704 214 704 232 704 252 680 262 672 276 664 262 640 252 640 232Z"
            fill="#c2402c"
            opacity=".5"
          />
        )}
      </g>
      <g
        filter="url(#q-ink)"
        fill="none"
        stroke={INK}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M220 452C420 444 640 450 860 446 1100 442 1360 448 1600 444"
          strokeWidth="3"
        />
        {view !== 'home' && (
          <path
            d="M20 456C80 454 150 455 230 452M1600 444C1680 446 1740 445 1820 447"
            strokeWidth="3"
          />
        )}
        <path
          d="M330 470C450 466 520 468 600 466M900 466C1000 462 1080 466 1180 464"
          strokeWidth="1.5"
        />
        <Windmill />
        <g transform="translate(1430 300) scale(.45)">
          <path d="M-34 330-22 160H22L34 330Z" fill={PAPER} strokeWidth="5" />
          <path d="M-28 162 0 118 28 162Z" fill={INK} strokeWidth="4" />
          <g strokeWidth="5">
            <path d="M0 146-120 60" />
            <path d="M0 146 120 232" />
            <path d="M0 146 86 30" />
            <path d="M0 146-86 262" />
          </g>
        </g>
        <g transform="translate(1530 330) scale(.32)">
          <path d="M-34 360-22 190H22L34 360Z" fill={PAPER} strokeWidth="6" />
          <path d="M-28 192 0 148 28 192Z" fill={INK} strokeWidth="5" />
          <g strokeWidth="6">
            <path d="M0 176-110 120" />
            <path d="M0 176 110 232" />
            <path d="M0 176 56 70" />
            <path d="M0 176-56 282" />
          </g>
        </g>
        <Knight />
        {!ALONE.includes(view) && <Sancho />}
        {view === 'hidalgo' && <Books />}
        {view === 'venta' && <Inn />}
      </g>
      <g filter="url(#q-blot)" fill={INK}>
        <circle cx="1046" cy="214" r="9" />
        <circle cx="1066" cy="204" r="4" />
        <circle cx="1078" cy="222" r="3" />
        <circle cx="1030" cy="196" r="3" />
        <circle cx="1090" cy="196" r="2.5" />
        <circle cx="1060" cy="238" r="2" />
        <circle cx="1100" cy="214" r="1.8" />
        <circle cx="1116" cy="200" r="1.5" />
        <circle cx="880" cy="96" r="13" />
        <circle cx="904" cy="88" r="4" />
        <circle cx="864" cy="120" r="3" />
        <circle cx="910" cy="112" r="2" />
        <circle cx="1490" cy="90" r="6" />
        <circle cx="1506" cy="104" r="2.5" />
        <circle cx="560" cy="300" r="3" />
        <circle cx="572" cy="288" r="1.6" />
      </g>
      <g filter="url(#q-blot)" fill="#c2402c" opacity=".85">
        <circle cx="980" cy="70" r="8" />
        <circle cx="994" cy="60" r="3" />
        <circle cx="330" cy="420" r="5" />
      </g>
    </svg>
  )
}

const BLADE = (
  <>
    <path d="M0 266 0 92" />
    <path d="M0 250 26 246 26 104 0 100" />
    <path d="M0 226H26M0 196H26M0 166H26M0 136H26M13 248V102" />
  </>
)

function Windmill() {
  return (
    <g transform="translate(1170 0)">
      <path d="M-34 446-22 280H22L34 446Z" fill={PAPER} strokeWidth="3" />
      <path d="M-28 282 0 238 28 282Z" fill={INK} strokeWidth="2" />
      <path d="M-8 446V420C-8 410 8 410 8 420V446" strokeWidth="2.5" />
      <path d="M-6 336H6V350H-6Z" strokeWidth="2" />
      <g strokeWidth="2.6">
        {[-24, 66, 156, 246].map((a) => (
          <g key={a} transform={`rotate(${a} 0 266)`}>
            {BLADE}
          </g>
        ))}
      </g>
      <circle cx="0" cy="266" r="7" fill={INK} />
    </g>
  )
}

// Don Quijote on Rocinante, his lance at the windmill
function Knight() {
  return (
    <g strokeWidth="2.6">
      <path
        d="M642 352C652 338 700 332 744 334 760 336 768 346 766 358 762 370 740 374 706 374 676 374 652 370 642 360Z"
        fill={PAPER}
      />
      <path
        d="M664 352C668 344 670 340 676 337M682 356C686 348 688 342 692 338M700 358C703 350 705 344 707 338"
        strokeWidth="1.5"
      />
      <path
        d="M748 342C758 318 768 298 780 282L794 288C786 304 778 326 766 354Z"
        fill={PAPER}
      />
      <path
        d="M780 282C788 272 804 272 812 282L826 302C830 310 822 318 814 313L796 298Z"
        fill={PAPER}
      />
      <path
        d="M784 276 782 264 790 274M792 274 794 262 798 274"
        strokeWidth="2"
      />
      <path
        d="M776 290 768 296M772 302 764 308M768 314 760 320M764 326 756 332"
        strokeWidth="1.6"
      />
      <path d="M752 372 757 404 750 444M738 372 733 406 740 444M660 370C650 386 650 400 656 410L646 444M675 372C668 390 670 404 676 412L670 444" />
      <path
        d="M745 444H754M735 444H744M641 444H650M665 444H674"
        strokeWidth="3.4"
      />
      <path d="M643 354C627 362 620 382 627 406" strokeWidth="2" />
      <path d="M707 334 711 300 714 270" />
      <path d="M707 336C704 352 702 370 704 390L698 396H712" />
      <path d="M713 276C722 284 730 292 738 300" />
      <circle cx="716" cy="256" r="9" fill={PAPER} />
      <path
        d="M704 252C705 240 728 238 729 252Z"
        fill="#d29a2e"
        strokeWidth="2"
      />
      <path d="M700 252H733" strokeWidth="2.4" />
      <path d="M713 265 716 276 720 265" strokeWidth="1.6" />
      <ellipse cx="700" cy="304" rx="11" ry="17" fill={PAPER} />
      <path d="M700 290V318" strokeWidth="1.4" />
      <path d="M690 322 1046 216" strokeWidth="3" />
    </g>
  )
}

// Sancho on his donkey
function Sancho() {
  return (
    <g strokeWidth="2.4">
      <path
        d="M402 408C402 394 420 388 444 388 466 388 478 396 478 408 478 420 462 426 440 426 418 426 402 420 402 408Z"
        fill={PAPER}
      />
      <path d="M412 424 410 446M424 426 425 446M456 426 458 446M468 422 472 446" />
      <path d="M474 398C482 392 488 386 494 386 502 386 508 394 504 404 502 410 496 412 490 408" />
      <path
        d="M490 388 486 366 494 384M497 387 502 366 501 388"
        strokeWidth="2"
      />
      <path d="M403 404C393 408 390 418 392 430" strokeWidth="1.6" />
      <path
        d="M424 384C418 370 424 352 440 350 456 350 462 368 456 384Z"
        fill={PAPER}
      />
      <circle cx="441" cy="338" r="10" fill={PAPER} />
      <path
        d="M424 332C428 322 454 322 458 332Z"
        fill="#c2402c"
        strokeWidth="2"
      />
      <path d="M418 332H464" strokeWidth="2.4" />
      <path
        d="M430 384 426 402 432 404M452 384 456 402 450 404"
        strokeWidth="2"
      />
      <path d="M426 362 418 376M456 362 466 374" strokeWidth="2" />
    </g>
  )
}

// The books of chivalry that turned his head, and a candle to read them by
function Books() {
  return (
    <g strokeWidth="2.2">
      <path d="M526 446H604V432H526Z" fill={PAPER} />
      <path d="M532 432H598V418H532Z" fill="#c2402c" fillOpacity=".45" />
      <path d="M522 418H594V404H522Z" fill={PAPER} />
      <path d="M530 404H588V392H530Z" fill="#4f7fa8" fillOpacity=".45" />
      <path
        d="M534 446V432M592 432V418M528 418V404M582 404V392"
        strokeWidth="1.4"
      />
      <path d="M616 446H630M623 446V418" />
      <path d="M619 418H627V410H619Z" fill={PAPER} />
      <path
        d="M623 410C619 404 622 398 623 392 625 398 628 404 623 410Z"
        fill="#d29a2e"
      />
    </g>
  )
}

// An inn on the road, where the innkeeper dubs him a knight
function Inn() {
  return (
    <g strokeWidth="2.4">
      <path d="M78 454V372H302V452" fill={PAPER} />
      <path d="M64 376 190 330 316 376Z" fill="#c2402c" fillOpacity=".4" />
      <path
        d="M100 368 104 358M130 356 134 346M160 346 164 336M220 346 216 336M250 356 246 346M280 368 276 358"
        strokeWidth="1.5"
      />
      <path d="M170 454V412C170 398 198 398 198 412V454" />
      <path d="M104 398H134V420H104ZM234 398H264V420H234Z" />
      <path d="M119 398V420M249 398V420" strokeWidth="1.4" />
      <path d="M302 390H336M326 390V400" />
      <path d="M312 400H342V418H312Z" fill={PAPER} />
      <path d="M318 409H336" strokeWidth="1.6" />
    </g>
  )
}

// --- The index ---

export type TocId = 'quijote' | 'viaje' | 'leyendas' | 'caso'

const TOC_IDS = new Set<string>(['quijote', 'viaje', 'leyendas', 'caso'])

// Whether a story has a drawing of its own in the index
export const isTocId = (id: string): id is TocId => TOC_IDS.has(id)

export function TocArt({
  id,
  className = '',
}: {
  id: TocId
  className?: string
}) {
  const ink = (children: ReactNode) => (
    <g
      filter="url(#q-ink)"
      fill="none"
      stroke={INK}
      strokeWidth="2"
      strokeLinecap="round"
    >
      {children}
    </g>
  )
  return (
    <svg className={className} viewBox="0 0 120 92" aria-hidden="true">
      {id === 'viaje' && (
        <>
          {ink(
            <>
              <path d="M4 72H116" />
              <path d="M14 66H74V48H14Z" fill={PAPER} />
              <path d="M74 54C84 54 90 60 92 66H74" />
              <circle cx="26" cy="70" r="5" fill={INK} />
              <circle cx="62" cy="70" r="5" fill={INK} />
              <path d="M20 54H28M36 54H44M52 54H60" strokeWidth="3" />
              <path d="M84 44C84 34 92 30 98 30" strokeWidth="1.5" />
            </>,
          )}
          <circle
            cx="98"
            cy="22"
            r="10"
            fill="#c2402c"
            opacity=".6"
            filter="url(#q-w2)"
          />
        </>
      )}
      {id === 'quijote' &&
        ink(
          <>
            <path d="M4 80H116" />
            <path d="M78 80 84 34H96L102 80Z" fill={PAPER} />
            <path d="M80 36 90 22 100 36Z" fill={INK} />
            <path d="M90 30 60 4M90 30 118 56M90 30 112 2M90 30 66 62" />
            <path d="M14 80 18 58 40 56 44 80M18 58C12 54 10 48 12 44" />
            <path d="M30 56 32 38M32 40 70 18" />
          </>,
        )}
      {id === 'leyendas' && (
        <>
          <circle
            cx="30"
            cy="22"
            r="13"
            fill="#4f7fa8"
            opacity=".45"
            filter="url(#q-w2)"
          />
          {ink(
            <>
              <path d="M4 82C28 64 62 58 116 68" />
              <path
                d="M24 16C16 22 18 34 28 36 22 32 20 22 24 16Z"
                fill={INK}
              />
              <path d="M74 64V30C74 22 92 22 92 30V62" fill={PAPER} />
              <path
                d="M78 46C78 38 88 38 88 46L90 50H76Z"
                fill="#d29a2e"
                fillOpacity=".6"
              />
              <path d="M83 30V38" strokeWidth="1.5" />
              <path
                d="M38 80C38 66 42 56 48 56 54 56 58 66 58 80 54 77 52 81 48 78 44 81 42 77 38 80Z"
                fill={PAPER}
                strokeDasharray="3 2"
              />
              <path d="M45 64H46M51 64H52" strokeWidth="2.5" />
            </>,
          )}
        </>
      )}
      {id === 'caso' && (
        <>
          <circle
            cx="46"
            cy="52"
            r="22"
            fill="#d29a2e"
            opacity=".45"
            filter="url(#q-w2)"
          />
          {ink(
            <>
              <circle cx="46" cy="52" r="24" fill={PAPER} fillOpacity=".4" />
              <circle cx="46" cy="52" r="19" />
              <path d="M46 52V38M46 52 56 58" strokeWidth="2.5" />
              <path d="M46 35V33M63 52H65M46 69V71M27 52H29" />
              <path d="M42 28H50V23H42Z" fill={INK} />
              <circle cx="46" cy="18" r="4" />
              <path d="M50 17C66 8 88 10 98 24" strokeDasharray="2 3" />
              <circle cx="92" cy="62" r="12" fill="#4f7fa8" fillOpacity=".25" />
              <path d="M100 71 112 84" strokeWidth="5" />
            </>,
          )}
        </>
      )}
    </svg>
  )
}

// --- The games ---

export type GameIconId =
  | 'palabra'
  | 'palabras'
  | 'crucigrama'
  | 'rosco'
  | 'cadaver'
  | 'sopa'
  | 'reloj'
  | 'letras'
  | 'cadena'
  | 'tapas'
  | 'porpara'
  | 'tiempos'
  | 'elola'
  | 'orden'
  | 'rastro'
  | 'numeros'
  | 'taxi'

export function GameIcon({
  id,
  className = '',
}: {
  id: GameIconId
  className?: string
}) {
  return (
    <svg className={className} viewBox="0 0 44 44" aria-hidden="true">
      {id === 'palabra' && (
        <>
          <g fill="none" stroke={INK} strokeWidth="1.6">
            {[3, 13, 23, 33].map((x) => (
              <rect key={`a${x}`} x={x} y="8" width="8" height="10" />
            ))}
            {[3, 13, 23, 33].map((x) => (
              <rect key={`b${x}`} x={x} y="22" width="8" height="10" />
            ))}
          </g>
          <g fill="#4f7fa8" opacity=".7">
            <rect x="4" y="9" width="6" height="8" />
            <rect x="34" y="9" width="6" height="8" />
          </g>
          <rect x="14" y="9" width="6" height="8" fill="#d29a2e" opacity=".7" />
          <g fill="#4f7fa8" opacity=".7">
            {[4, 14, 24, 34].map((x) => (
              <rect key={x} x={x} y="23" width="6" height="8" />
            ))}
          </g>
        </>
      )}
      {id === 'palabras' && (
        <>
          <g fill="none" stroke={INK} strokeWidth="1.6">
            <rect x="4" y="4" width="36" height="36" />
            <rect x="8" y="18" width="9" height="9" fill={PAPER} />
            <rect x="17" y="18" width="9" height="9" fill={PAPER} />
            <rect x="26" y="18" width="9" height="9" fill={PAPER} />
            <rect x="17" y="9" width="9" height="9" fill={PAPER} />
          </g>
          <text
            x="21.5"
            y="25.5"
            textAnchor="middle"
            fontFamily="IM Fell English, serif"
            fontSize="8"
          >
            Ñ
          </text>
        </>
      )}
      {id === 'crucigrama' && (
        <>
          <g fill="none" stroke={INK} strokeWidth="1.4">
            <rect x="5" y="5" width="34" height="34" />
            <path d="M11.8 5V39M18.6 5V39M25.4 5V39M32.2 5V39M5 11.8H39M5 18.6H39M5 25.4H39M5 32.2H39" />
          </g>
          <g fill={INK}>
            <rect x="5" y="5" width="6.8" height="6.8" />
            <rect x="32.2" y="32.2" width="6.8" height="6.8" />
          </g>
        </>
      )}
      {id === 'rosco' && (
        <g fill="none" stroke={INK} strokeWidth="1.6">
          <circle cx="22" cy="6" r="3.5" />
          <circle cx="33" cy="10" r="3.5" />
          <circle cx="38" cy="22" r="3.5" />
          <circle cx="33" cy="34" r="3.5" fill="#c2402c" fillOpacity=".6" />
          <circle cx="22" cy="38" r="3.5" />
          <circle cx="11" cy="34" r="3.5" />
          <circle cx="6" cy="22" r="3.5" />
          <circle cx="11" cy="10" r="3.5" fill="#4f7fa8" fillOpacity=".6" />
        </g>
      )}
      {id === 'cadaver' && (
        <g fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round">
          <path d="M22 4C28 4 30 10 28 14 26 18 18 18 16 14 14 10 16 4 22 4Z" />
          <path d="M14 18H30L34 28H10Z" fill="#c2402c" fillOpacity=".45" />
          <path d="M12 30H32L28 40H16Z" fill="#4f7fa8" fillOpacity=".45" />
          <path d="M6 16H38M6 29H38" strokeDasharray="2 3" />
        </g>
      )}
      {id === 'sopa' && (
        <>
          <path
            d="M10 34 34 10"
            stroke="#4f7fa8"
            strokeWidth="8"
            strokeLinecap="round"
            opacity=".55"
          />
          <path
            d="M8 22H20"
            stroke="#d29a2e"
            strokeWidth="7"
            strokeLinecap="round"
            opacity=".6"
          />
          <g fill="none" stroke={INK} strokeWidth="1.5">
            <rect x="4" y="4" width="36" height="36" />
            <path d="M16 4V40M28 4V40M4 16H40M4 28H40" />
          </g>
          <g fill={INK}>
            {[16, 28].flatMap((x) =>
              [16, 28].map((y) => (
                <circle key={`${x},${y}`} cx={x} cy={y} r="1.8" />
              )),
            )}
          </g>
        </>
      )}
      {id === 'reloj' && (
        <>
          <rect
            x="2"
            y="25"
            width="23"
            height="16"
            fill="#4f7fa8"
            opacity=".2"
          />
          <path
            d="M7 25C6 17 13 11.5 20.5 11.5 29 11.5 34.5 17 34.5 25 34.5 30 33.5 34.5 31 38.5 28.5 35.5 28 31 25.5 27.5 24 25.5 21 25 7 25Z"
            fill="#d29a2e"
            opacity=".65"
          />
          <g
            fill="none"
            stroke={INK}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1.5 25H25V41.5" />
            <path d="M7 25C6 17 13 11.5 20.5 11.5 29 11.5 34.5 17 34.5 25 34.5 30 33.5 34.5 31 38.5 28.5 35.5 28 31 25.5 27.5" />
            <path d="M20.5 11.5V9" />
            <circle cx="20.5" cy="7.3" r="1.7" />
            <path d="M20.5 19.5V15.2M20.5 19.5 24.5 21.2" strokeWidth="1.4" />
          </g>
          <path
            d="M31 40.2c.9 1.2 1.4 1.9 1.4 2.5a1.4 1.4 0 0 1-2.8 0c0-.6.5-1.3 1.4-2.5z"
            fill={INK}
          />
        </>
      )}
      {id === 'letras' && (
        <>
          <circle
            cx="33"
            cy="9"
            r="6"
            fill="#c2402c"
            opacity=".6"
            filter="url(#q-w2)"
          />
          <g fill="none" stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
            <path d="M3 33H41V38H3ZM3 33V21H6.5V33" fill={PAPER} />
            {[8, 19, 30].map((x) => (
              <rect key={x} x={x} y="18" width="10" height="15" fill={PAPER} />
            ))}
          </g>
          <rect
            x="20"
            y="19"
            width="8"
            height="13"
            fill="#d29a2e"
            opacity=".5"
          />
          <g
            fontFamily="IM Fell English, serif"
            fontSize="10"
            textAnchor="middle"
            fill={INK}
          >
            <text x="13" y="29.5">
              S
            </text>
            <text x="24" y="29.5" fill="#c2402c">
              O
            </text>
            <text x="35" y="29.5">
              L
            </text>
          </g>
        </>
      )}
      {id === 'cadena' && (
        <>
          <path
            d="M2 9Q22 24 42 9"
            fill="none"
            stroke={INK}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <g fill={PAPER} stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
            {[
              [8, 12.8, -14],
              [17, 16, -5],
              [26, 16.2, 5],
              [35, 13.3, 14],
            ].map(([x, y, a]) => (
              <path
                key={x}
                d={`M${x - 3.6} ${y}H${x + 3.6}V${y + 11}L${x} ${y + 8}L${x - 3.6} ${y + 11}Z`}
                transform={`rotate(${a} ${x} ${y})`}
              />
            ))}
          </g>
          <g opacity=".55">
            <path
              d="M5 13.4H11.6V23.4L8.3 20.7L5 23.4Z"
              fill="#c2402c"
              transform="rotate(-14 8 12.8)"
            />
            <path
              d="M23 16.8H29.6V26.8L26.3 24.1L23 26.8Z"
              fill="#d29a2e"
              transform="rotate(5 26 16.2)"
            />
            <path
              d="M32 13.9H38.6V23.9L35.3 21.2L32 23.9Z"
              fill="#4f7fa8"
              transform="rotate(14 35 13.3)"
            />
          </g>
        </>
      )}
      {id === 'elola' && (
        <g stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
          <g transform="rotate(-11 14 26)">
            <rect x="5" y="9" width="17" height="26" rx="2" fill={PAPER} />
            <path
              d="M12.6 31C12.2 26 11.6 20 11.2 16 11 13.5 12 12 13.5 12 15 12 16.2 13.5 16 16 15.7 20 15.1 26 14.6 31Z"
              fill="#4f7fa8"
              fillOpacity=".65"
              strokeWidth="1.1"
            />
          </g>
          <g transform="rotate(11 30 26)">
            <rect x="22" y="9" width="17" height="26" rx="2" fill={PAPER} />
            <path
              d="M25.6 15H35.4C35.4 21 33.2 23.6 30.5 23.6 27.8 23.6 25.6 21 25.6 15Z"
              fill="#c2402c"
              fillOpacity=".6"
              strokeWidth="1.1"
            />
            <path
              d="M30.5 23.6V28.5M27.2 30H33.8"
              fill="none"
              strokeWidth="1.1"
            />
          </g>
        </g>
      )}
      {id === 'orden' && (
        <>
          <g fill="none" stroke={INK} strokeWidth="1.5">
            <rect x="4" y="5" width="36" height="34" fill={PAPER} />
            <rect x="7.5" y="8.5" width="13" height="10" />
            <rect x="23.5" y="8.5" width="13" height="10" />
            <path d="M8.5 21.5H19.5M24.5 21.5H35.5" strokeWidth="1.2" />
            <rect x="7" y="27" width="9" height="7" fill={PAPER} />
            <rect x="17.5" y="27" width="9" height="7" fill={PAPER} />
            <rect x="28" y="27" width="9" height="7" fill={PAPER} />
          </g>
          <circle cx="14" cy="13.5" r="2.8" fill="#d29a2e" opacity=".75" />
          <path
            d="M24.5 18 28.5 12.5 31.5 15.5 33.5 13 35.5 18Z"
            fill="#4f7fa8"
            opacity=".6"
          />
          <rect
            x="18.3"
            y="27.8"
            width="7.4"
            height="5.4"
            fill="#c2402c"
            opacity=".5"
          />
        </>
      )}
      {id === 'numeros' && (
        <>
          <g transform="rotate(-9 19 19)">
            <rect
              x="3"
              y="8"
              width="32"
              height="21"
              fill={PAPER}
              stroke={INK}
              strokeWidth="1.5"
            />
            <path
              d="M6 12.5Q9 10.5 12 12.5T18 12.5T24 12.5T30 12.5"
              fill="none"
              stroke={INK}
              strokeWidth="1"
            />
            <circle cx="11" cy="21" r="4" fill="#4f7fa8" opacity=".55" />
            <circle
              cx="11"
              cy="21"
              r="4"
              fill="none"
              stroke={INK}
              strokeWidth="1.1"
            />
            <path d="M18 19.5H31M18 23.5H27" stroke={INK} strokeWidth="1.2" />
          </g>
          <circle cx="33" cy="32" r="8" fill={PAPER} />
          <circle cx="33" cy="32" r="8" fill="#d29a2e" opacity=".6" />
          <circle
            cx="33"
            cy="32"
            r="8"
            fill="none"
            stroke={INK}
            strokeWidth="1.5"
          />
          <text
            x="33"
            y="35.6"
            textAnchor="middle"
            fontFamily="IM Fell English, serif"
            fontSize="10.5"
            fill={INK}
          >
            7
          </text>
        </>
      )}
      {id === 'taxi' && (
        <>
          <rect
            x="22"
            y="11"
            width="6.5"
            height="3.6"
            fill="#d29a2e"
            opacity=".75"
            stroke={INK}
            strokeWidth="1.1"
          />
          <path
            d="M3.5 29.5C3.5 25.6 5.6 24.3 9 23.8L13.4 23.2 17.3 16.7C18.1 15.6 19.2 15 20.8 15H29.4C30.9 15 32 15.6 32.9 16.9L36.6 22.6C39.4 23.1 41 24.4 41 27.4V30.3C41 31.1 40.5 31.6 39.7 31.6H4.8C4 31.6 3.5 31.1 3.5 30.3Z"
            fill={PAPER}
            stroke={INK}
            strokeWidth="1.5"
          />
          <path
            d="M19.6 31.6 23.6 23.2H27.4L23.4 31.6Z"
            fill="#c2402c"
            opacity=".6"
          />
          <g stroke={INK} strokeWidth="1.1" strokeLinejoin="round">
            <path
              d="M15.8 22.6 19.2 17.2H24.4V22.6Z"
              fill="#4f7fa8"
              fillOpacity=".45"
            />
            <path
              d="M26.4 17.2H29.8C30.7 17.2 31.3 17.6 31.8 18.4L34.3 22.6H26.4Z"
              fill="#4f7fa8"
              fillOpacity=".45"
            />
          </g>
          {[12, 32.5].map((x) => (
            <g key={x}>
              <circle
                cx={x}
                cy="31.6"
                r="4.3"
                fill={PAPER}
                stroke={INK}
                strokeWidth="1.5"
              />
              <circle cx={x} cy="31.6" r="1.5" fill={INK} />
            </g>
          ))}
        </>
      )}
      {id === 'tapas' && (
        <>
          <g fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round">
            <ellipse cx="22" cy="30" rx="17" ry="7" />
            <path d="M14 27C14 23 18 22 20 25M22 24C23 20 28 20 29 24" />
            <path d="M32 6V24M29 6H35" />
          </g>
          <circle cx="18" cy="27" r="3" fill="#c2402c" opacity=".6" />
          <circle cx="26" cy="26" r="3" fill="#d29a2e" opacity=".7" />
        </>
      )}
      {id === 'porpara' && (
        <g fill="none" stroke={INK} strokeWidth="1.6">
          <path
            d="M6.1 40V18.6A6 6 0 1 1 16.9 18.6V40Z"
            fill="#c2402c"
            fillOpacity=".45"
          />
          <path
            d="M27.1 40V18.6A6 6 0 1 1 37.9 18.6V40Z"
            fill="#4f7fa8"
            fillOpacity=".45"
          />
          <path d="M3 40V6H20V40M24 40V6H41V40M1 40H43" />
        </g>
      )}
      {id === 'tiempos' && (
        <>
          <rect
            x="31"
            y="6"
            width="11"
            height="22"
            fill="#4f7fa8"
            opacity=".45"
          />
          <g fill="none" stroke={INK} strokeWidth="1.6">
            <path
              d="M3.5 28A4 4 0 0 1 11.5 28Z"
              fill="#d29a2e"
              fillOpacity=".7"
            />
            <circle cx="22" cy="15" r="3.5" fill="#c2402c" fillOpacity=".6" />
            <path
              d="M37.7 11.2A4 4 0 1 0 37.7 18.8 4 4 0 0 1 37.7 11.2Z"
              fill={PAPER}
              strokeWidth="1.2"
            />
            <path d="M2 6H13V38H2ZM16.5 6H27.5V38H16.5ZM31 6H42V38H31Z" />
            <path d="M2 28H13M16.5 28H27.5M31 28H42" />
          </g>
        </>
      )}
      {id === 'rastro' && (
        <>
          <path d="M5 16 8 7H36L39 16Z" fill="#c2402c" opacity=".5" />
          <g
            fill="none"
            stroke={INK}
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <path d="M5 16 8 7H36L39 16" />
            <path d="M5 16C6.7 19 10.1 19 11.8 16 13.5 19 16.9 19 18.6 16 20.3 19 23.7 19 25.4 16 27.1 19 30.5 19 32.2 16 33.9 19 37.3 19 39 16" />
            <path d="M14.7 7 13 16M22 7V16M29.3 7 31 16" />
            <path d="M8 19V38M36 19V38M6 30H38M3 38H41" />
          </g>
          <path
            d="M12 30A5 5 0 0 1 22 30Z"
            fill="#d29a2e"
            fillOpacity=".7"
            stroke={INK}
            strokeWidth="1.2"
          />
          <circle
            cx="29"
            cy="26"
            r="3.6"
            fill={PAPER}
            stroke={INK}
            strokeWidth="1.2"
          />
          <path
            d="M29 24V26L30.4 27"
            stroke={INK}
            strokeWidth="1"
            fill="none"
          />
        </>
      )}
    </svg>
  )
}

// --- The credential's stamps ---

const STAMP_COLOR = ['#c2402c', '#4f7fa8', INK, '#d29a2e']
type Frame = 'circle' | 'rect' | 'diamond' | 'oval'
const FRAMES: Array<Frame> = ['circle', 'rect', 'circle', 'diamond', 'oval']

// The stamp of a stage: the town's motif in a frame, each stage in its own
// colour and frame, as the towns' stamps differ
export function Stamp({
  motif,
  n,
  className = '',
}: {
  motif: Motif
  // The stage's number, counting from 1
  n: number
  className?: string
}) {
  const c = STAMP_COLOR[(n - 1) % STAMP_COLOR.length]
  const frame = FRAMES[(n - 1) % FRAMES.length]
  return (
    <svg className={className} viewBox="0 0 60 56" aria-hidden="true">
      <g
        filter="url(#q-ring)"
        fill="none"
        stroke={c}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {frame === 'circle' && (
          <circle cx="30" cy="28" r="24" strokeWidth="3" />
        )}
        {frame === 'rect' && (
          <rect x="7" y="5" width="46" height="46" rx="6" strokeWidth="3" />
        )}
        {frame === 'diamond' && (
          <path d="M30 2 56 28 30 54 4 28Z" strokeWidth="3" />
        )}
        {frame === 'oval' && (
          <ellipse cx="30" cy="28" rx="26" ry="22" strokeWidth="3" />
        )}
        {frame === 'circle' && (
          <circle cx="30" cy="28" r="20" strokeWidth="1" />
        )}
        <g strokeWidth="2.4">{MOTIF[motif](c)}</g>
      </g>
    </svg>
  )
}

// The stage still to walk: a dashed ring, and its day
export function EmptyStamp({
  label,
  className = '',
}: {
  label: string
  className?: string
}) {
  return (
    <svg className={className} viewBox="0 0 60 56" aria-hidden="true">
      <circle
        cx="30"
        cy="28"
        r="24"
        fill="none"
        stroke="#b9a27e"
        strokeWidth="2"
        strokeDasharray="4 5"
      />
      <text
        x="30"
        y="33"
        textAnchor="middle"
        fontFamily="IM Fell English, serif"
        fontSize="14"
        fill="#8b7656"
      >
        {label}
      </text>
    </svg>
  )
}

const MOTIF: Record<Motif, (c: string) => ReactNode> = {
  // The scallop, the Camino's own sign
  shell: (c) => (
    <>
      <path
        d="M30 44 15 28C15 20 22 14 30 14 38 14 45 20 45 28Z"
        fill={c}
        fillOpacity=".25"
      />
      <path
        d="M30 44 20 19M30 44 25 15.5M30 44V14M30 44 35 15.5M30 44 40 19"
        strokeWidth="1.6"
      />
      <path d="M25 44H35V48H25Z" fill={c} />
    </>
  ),
  cross: (c) => (
    <>
      <path d="M30 12V44M19 23H41" strokeWidth="4" />
      <path d="M26 12H34M26 44H34M19 19V27M41 19V27" strokeWidth="2" />
      <circle cx="30" cy="23" r="2.5" fill={c} />
    </>
  ),
  bridge: () => (
    <>
      <path d="M8 30C18 24 42 24 52 30" />
      <path d="M8 40H52" />
      <path d="M12 40C12 32 22 32 22 40M25 40C25 30 35 30 35 40M38 40C38 32 48 32 48 40" />
      <path
        d="M12 46C16 44 20 48 24 46S32 44 36 46 44 48 48 46"
        strokeWidth="1.4"
      />
    </>
  ),
  tower: (c) => (
    <>
      <path d="M23 46V22H37V46Z" fill={c} fillOpacity=".2" />
      <path d="M21 22V15H25V18H28V15H32V18H35V15H39V22Z" />
      <path d="M27.5 46V39C27.5 36 32.5 36 32.5 39V46" />
      <path d="M29 27H31V31H29Z" fill={c} />
    </>
  ),
  grapes: (c) => (
    <>
      {[
        [24, 24],
        [30, 24],
        [36, 24],
        [27, 30],
        [33, 30],
        [30, 36],
      ].map(([x, y]) => (
        <circle
          key={`${x},${y}`}
          cx={x}
          cy={y}
          r="3.4"
          fill={c}
          fillOpacity=".35"
        />
      ))}
      <path d="M30 20V13M30 15C33 11 38 12 40 15 36 17 33 17 30 15" />
    </>
  ),
  rooster: (c) => (
    <>
      <path
        d="M20 38C18 30 24 26 30 27L34 19C36 15 41 16 41 20L39 27C43 31 41 39 33 40H24C22 40 21 39 20 38Z"
        fill={c}
        fillOpacity=".2"
      />
      <path d="M36 16 37 12 39 15 41 12 41 17" />
      <path d="M41 20 45 21 41 23" />
      <path d="M20 36C14 33 13 25 17 20M21 32C17 28 18 23 21 21" />
      <path d="M27 40V46M33 40V46M25 46H29M31 46H35" />
    </>
  ),
  lion: (c) => (
    <>
      <path
        d="M30 12 34 16 39 14 40 19 45 21 42 25 45 30 40 32 40 37 35 37 32 42 28 39 23 41 22 36 17 34 19 29 15 25 19 22 18 17 23 17 26 13Z"
        fill={c}
        fillOpacity=".2"
      />
      <circle cx="30" cy="27" r="7.5" />
      <circle cx="27" cy="25.5" r="1" fill={c} />
      <circle cx="33" cy="25.5" r="1" fill={c} />
      <path d="M28 30.5H32L30 32.5Z" fill={c} />
    </>
  ),
  castle: (c) => (
    <>
      <path
        d="M15 46V27H21V21H25V27H35V21H39V27H45V46Z"
        fill={c}
        fillOpacity=".2"
      />
      <path d="M15 27V23M45 27V23M21 21V18M25 21V18M35 21V18M39 21V18" />
      <path d="M26 46V38C26 34 34 34 34 38V46" />
      <path d="M18 32H20V35H18ZM40 32H42V35H40Z" fill={c} />
    </>
  ),
  wheat: (c) => (
    <>
      <path d="M30 46V12" />
      {[16, 22, 28, 34].map((y) => (
        <g key={y}>
          <ellipse
            cx="26"
            cy={y}
            rx="2.4"
            ry="5"
            transform={`rotate(-35 26 ${y})`}
            fill={c}
            fillOpacity=".3"
          />
          <ellipse
            cx="34"
            cy={y + 3}
            rx="2.4"
            ry="5"
            transform={`rotate(35 34 ${y + 3})`}
            fill={c}
            fillOpacity=".3"
          />
        </g>
      ))}
    </>
  ),
  mountain: (c) => (
    <>
      <path d="M8 42 22 22 28 30 37 16 52 42Z" fill={c} fillOpacity=".2" />
      <path d="M33 22 37 16 41 22 37 20Z" fill={c} />
      <path d="M12 46H48" strokeWidth="1.4" />
    </>
  ),
  // Compostela: the field of the star
  star: (c) => (
    <path d={starPath(30, 28, 15, 6.5, 8)} fill={c} fillOpacity=".3" />
  ),
  // Fisterra: the sun going down into the sea at the end of the world
  sun: (c) => (
    <>
      <path d="M15 36A15 15 0 0 1 45 36Z" fill={c} fillOpacity=".3" />
      <path d="M30 14V18M17 20 20 23M43 20 40 23M11 31H15M45 31H49" />
      <path
        d="M10 41C14 39 18 43 22 41S30 39 34 41 42 43 50 41M14 46C18 44 22 48 26 46S34 44 38 46 44 47 46 46"
        strokeWidth="1.6"
      />
    </>
  ),
}

function starPath(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  points: number,
): string {
  const out: Array<string> = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? r1 : r2
    const a = (Math.PI * i) / points - Math.PI / 2
    out.push(
      `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`,
    )
  }
  return `M${out.join('L')}Z`
}
