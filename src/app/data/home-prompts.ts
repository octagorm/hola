import { SCENE } from '../lib/sky.ts'
import { POSTER, POSTER_REF } from './museo-prompts.ts'
import type { Period } from '../lib/sky.ts'

// The prompts for the painted scene at the top of the home page (sky.tsx),
// read only by scripts/pictures.mjs: La Mancha as a travel poster, the
// same landscape at dawn, by day, at dusk and at night, so that the page
// can crossfade between them by the player's clock. Day is painted first,
// and the other three take it as a second reference beside the poster's,
// to keep its landscape and only change its light. No sun or moon is
// painted, nor stars, clouds or birds: the page draws them over the sky,
// the moon in its real phase along the band SCENE.moon leaves open.

const pct = (n: number) => `${Math.round(n * 100)}%`

// The day painting, which the others follow
export const DAY_FULL = '.cache/pictures/home/day.png'

const LANDSCAPE = [
  'La Mancha in Spain, a wide view across the dry plain under a huge sky.',
  `A long low ridge rises from the middle of the plain to the right, its crest at about ${pct(SCENE.mills.ridge)} of the picture’s height from the top, and along it, between about ${pct(SCENE.mills.x0)} and ${pct(SCENE.mills.x1)} of the width, stand five white windmills with dark conical roofs and big lattice sails, spaced unevenly; their sails reach no higher than ${pct(SCENE.mills.top)} of the height.`,
  `Below the ridge a pale dusty road crosses the plain from left to right, and on it, between about ${pct(SCENE.riders.x0)} and ${pct(SCENE.riders.x1)} of the width and ${pct(SCENE.riders.y0)}–${pct(SCENE.riders.y1)} of the height, small in the landscape and riding towards the mills: Don Quijote, tall and thin in armour with a lance and a round shield, on Rocinante, a bony horse, and just behind him Sancho Panza, short and round in a broad hat, on his grey donkey.`,
  `At the far left, on the plain beside the road, a small whitewashed farmhouse with a tiled roof and one small window. The far horizon, with low gentle hills, lies at about ${pct(SCENE.horizon)} of the height left of the ridge. The ground in front is golden wheat stubble and ochre earth in broad flat bands, with a few dark green holm oaks.`,
  `The upper half of the picture is open sky in flat colour, plain and calm. Keep the sky completely empty from edge to edge, above all in the band from ${pct(SCENE.moon.y0)} to ${pct(SCENE.moon.y1)} of the height, and keep its top left quarter calm and plain, since lettering is laid over it later: no sun, no moon, no stars, no clouds, no birds and nothing else in the sky.`,
  'The picture will be cropped to a wide strip around its middle on wide screens, so keep the mills, the road and the riders in the middle band, with only sky above and plain ground below.',
].join(' ')

const LIGHT: Record<Period, string> = {
  day: 'Bright midday light. The sky a pale, light sea green fading to cream at the horizon, light enough for dark lettering to read over its upper left. The mills brilliant white, short shadows.',
  dawn: 'Early morning, just before sunrise, with the light coming low from the left: the upper sky a soft light grey-blue, fading to peach and pale gold at the horizon on the left, still light enough for dark lettering to read over its upper left. The mills and the riders lit pink and gold on their left sides, long cool blue shadows reaching to the right, the plain still half in shadow.',
  dusk: 'Dusk, just after sunset, with the last light coming low from the right: the upper sky a deep dusky violet-blue, dark enough for light lettering to read over its upper left, fading to rose and orange at the horizon on the right. The mills and the riders lit warm orange on their right sides, long violet shadows reaching to the left; a warm light in the farmhouse window.',
  night:
    'Night: the sky a deep slate blue, darkest at the top, dark enough for light lettering to read over its upper left. The plain and the ridge in deep blues and dark greens, the mills pale silvery grey-blue as if in moonlight, the riders dark silhouettes, one warm yellow light in the farmhouse window. Calm and quiet, not gloomy.',
}

// Holding the others to the day painting
const SAME =
  'The second reference image is this same picture by day: paint exactly the same landscape and composition, with the ridge, every windmill, the farmhouse, the oaks, the road and the two riders in the same places, at the same sizes and in the same poses, and the horizon at the same height, changing only the light, the colours and the shadows. The first reference image is for the poster’s style only.'

const RULES =
  'No lettering, words or numbers anywhere in the picture, no signature, no frame or border. An original picture, not a copy of any artist’s work. Landscape format, 3:2.'

export interface HomePrompt {
  shape: 'landscape'
  // Kept at the painting's own size: it is shown up to the width of a
  // wide screen, cropped to a strip
  size: string
  ref: string | Array<string>
  prompt: string
}

// Every picture by its name, for scripts/pictures.mjs
export const HOME_PICTURES: Record<string, HomePrompt> = Object.fromEntries(
  (['day', 'dawn', 'dusk', 'night'] as const).map((p) => [
    `home/${p}`,
    {
      shape: 'landscape',
      size: `${SCENE.width}x${SCENE.height}`,
      ref: p === 'day' ? POSTER_REF : [POSTER_REF, DAY_FULL],
      prompt: [
        LANDSCAPE,
        LIGHT[p],
        ...(p === 'day' ? [] : [SAME]),
        POSTER,
        RULES,
      ].join(' '),
    },
  ]),
)
