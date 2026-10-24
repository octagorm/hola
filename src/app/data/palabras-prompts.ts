import { POSTER_REF } from './museo-prompts.ts'
import {
  FACES,
  FRAME,
  RELOJERO,
  SCENE_H,
  SCENE_W,
  TALLER,
} from './palabrasLayout.ts'

// The prompts for Palabras's paintings (games/palabras.tsx), read only by
// scripts/pictures.mjs: El relojero's workshop behind him, empty, and a
// sheet of four busts of him, cut apart into the faces he makes over the
// board. All in the travel-poster style of every painting in Hola. The
// board and the tiles stay as they are drawn, so that they can be read.

const STYLE =
  'A Spanish travel poster of the 1920s–30s, in the style of the reference image, for its style only and not its subject: a lithograph in a handful of flat colours with no outlines and no shading, large simple shapes, light shown only by flat bands of colour, a sophisticated muted palette (walnut brown, cream, brass, terracotta, slate blue), slight paper grain. Not photographic, not 3D, never glossy, no painterly brushwork.'
const NONE =
  'No lettering, signs, logos, numerals or text anywhere in the picture, no frame and no border.'
const CUT =
  'A cut-out for a game, on a fully transparent background: no ground, no floor, no table, no shadow, nothing behind it.'

// El relojero as the game draws him, the same in all four faces; he is
// not a real person
export const HIM =
  'El relojero, a kindly old Spanish watchmaker of about seventy-five with fair, rosy skin and a round nose: bald on top, with white tufts of hair over his ears and thick white eyebrows, a full white moustache, and a black watchmaker’s loupe screwed into his right eye (on the left as we look at him), that eye large behind its glass; a red bow tie, a white shirt and a brown waistcoat with a gold watch chain across it'

const sheet = `A character sheet for a game: four pictures of the same man side by side in one row, evenly spaced with clear empty space between them, each the same size: ${HIM}. Each is a bust from the middle of the chest up, facing the viewer, cut off straight across the chest, hands out of sight, as a man seen across a table of a board game. From left to right: first calm, a patient, friendly look with the mouth closed under the moustache; second speaking, the mouth open in the middle of a word under the moustache; third glad, a broad warm smile that lifts the moustache, the eyes crinkled; fourth thinking hard over his next move, the free eye turned up and aside, that eyebrow raised high, the lips pursed under the moustache. The same man, clothes, colours, size and pose in all four, the loupe always in the same eye; only the face changes, with a slight tilt of the head. ${CUT} ${STYLE} ${NONE}`

const taller = `Inside a small old watchmaker’s workshop in a Spanish town, on a quiet afternoon, seen straight on at the height of a man sitting at the table where he plays: the back wall, cream above and warm walnut wood panelling below, hung with ordinary wall clocks of many sizes and shapes, round ones, square wooden ones and a tall pendulum clock, all with plain dials and no numerals; along the back wall at about two thirds of the way down runs his long wooden workbench with a green-shaded lamp, small brass gears, a tray of tiny tools and an open pocket watch at the sides. High on the right one large round wall clock with a brass rim, its rim just slightly sagging at the bottom as if gone a little soft in the warmth, a gentle joke and not melting. At the left a small window with sunlight and a pot of red geraniums. Nobody in the picture: the middle third of the picture, from top to bottom, is plain wall and bare bench with nothing in front of it, where he will sit, and the clocks and things stand to the left and the right of it. ${STYLE} ${NONE}`

export interface PalabrasPrompt {
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
export const PALABRAS_PICTURES: Record<string, PalabrasPrompt> = {
  [TALLER]: {
    shape: 'landscape',
    size: `${SCENE_W * 4}x${SCENE_H * 4}`,
    ref: POSTER_REF,
    prompt: taller,
  },
  [RELOJERO]: {
    shape: 'landscape',
    size: `${FRAME.w}x${FRAME.h}`,
    ref: POSTER_REF,
    cutout: true,
    parts: FACES,
    prompt: sheet,
  },
}
