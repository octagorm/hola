import type { ReactNode } from 'react'
import type { Pic } from '../data/orden'

// The little woodcuts of Orden's broadsheet, one for each picture a
// sentence can have, drawn in ink and coloured by hand in four colours:
// the classes r, b, y and g (red, blue, yellow, green), s for the sky, p
// for the paper and k for ink. `bare` leaves them uncoloured, as a print
// before the colour is laid on (games/orden.css).

const PICS: Record<Pic, ReactNode> = {
  casa: (
    <>
      <rect className="s" x="0" y="0" width="120" height="66" stroke="none" />
      <circle className="y" cx="101" cy="15" r="7" />
      <path className="g" d="M0 66H120V84H0Z" />
      <path d="M6 74 14 72M22 79 32 76M88 76 98 73M104 80 114 77" />
      <rect className="p" x="32" y="35" width="56" height="33" />
      <path className="r" d="M27 37 60 15 93 37Z" />
      <path d="M36 32 60 17 84 32M44 27H76" strokeWidth="0.9" />
      <rect className="p" x="74" y="18" width="6" height="11" />
      <rect className="b" x="54" y="48" width="12" height="20" />
      <circle className="k" cx="63" cy="58" r="0.9" />
      <rect className="b" x="38" y="42" width="10" height="10" />
      <rect className="b" x="72" y="42" width="10" height="10" />
      <path d="M43 42V52M38 47H48M77 42V52M72 47H82" strokeWidth="1" />
      <rect className="r" x="37" y="52.5" width="12" height="3.5" />
      <path
        className="g"
        d="M38 52.5C38 49 41 49 41 52.5M45 52.5C45 49 48 49 48 52.5"
      />
      <path d="M85 39V66M87.5 42V64M83 56V66" strokeWidth="0.8" />
    </>
  ),
  cafe: (
    <>
      <rect className="s" x="0" y="0" width="120" height="84" stroke="none" />
      <path className="p" d="M0 0H120V13H0Z" />
      {[0, 24, 48, 72, 96].map((x) => (
        <path key={x} className="r" d={`M${x} 0h12v13h-12Z`} />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <path
          key={i}
          className={i % 2 ? 'p' : 'r'}
          d={`M${i * 12} 13a6 6 0 0 0 12 0Z`}
        />
      ))}
      <ellipse className="y" cx="60" cy="63" rx="42" ry="8" />
      <path d="M60 71V84M50 84H70M28 63H24" />
      <path d="M86 66 96 64M80 68 88 67" strokeWidth="0.8" />
      <ellipse className="p" cx="60" cy="56" rx="19" ry="4.6" />
      <path
        className="p"
        d="M45 35H75V45C75 52 69 56 60 56 51 56 45 52 45 45Z"
      />
      <path className="b" d="M45.3 40H74.7V44.5H45.3Z" stroke="none" />
      <path d="M45 40H75M45 44.5H75" strokeWidth="0.9" />
      <path d="M75 39C84 39 84 50 74 50" strokeWidth="2.2" />
      <path d="M68 47 66 53M71 45 70 50" strokeWidth="0.8" />
      <path
        d="M53 31C49 26 57 23 53 17M61 31C57 25 65 22 61 15M69 30C66 26 72 24 69 20"
        strokeWidth="1.3"
      />
    </>
  ),
  tren: (
    <>
      <rect className="s" x="0" y="0" width="120" height="70" stroke="none" />
      <path
        className="g"
        d="M0 52C18 46 30 48 44 52 62 44 86 44 120 50V70H0Z"
      />
      <rect className="p" x="96" y="38" width="7" height="7" />
      <path className="r" d="M95 38 99.5 34.5 104 38Z" />
      <path className="y" d="M0 70H120V84H0Z" />
      <path d="M0 72.5H120M0 76.5H120" strokeWidth="1.3" />
      {[4, 16, 28, 40, 52, 64, 76, 88, 100, 112].map((x) => (
        <path key={x} d={`M${x} 72.5 ${x - 2} 81`} strokeWidth="0.9" />
      ))}
      <path
        className="p"
        d="M30 24C25 19 30 12 36 14 38 7 48 7 51 13 57 10 64 16 60 23Z"
      />
      <path
        className="p"
        d="M12 16C9 12 13 7 18 9 20 5 27 6 27 11 30 13 26 18 21 17Z"
      />
      <path className="k" d="M33 40V29H40V40ZM30 29H43V25.5H30Z" />
      <rect className="b" x="27" y="40" width="44" height="18" rx="3" />
      <path className="y" d="M48 40C48 33.5 57 33.5 57 40Z" />
      <path d="M33 44V54M40 44V54" strokeWidth="0.8" />
      <rect className="r" x="71" y="29" width="23" height="29" />
      <rect className="p" x="76" y="34" width="12" height="9" />
      <rect className="k" x="69" y="26" width="27" height="4" />
      <path className="k" d="M20 58 27 50V58Z" />
      <circle className="p" cx="37" cy="63" r="7" />
      <circle className="p" cx="55" cy="63" r="7" />
      <circle className="p" cx="83" cy="61" r="9" />
      <path
        d="M37 56V70M30 63H44M55 56V70M48 63H62M83 52V70M74 61H92"
        strokeWidth="0.8"
      />
      <path d="M37 63H83" strokeWidth="2.4" />
    </>
  ),
  sol: (
    <>
      <rect className="s" x="0" y="0" width="120" height="84" stroke="none" />
      <g strokeWidth="1.8">
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2
          const r1 = 17
          const r2 = i % 2 ? 22 : 26
          return (
            <path
              key={i}
              d={`M${(60 + r1 * Math.cos(a)).toFixed(1)} ${(31 + r1 * Math.sin(a)).toFixed(1)}L${(60 + r2 * Math.cos(a)).toFixed(1)} ${(31 + r2 * Math.sin(a)).toFixed(1)}`}
            />
          )
        })}
      </g>
      <circle className="y" cx="60" cy="31" r="13.5" />
      <path d="M53 38C57 41 63 41 67 38" strokeWidth="0.9" />
      <path
        className="g"
        d="M0 62C18 50 38 52 58 61 78 50 100 47 120 57V84H0Z"
      />
      <path className="y" d="M0 74C30 66 72 67 120 72V84H0Z" />
      <path d="M10 79 30 75M42 81 64 76M74 82 98 77" strokeWidth="0.9" />
      <rect className="p" x="86" y="47" width="9" height="7" />
      <path className="r" d="M85 47 90.5 43 96 47Z" />
      <rect className="p" x="97" y="49" width="8" height="6" />
      <path className="r" d="M96 49 101 45.5 106 49Z" />
      <path d="M100 41V45M98.5 42.5H101.5" strokeWidth="0.9" />
    </>
  ),
  gato: (
    <>
      <rect className="p" x="0" y="0" width="120" height="84" stroke="none" />
      <rect className="s" x="26" y="8" width="68" height="54" />
      <path d="M60 8V62M26 35H94" strokeWidth="1.1" />
      <rect className="b" x="10" y="8" width="16" height="54" />
      <rect className="b" x="94" y="8" width="16" height="54" />
      <path
        d="M13 14H23M13 20H23M13 26H23M13 32H23M13 38H23M13 44H23M13 50H23M13 56H23M97 14H107M97 20H107M97 26H107M97 32H107M97 38H107M97 44H107M97 50H107M97 56H107"
        strokeWidth="0.8"
      />
      <path className="y" d="M6 62H114V69H6Z" />
      <path d="M6 69 10 74H110L114 69" />
      <path
        className="k"
        d="M42 62C37 55 37 45 43 41 41 37 41 33 43 29L46.5 33.5C48.5 32.6 52.5 32.6 54.5 33.5L58 29C60 33 60 37 58 41 64 45 64 55 59 62Z"
      />
      <ellipse className="y" cx="47" cy="38" rx="1.6" ry="1.2" stroke="none" />
      <ellipse className="y" cx="54" cy="38" rx="1.6" ry="1.2" stroke="none" />
      <path d="M60 60C68 60 70 66 66 72" strokeWidth="3" />
      <path className="r" d="M78 62 80 50H94L96 62Z" />
      <path
        className="g"
        d="M87 50C84 44 80 42 78 43 80 46 84 48 87 50 88 44 92 40 96 41 94 45 91 48 87 50Z"
      />
      <circle className="r" cx="81" cy="41" r="2.6" />
      <circle className="r" cx="93" cy="38" r="2.6" />
      <circle className="r" cx="87" cy="34" r="2.6" />
    </>
  ),
  perro: (
    <>
      <rect className="s" x="0" y="0" width="120" height="70" stroke="none" />
      <circle className="y" cx="18" cy="16" r="6" />
      <path className="g" d="M0 68H120V84H0Z" />
      <path d="M12 76 20 73M98 78 108 75M58 80 66 77" />
      <path d="M33 46C26 42 24 35 27 30" strokeWidth="2.8" />
      <path
        className="y"
        d="M40 52V69H46V55M50 56V69H56V56M66 56V69H72V56M76 55V69H82V52"
      />
      <ellipse className="y" cx="60" cy="47" rx="26" ry="11" />
      <path className="k" d="M50 39C55 37 60 38 62 42 58 45 53 45 50 39Z" />
      <path
        className="y"
        d="M78 44C76 36 80 28 88 27 96 26 100 32 100 36 104 37 106 40 104 43 98 45 92 45 88 47 84 48 80 47 78 44Z"
      />
      <path className="k" d="M84 29C79 30 78 38 81 43 84 40 86 34 84 29Z" />
      <circle className="k" cx="91" cy="33" r="1.3" />
      <circle className="k" cx="104" cy="40" r="1.8" />
      <path className="r" d="M78.5 43.5 83 50 86 48.6 82 42Z" />
      <path d="M44 51 46 56M70 55 72 50" strokeWidth="0.8" />
    </>
  ),
  mesa: (
    <>
      <rect className="s" x="0" y="0" width="120" height="84" stroke="none" />
      <path d="M0 50H120" strokeWidth="1" />
      <path d="M8 8V44M112 8V44" strokeWidth="0.8" />
      <path className="b" d="M8 56H112L118 68H2Z" />
      <path className="b" d="M2 68H118V80H2Z" />
      <path
        className="p"
        d="M22 56H34L32 62H19ZM46 56H58L58 62H44ZM70 56H82L84 62H70ZM94 56H106L110 62H96ZM8 62H19L17 68H5ZM32 62H44L44 68H30ZM58 62H70L72 68H58ZM84 62H96L98 68H86ZM2 68H14V74H2ZM26 68H38V74H26ZM50 68H62V74H50ZM74 68H86V74H74ZM98 68H110V74H98ZM14 74H26V80H14ZM38 74H50V80H38ZM62 74H74V80H62ZM86 74H98V80H86ZM110 74H118V80H110Z"
        strokeWidth="0.7"
      />
      <path
        className="y"
        d="M24 57C19 49 21 38 28 33V27H38V33C45 38 47 49 42 57Z"
      />
      <path d="M38 36C46 35 48 44 43 48" strokeWidth="2" />
      <path d="M26 44C26 49 28 53 30 55" strokeWidth="0.8" />
      <path className="y" d="M54 57C53 47 73 43 80 52 82 55 81 57 79 57Z" />
      <path d="M60 50 64 47M66 51 70 48M72 52 75 50" strokeWidth="0.9" />
      <path className="p" d="M88 32H100L98 45H90Z" />
      <path className="r" d="M88.9 37H99.1L98 45H90Z" stroke="none" />
      <path d="M94 45V54M89 55H99" />
    </>
  ),
  luna: (
    <>
      <rect className="b" x="0" y="0" width="120" height="84" stroke="none" />
      <path className="y" d="M40 10A15 15 0 1 0 56 38 12 12 0 1 1 40 10Z" />
      {[
        [78, 14],
        [96, 26],
        [70, 34],
        [104, 10],
        [16, 18],
        [22, 40],
      ].map(([x, y]) => (
        <path
          key={`${x}${y}`}
          className="y"
          d={`M${x} ${y - 4}L${x + 1.2} ${y - 1.2} ${x + 4} ${y} ${x + 1.2} ${y + 1.2} ${x} ${y + 4} ${x - 1.2} ${y + 1.2} ${x - 4} ${y} ${x - 1.2} ${y - 1.2}Z`}
          strokeWidth="0.8"
        />
      ))}
      <path
        className="g"
        d="M0 64C24 56 48 56 70 62 88 56 104 55 120 58V84H0Z"
      />
      <rect className="p" x="66" y="44" width="30" height="20" />
      <path className="r" d="M63 45 81 33 99 45Z" />
      <rect className="y" x="72" y="50" width="7" height="7" />
      <rect className="k" x="85" y="52" width="6" height="12" />
      <path d="M75.5 50V57M72 53.5H79" strokeWidth="0.8" />
      <path d="M10 72 22 69M34 76 48 72M100 72 112 69" strokeWidth="0.9" />
    </>
  ),
  lluvia: (
    <>
      <rect className="s" x="0" y="0" width="120" height="84" stroke="none" />
      <path
        className="p"
        d="M18 26C12 26 10 18 16 15 16 7 26 4 31 9 35 2 47 3 49 11 56 8 63 13 61 20 66 22 65 27 60 27Z"
      />
      <path
        className="p"
        d="M66 22C62 22 61 16 65 14 66 8 73 7 76 11 79 6 88 7 89 13 95 12 99 17 96 22Z"
      />
      <g className="b" strokeWidth="0.6">
        {[
          [20, 32],
          [32, 36],
          [44, 31],
          [26, 46],
          [38, 50],
          [12, 50],
          [74, 28],
          [86, 30],
          [98, 27],
          [104, 42],
          [92, 46],
          [14, 64],
          [104, 60],
        ].map(([x, y]) => (
          <path key={`${x}${y}`} d={`M${x} ${y}l-3 8h1.6l3-8Z`} />
        ))}
      </g>
      <path className="b" d="M0 74H120V84H0Z" />
      <path className="p" d="M34 76H62M74 79H96" strokeWidth="1.2" />
      <path
        className="r"
        d="M44 52C44 38 54 32 62 32 70 32 80 38 80 52 77 49 74 49 71 52 68 49 65 49 62 52 59 49 56 49 53 52 50 49 47 49 44 52Z"
      />
      <path d="M53 52C54 42 58 35 62 32 66 35 70 42 71 52" strokeWidth="0.9" />
      <path d="M62 32V29M62 52V70C62 74 56 74 56 70" strokeWidth="2" />
    </>
  ),
  mercado: (
    <>
      <rect className="s" x="0" y="0" width="120" height="84" stroke="none" />
      <path d="M14 14V70M106 14V70" strokeWidth="2.2" />
      <path className="p" d="M6 8H114L110 22H10Z" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          className="r"
          d={`M${6 + i * 21.6} 8h10.8l-0.8 14h-10.8Z`}
          strokeWidth="1"
        />
      ))}
      <path className="y" d="M10 50H110V58H10Z" />
      <path d="M14 58V76M106 58V76M10 76H110" />
      <path d="M22 54H40M56 54H72M88 54H100" strokeWidth="0.8" />
      <path className="y" d="M18 50 20 40H50L52 50Z" />
      {[
        [26, 38],
        [33, 37],
        [40, 38],
        [47, 39],
        [29, 33],
        [37, 32],
        [44, 34],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} className="y" cx={x} cy={y} r="3.6" />
      ))}
      <path
        className="g"
        d="M58 50C56 40 62 34 68 38 70 32 78 32 80 38 86 36 90 42 86 50Z"
      />
      <path d="M66 46 70 40M76 47 78 40" strokeWidth="0.9" />
      <circle className="r" cx="96" cy="45" r="4.5" />
      <circle className="r" cx="104" cy="46" r="4" />
      <circle className="r" cx="100" cy="39" r="4" />
      <path className="y" d="M34 76C30 68 32 62 36 62H52C56 62 58 68 54 76Z" />
      <path d="M36 62C36 54 52 54 52 62M38 66H50M37 70H51" strokeWidth="0.9" />
    </>
  ),
  reloj: (
    <>
      <rect className="s" x="0" y="0" width="120" height="84" stroke="none" />
      <path className="p" d="M40 84V30H80V84Z" />
      <path className="r" d="M36 30 60 6 84 30Z" />
      <path d="M44 24 60 9 76 24" strokeWidth="0.9" />
      <path className="k" d="M54 30V22C54 18 66 18 66 22V30Z" />
      <path className="y" d="M57 30C57 25 63 25 63 30Z" />
      <circle className="y" cx="60" cy="50" r="15" />
      <circle className="p" cx="60" cy="50" r="11.5" />
      <g strokeWidth="1.1">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <path
              key={i}
              d={`M${(60 + 9 * Math.sin(a)).toFixed(1)} ${(50 - 9 * Math.cos(a)).toFixed(1)}L${(60 + 11.5 * Math.sin(a)).toFixed(1)} ${(50 - 11.5 * Math.cos(a)).toFixed(1)}`}
            />
          )
        })}
      </g>
      <path d="M60 50V42M60 50 55 53" strokeWidth="1.8" />
      <circle className="k" cx="60" cy="50" r="1.3" />
      <path className="b" d="M52 84V74C52 68 68 68 68 74V84Z" />
      <path
        d="M44 36H50M70 36H76M44 66H50M70 66H76M42 76H48M72 76H78"
        strokeWidth="0.8"
      />
      <path
        className="g"
        d="M0 76C12 72 26 72 40 76V84H0ZM80 76C94 72 108 72 120 76V84H80Z"
      />
    </>
  ),
  molino: (
    <>
      <rect className="s" x="0" y="0" width="120" height="84" stroke="none" />
      <path
        className="p"
        d="M88 20C84 20 83 15 87 14 88 9 95 9 96 13 101 12 103 18 99 20Z"
      />
      <path className="y" d="M0 66C26 54 58 52 120 62V84H0Z" />
      <path
        d="M8 76 22 72M34 79 50 75M70 80 90 76M98 74 112 72"
        strokeWidth="0.9"
      />
      <path className="p" d="M50 66 53 34H71L74 66Z" />
      <path className="b" d="M51 35C51 26 73 26 73 35Z" />
      <rect className="b" x="59" y="54" width="7" height="12" />
      <rect className="k" x="61" y="40" width="3.4" height="4.4" />
      <path d="M70 40 71.5 64M68 46 69 62" strokeWidth="0.8" />
      <g strokeWidth="1.2">
        <path className="p" d="M62 31 40 12 36 16 58 34Z" />
        <path className="p" d="M62 31 84 12 88 16 66 34Z" />
        <path className="p" d="M62 31 42 52 38 48 58 28Z" />
        <path className="p" d="M62 31 82 52 86 48 66 28Z" />
        <path
          d="M44 15.5 41 18.6M48 19 45 22M52 22.5 49 25.5M80 15.5 83 18.6M76 19 79 22M72 22.5 75 25.5M45 45 42 41.6M49 41 46 37.6M53 37 50 33.6M79 45 82 41.6M75 41 78 37.6M71 37 74 33.6"
          strokeWidth="0.9"
        />
      </g>
      <circle className="k" cx="62" cy="31" r="2" />
    </>
  ),
  libro: (
    <>
      <rect className="s" x="0" y="0" width="120" height="84" stroke="none" />
      <path className="y" d="M0 62H120V84H0Z" />
      <path d="M6 70 22 68M90 74 110 71" strokeWidth="0.9" />
      <path className="r" d="M14 62 18 26H102L106 62Z" />
      <path
        className="p"
        d="M60 60C50 56 32 56 18 59L21 28C34 25 50 26 60 31 70 26 86 25 99 28L102 59C88 56 70 56 60 60Z"
      />
      <path d="M60 31V60" />
      <path
        d="M26 34C34 32.5 44 33 54 36M26 40C34 38.5 44 39 54 42M25.5 46C34 44.5 44 45 54 48M25 52C33 50.5 44 51 54 54M66 36C76 33 86 32.5 94 34M66 42C76 39 86 38.5 94 40M66 48C76 45 86 44.5 94.5 46M66 54C76 51 86 50.5 95 52"
        strokeWidth="0.9"
      />
      <path className="r" d="M78 28V46L81 43 84 46V28Z" strokeWidth="1" />
      <path className="k" d="M104 52C104 48 114 48 114 52V58H104Z" />
      <path d="M109 49C110 40 114 34 118 30" strokeWidth="1.4" />
      <path
        className="p"
        d="M118 30C112 31 108 36 107 42 111 38 115 35 118 30Z"
        strokeWidth="1"
      />
    </>
  ),
  mar: (
    <>
      <rect className="s" x="0" y="0" width="120" height="84" stroke="none" />
      <circle className="y" cx="98" cy="17" r="8" />
      <path className="g" d="M0 46C10 40 22 40 30 44 40 38 50 40 56 46Z" />
      <path className="b" d="M0 46H120V84H0Z" />
      <path
        className="p"
        d="M0 56C6 52 12 52 18 56 24 52 30 52 36 56M60 62C66 58 72 58 78 62 84 58 90 58 96 62M14 72C20 68 26 68 32 72 38 68 44 68 50 72M78 76C84 72 90 72 96 76 102 72 108 72 114 76"
        strokeWidth="1.3"
      />
      <path d="M62 14V52" strokeWidth="1.6" />
      <path className="p" d="M63 16 84 48H63Z" />
      <path className="r" d="M63 30 74 30 79 38 63 38Z" strokeWidth="1" />
      <path className="p" d="M61 20 46 46H61Z" />
      <path className="y" d="M42 52H86L80 62H48Z" />
      <path d="M50 56H78" strokeWidth="0.9" />
      <path
        d="M24 18C27 15 30 15 32 18 34 15 37 15 40 18M36 28C38 26 40 26 41.5 28 43 26 45 26 47 28"
        strokeWidth="1.3"
      />
    </>
  ),
  iglesia: (
    <>
      <rect className="s" x="0" y="0" width="120" height="84" stroke="none" />
      <path className="y" d="M0 70H120V84H0Z" />
      <path className="p" d="M50 70V40H96V70Z" />
      <path className="r" d="M46 41 73 26 100 41Z" />
      <path className="p" d="M26 70V22H50V70Z" />
      <path className="r" d="M23 22 38 8 53 22Z" />
      <path d="M38 8V2M35.5 4H40.5" strokeWidth="1.4" />
      <path className="k" d="M33 38V30C33 26 43 26 43 30V38Z" />
      <path className="y" d="M35.5 38C35.5 32 40.5 32 40.5 38Z" />
      <circle className="y" cx="73" cy="49" r="4.5" />
      <path d="M73 44.5V53.5M68.5 49H77.5" strokeWidth="0.8" />
      <path className="b" d="M66 70V61C66 55 80 55 80 61V70Z" />
      <path d="M73 56V70" strokeWidth="0.9" />
      <path d="M46 26V66M48 30V60M93 44V66" strokeWidth="0.8" />
      <path
        className="g"
        d="M108 70C102 62 102 40 106 26 107 22 109 22 110 26 114 40 114 62 108 70Z"
      />
      <path d="M108 30V68" strokeWidth="0.8" />
      <path d="M8 76 22 74M84 78 100 76" strokeWidth="0.9" />
    </>
  ),
  coche: (
    <>
      <rect className="s" x="0" y="0" width="120" height="66" stroke="none" />
      <path
        className="g"
        d="M0 50C20 44 40 46 60 50 80 44 100 44 120 48V66H0Z"
      />
      <path className="y" d="M0 66H120V84H0Z" />
      <path d="M0 70H120" strokeWidth="1" />
      <path d="M4 58H16M2 62H12" strokeWidth="1.2" />
      <path
        className="k"
        d="M42 44V28C42 25 44 24 46 24H72C76 24 78 26 80 30L84 44Z"
      />
      <path
        className="s"
        d="M47 42V29H60V42ZM64 42V29H75C77 29 78 31 79 33L81 42Z"
      />
      <path
        className="r"
        d="M24 62V50C24 46 26 44 30 44H92C98 44 100 48 100 52V62Z"
      />
      <path d="M62 46V60M40 46V58" strokeWidth="0.9" />
      <path
        className="k"
        d="M20 62C20 54 40 54 40 62ZM78 62C78 54 98 54 98 62Z"
      />
      <circle className="k" cx="30" cy="64" r="8" />
      <circle className="k" cx="88" cy="64" r="8" />
      <circle className="p" cx="30" cy="64" r="3" />
      <circle className="p" cx="88" cy="64" r="3" />
      <circle className="y" cx="100" cy="50" r="3" />
      <path d="M104 48H112M104 52H114" strokeWidth="1" />
    </>
  ),
}

export function Vineta({
  pic,
  bare = false,
  className = '',
}: {
  pic: Pic
  bare?: boolean
  className?: string
}) {
  return (
    <svg
      className={`or-vig ${bare ? 'bare' : ''} ${className}`}
      viewBox="0 0 120 84"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="#221a12"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {PICS[pic]}
      </g>
    </svg>
  )
}
