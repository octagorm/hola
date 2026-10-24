import { POSTER_REF } from './museo-prompts.ts'
import { FACES, TABLE_AT } from './rastroLayout.ts'

// The prompts for El Rastro's paintings (games/rastro.tsx), read only by
// scripts/pictures.mjs: a background for each stall and one for the
// street, a sheet of four busts for each seller, cut apart into the faces
// they make while haggling, and a cut-out of each thing for sale. All in
// the travel-poster style of every painting in Hola.

const STYLE =
  'A Spanish travel poster of the 1920s–30s, in the style of the reference image, for its style only and not its subject: a lithograph in a handful of flat colours with no outlines and no shading, large simple shapes, light shown only by flat bands of colour, a sophisticated muted palette (sea green, sand, terracotta, slate blue, cream), slight paper grain. Not photographic, not 3D, never glossy, no painterly brushwork.'
const NONE =
  'No lettering, signs, logos, price tags or text anywhere in the picture, no frame and no border.'
const CUT =
  'A cut-out for a game, on a fully transparent background: no ground, no floor, no table, no shadow, nothing behind it.'

const SELLERS = {
  paco: {
    who: 'Paco, an old bookseller of about seventy: a black beret, a short grey beard, a white shirt with rolled-up sleeves and a brown waistcoat; gruff but kind',
    stall:
      'shelves of old books with worn spines, rolled maps and a crate of vinyl records at the back, under a slate-blue and cream striped awning; the table cloth terracotta',
  },
  rosa: {
    who: 'Rosa, a lively woman of about forty with black hair in a bun, a red carnation in her hair and a fringed shawl over a dark dress; quick and cheerful',
    stall:
      'open Spanish fans pinned to a board, straw hats on hooks and a few little wooden music boxes on a shelf at the back, under a terracotta and cream striped awning; the table cloth slate blue',
  },
  julian: {
    who: 'Julián, an antique dealer of about sixty-five: white hair combed back, round spectacles, a burgundy bow tie and a grey waistcoat over a white shirt; courteous',
    stall:
      'old brass lamps with fringed shades, gilded mirrors and a small framed painting at the back, under an olive-green and cream striped awning; the table cloth ochre',
  },
  pilar: {
    who: 'Pilar, a woman of about seventy with a grey bob, a string of pearls, a red neckerchief and a blue cardigan; brisk and warm',
    stall:
      'wall clocks of many sizes and a shelf of old valve radios at the back, under an ochre and cream striped awning; the table cloth slate blue',
  },
} as const

const WARES: Record<string, string> = {
  libro:
    'an old hardback book with a worn red cloth cover, closed, standing a little open',
  mapa: 'an old folded map of Spain, half unfolded, its paper yellowed',
  disco: 'an old vinyl record half out of its plain paper sleeve',
  abanico: 'an open Spanish folding fan painted with red flowers',
  sombrero: 'a straw hat with a wide brim and a black band',
  caja: 'a small wooden music box with its lid open and a tiny dancer inside',
  lampara: 'an old brass table lamp with a fringed cream shade',
  espejo: 'a small oval mirror in a carved gilded frame, standing on its foot',
  reloj: 'an old brass alarm clock with two bells on top',
  radio: 'an old wooden valve radio of the 1950s with a round dial',
}

const stall = (what: string) =>
  `A stall at El Rastro, Madrid's Sunday flea market, early on a sunny morning, seen straight on from the cobbled street at the height of a person standing in front of it: ${what}, and behind the stall the tall old houses of a steep street with iron balconies and a strip of blue sky. Across the whole width of the lower part of the picture runs the stall's long wooden table with its cloth hanging to the ground; the table's top edge is one straight level line about ${Math.round(TABLE_AT * 100)} per cent of the way down the picture. Nobody in the picture: the stall waits for its seller, the space behind the middle of the table is empty, and the table top is bare. ${STYLE} ${NONE}`

export interface RastroPrompt {
  shape: 'landscape' | 'portrait' | 'square'
  size: string
  ref: string
  prompt: string
  // A cut-out on a transparent background, trimmed and fitted into size
  cutout?: boolean
  // Cut into these parts, left to right, each saved as <name>-<part>
  parts?: ReadonlyArray<string>
}

// Every picture by its name, for scripts/pictures.mjs
export const RASTRO_PICTURES: Record<string, RastroPrompt> = {
  'rastro/street': {
    shape: 'landscape',
    size: '1600x960',
    ref: POSTER_REF,
    prompt: stall(
      'an empty stall of bric-a-brac, old pots and jugs and a few picture frames at the back, under a terracotta and cream striped awning; the table cloth slate blue',
    ),
  },
  ...Object.fromEntries(
    Object.entries(SELLERS).flatMap(([id, s]) => [
      [
        `rastro/stall-${id}`,
        {
          shape: 'landscape',
          size: '1600x960',
          ref: POSTER_REF,
          prompt: stall(s.stall),
        },
      ],
      [
        `rastro/${id}`,
        {
          shape: 'landscape',
          size: '480x560',
          ref: POSTER_REF,
          cutout: true,
          parts: FACES,
          prompt: `A character sheet for a game: four pictures of the same person side by side in one row, evenly spaced with clear empty space between them, each the same size: ${s.who}. Each is a bust from the waist up, facing the viewer, cut off straight at the waist, hands out of sight, as a market seller seen across a table. From left to right: first neutral, waiting, a small polite look; second speaking, mouth open in the middle of a word; third pleased, a broad warm smile; fourth cross, frowning, lips pressed together. The same person, clothes, colours, size and pose in all four; only the face changes, with a slight tilt of the head. ${CUT} ${STYLE} ${NONE}`,
        },
      ],
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(WARES).map(([id, what]) => [
      `rastro/ware-${id}`,
      {
        shape: 'square',
        size: '480x480',
        ref: POSTER_REF,
        cutout: true,
        prompt: `A single thing for sale at a flea market, alone and whole in the middle of the picture, seen from the front and a little above: ${what}. ${CUT} ${STYLE} ${NONE}`,
      },
    ]),
  ),
}
