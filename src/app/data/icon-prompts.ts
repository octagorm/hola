import { GAME_ICON_IDS, TOC_IDS, gameIconPicture, tocPicture } from './icons.ts'
import { POSTER, POSTER_REF } from './museo-prompts.ts'
import type { GameIconId, TocId } from './icons.ts'

// The prompts for the home page's small pictures (art.tsx, data/icons.ts),
// read only by scripts/pictures.mjs: a square for each story in the index
// (toc/<id>) and for each game's tile (games/<id>). They are shown small,
// a story's at about 72–100 CSS pixels and a game's at 44 (96 on the card
// of today's chapter), so each is one bold subject filling the square, and
// the set is painted alike, as a sheet of matching poster stamps, each on
// a flat ground of its own colour.

// What every one of them is
const STAMP =
  'A small square picture, one of a matching set of poster stamps: a single bold, simple subject, centred and filling most of the square, made of a few large flat shapes with a strong, clear silhouette against a plain flat ground of one colour, with at most one simple band of a second colour behind it. Four or five flat colours in all, from the set’s palette: sea green, sand, terracotta, slate blue, cream and mustard, with a deep ink blue for the darkest parts. Seen from the front or the side, flat, never in perspective from above unless said.'

// What a story's picture is shown at, and a game's
const SMALL =
  'It will be shown small, about 80 pixels across, so keep it simple: no fine detail, no thin lines and no small objects.'
const TINY =
  'It will be shown tiny, about 40 pixels across, like an app icon, so keep it very simple: two or three big shapes, no fine detail, no thin lines, no small objects, and nothing that needs to be read up close.'

// What every prompt ends with
const RULES =
  'No lettering of any kind: no letters, words, numbers or numerals anywhere, not even on tiles, cards, signs, clock faces or paper, which stay plain. No people, no faces, no signature, no frame or border. An original picture, not a copy of any artist’s work. Square format.'

// What each story's picture shows (data/stories.ts)
export const TOC_SUBJECTS: Record<TocId, string> = {
  quijote:
    'Don Quijote: one big white windmill of La Mancha with a dark conical roof and four great lattice sails in an X, standing on a low ochre ridge, and the long thin lance of a knight coming in from the lower left corner, pointing up at it. Ground: a pale sea-green sky.',
  viaje:
    'A journey by train across Spain: a short red-and-cream passenger train of a locomotive and one carriage, seen from the side and filling the width, running along a low embankment beside a deep blue sea, with a big round pale-gold sun above. Ground: a sand-coloured sky.',
  leyendas:
    'Romantic, eerie legends of old Castile: a lone ruined Romanesque stone arch on a bare hill at night, a big pale full moon behind it, and a long blue silk ribbon caught on the arch, streaming in the wind. Ground: a deep slate-blue night sky. Calm and mysterious, not frightening.',
  caso: 'A mystery about a lost gold watch: a gold pocket watch with its lid open, its face plain cream with only two hands and no numerals, hanging on a curling gold chain, and the round lens of a magnifying glass with a dark handle overlapping its lower right edge. Ground: the deep blue of the Mediterranean.',
}

