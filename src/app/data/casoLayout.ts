// How El caso del reloj perdido's cast is painted, shared by the page
// (games/caso.tsx) and the prompts (data/caso-prompts.ts): each who says
// a line (data/caso.ts) has a sheet of four busts, cut apart into the faces
// they make while questioned, each painted as caso/<id>-<face>

// The faces a sheet holds, left to right: waiting, speaking, glad and
// worried (for some an astonished, indignant or embarrassed look)
export const FACES = ['wait', 'talk', 'glad', 'worried'] as const
export type Face = (typeof FACES)[number]

// A bust's size, as each face is cut to
export const BUST = { w: 360, h: 420 } as const

// A speaker's picture: caso/narcis for Narcís
export const castPicture = (who: string) =>
  `caso/${who.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()}`
