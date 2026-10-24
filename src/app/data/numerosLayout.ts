import { LOTTERY_VOICE, NUMBER_VOICES } from './voices.ts'

// How Números's paintings fit together, shared by the page
// (games/numeros.tsx) and the prompts (data/numeros-prompts.ts). Whoever
// says the number is shown as the portrait on a banknote: their bust in an
// oval vignette, with a painted place behind it, a Madrid street for Lola
// and Andrés and the lottery's hall for Ildefonso. The bust stands on the
// vignette's lower edge and fills it but for a band of the place above
// and beside the head.

// Who speaks, each with a sheet of four busts
export const SPEAKERS = [...NUMBER_VOICES, LOTTERY_VOICE]

// The faces a sheet holds, left to right: waiting, speaking (for
// Ildefonso, singing), glad when the number is right, and a kind «not
// quite» when it is not; each painted as numeros/<who>-<face>
export const FACES = ['wait', 'talk', 'glad', 'kind'] as const
export type Face = (typeof FACES)[number]

// The size a face is cut to, and a place behind: the vignette's shape,
// twice its largest size on the page
export const BUST = { w: 360, h: 420 } as const
export const PLACE = { w: 360, h: 420 } as const

// How much of the vignette the bust leaves free at the top, as a share of
// its height: the place shows there and beside the head
export const BUST_TOP = 0.16

// The pictures' names: the places, and a speaker's sheet, cut into one
// picture for each face (Andrés is andres)
export const MADRID = 'numeros/madrid'
export const SORTEO = 'numeros/sorteo'
export const placeOf = (who: string) =>
  who === LOTTERY_VOICE ? SORTEO : MADRID
export const speakerSheet = (who: string) =>
  `numeros/${who.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()}`
export const speakerFace = (who: string, face: Face) =>
  `${speakerSheet(who)}-${face}`
