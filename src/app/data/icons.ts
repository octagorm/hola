// The small pictures of the home page (art.tsx): one for each story in
// the index, and one for each game's tile. Each is drawn in ink until its
// painting is made, a square poster stamp painted by scripts/pictures.mjs
// from data/icon-prompts.ts (which only the script reads) and listed in
// data/pictures.ts.

export const TOC_IDS = ['quijote', 'viaje', 'leyendas', 'caso'] as const

export type TocId = (typeof TOC_IDS)[number]

export const GAME_ICON_IDS = [
  'palabra',
  'palabras',
  'crucigrama',
  'rosco',
  'sopa',
  'reloj',
  'letras',
  'cadena',
  'tapas',
  'porpara',
  'tiempos',
  'elola',
  'orden',
  'rastro',
  'sonidos',
  'acento',
  'numeros',
  'taxi',
] as const

export type GameIconId = (typeof GAME_ICON_IDS)[number]

// Each painting's name, its path under public/ without .webp
export const tocPicture = (id: TocId) => `toc/${id}`
export const gameIconPicture = (id: GameIconId) => `games/${id}`
