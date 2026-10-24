// How Palabras's paintings fit together, shared by the page
// (games/palabras.tsx) and the prompts (data/palabras-prompts.ts): El
// relojero's workshop behind him, cut to the widest box he is shown in
// (his column on a wide screen, about 336 by 210), and his bust standing
// on its bottom edge in the middle. The square on the start page and the
// round portrait on a phone show the middle of it.

export const SCENE_W = 320
export const SCENE_H = 200

// The size each face is cut to, w by h
export const FRAME = { w: 480, h: 520 } as const

// The faces his sheet holds, left to right: calm while he waits, speaking
// (shown over the calm one every other moment while he speaks), glad, and
// thinking while it is his turn, each painted as palabras/relojero-<face>
export const FACES = ['calm', 'talk', 'glad', 'think'] as const
export type Face = (typeof FACES)[number]
export type Mood = Exclude<Face, 'talk'>

// The pictures' names: the workshop, and his sheet, cut into a picture
// for each face
export const TALLER = 'palabras/taller'
export const RELOJERO = 'palabras/relojero'
export const relojeroFace = (f: Face) => `${RELOJERO}-${f}`