// What each game's picture shows (AGENTS.md's table of the games, and
// each game's own look)
export const GAME_SUBJECTS: Record<GameIconId, string> = {
  palabra:
    'A word guessed in six tries: two rows of five rounded square tiles, plain and blank, some sea green, some mustard and some cream, like the coloured answers of a word puzzle, with three tiny pearl-white dots above like stars. Ground: a deep night blue.',
  palabras:
    'A game of word tiles: a wooden tile rack seen from the front, holding four blank cream tiles with rounded corners and no letters. Ground: sea green.',
  crucigrama:
    'A little crossword: a square grid of five by five cream squares with four solid ink-blue squares placed in a pattern, the grid slightly tilted. Ground: a dusky violet-rose evening colour.',
  rosco:
    'A ring of letters as a game: twelve round blank discs set evenly in a big circle, most of them cream, one terracotta and one sea green, the middle of the ring empty. Ground: mustard.',
  cadaver:
    'An exquisite corpse, the folding-paper game: a playful figure in three stacked bands of paper that do not quite line up, a plain round head with no face under a little hat at the top, a striped body in the middle and two legs in boots at the bottom, each band in a different colour, in a cheerful late-1960s pop spirit. Ground: cream.',
  sopa: 'A word search on tiles: a square of four by four blue-and-white azulejo tiles, plain blue patterns and no letters, with one bright mustard band running diagonally across them, and one lemon with a green leaf on a corner. Ground: terracotta.',
  reloj:
    'A soft watch: one round cream pocket watch, its face plain with only two hands and no numerals, drooping soft and melting over the edge of a plain sand-coloured block in an empty desert, a long shadow beside it. Ground: a pale sea-green sky over flat sand. Drawn anew, not after any painting.',
  letras:
    'A letterpress print shop: three chunky wooden printing blocks standing in a row, their raised faces plain and inked, cream, terracotta and cream, and a printer’s ink roller with a wooden handle lying in front. Ground: slate blue.',
  cadena:
    'A chain of words as a string of paper flags: one string hanging in a deep curve across the square, with five triangular paper bunting flags on it, in terracotta, mustard, sea green, slate blue and cream, as at a summer verbena. Ground: a warm evening sand colour.',
  tapas:
    'A tapas bar: a small round earthenware cazuela with a few olives and a slice of potato tortilla on a little plate, a toothpick in one, on a bar counter. Ground: sea green.',
  porpara:
    'Two doors to choose between: two Moorish horseshoe arches side by side in a cream wall, the left doorway terracotta, the right slate blue, as in the Alhambra. Ground: sand.',
  tiempos:
    'Yesterday, today and tomorrow: three tall narrow panels side by side like a triptych, the left with a low setting half sun in mustard, the middle with a round terracotta sun high in the sky, the right with a cream crescent moon on slate blue. Ground: cream.',
  elola:
    'Masculine or feminine, with the Spanish deck: two playing cards of the Spanish deck fanned side by side, plain with no numbers or corner marks, the left showing one big wooden club (basto) in slate blue, the right one big goblet (copa) in terracotta. Ground: mustard.',
  orden:
    'Putting things in order: three framed picture cards in a row, slightly overlapping, each with one simple flat picture (a sun, a house, a tree), the middle one lifted a little above the others as if being moved into its place. Ground: sea green.',
  rastro:
    'Madrid’s flea market: a scalloped red-and-cream striped awning over a small stall, and on its table one brass oil lamp and an old round birdcage. Ground: a pale sky blue.',
  sonidos:
    'Listening to Spain’s sounds: a 1950s tabletop radio with a rounded top, in cream and terracotta, a big speaker grille of plain bands and a dial window with no numbers. Ground: sea green.',
  acento:
    'Where the stress falls: three round paper feria lanterns hanging from one string, the middle one larger and terracotta, the two others cream, and above the big one a single short bold slanting stroke, the only mark. Ground: slate blue.',
  numeros:
    'Numbers and the Christmas lottery: a pale engraved paper ticket like an old banknote, with a wavy patterned border and an empty oval medallion, no numbers on it, and in front of it one big shiny golden lottery ball, plain. Ground: terracotta.',
  taxi: 'A taxi of Madrid: a white taxi with a diagonal red stripe on its door and a small green light on its roof, seen from the side and filling the width, on a plain road. Ground: mustard.',
}

export interface IconPrompt {
  shape: 'square'
  // Twice the largest it is shown, or a little more
  size: string
  ref: string
  prompt: string
}

// Every picture by its name, for scripts/pictures.mjs
export const ICON_PICTURES: Record<string, IconPrompt> = Object.fromEntries([
  ...TOC_IDS.map((id) => [
    tocPicture(id),
    {
      shape: 'square',
      size: '256x256',
      ref: POSTER_REF,
      prompt: [TOC_SUBJECTS[id], STAMP, SMALL, POSTER, RULES].join(' '),
    },
  ]),
  ...GAME_ICON_IDS.map((id) => [
    gameIconPicture(id),
    {
      shape: 'square',
      size: '192x192',
      ref: POSTER_REF,
      prompt: [GAME_SUBJECTS[id], STAMP, TINY, POSTER, RULES].join(' '),
    },
  ]),
])
