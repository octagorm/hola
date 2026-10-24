// How Tapas's paintings fit together, shared by the page
// (games/tapasArt.tsx) and the prompts (data/tapas-prompts.ts). The scene
// is 400 by 250, seen from behind the counter: the counter's far edge lies
// level at this share of its height, with the bare counter top below it
// and the guest standing beyond it in the middle

export const SCENE_W = 400
export const SCENE_H = 250
export const COUNTER_AT = 196 / SCENE_H

// The size a guest's face is cut to, w by h, and how wide it is shown in
// the scene, its foot just under the counter's edge
export const FRAME = { w: 480, h: 520 } as const
export const GUEST_W = 140

// The faces a guest's sheet holds, left to right, one for each of the
// game's moods, each painted as tapas/<guest>-<face>
export const FACES = ['wait', 'talk', 'happy', 'hmm'] as const

// A guest or a drink or dish as a picture names it, without its article
// or accents: Lucía is lucia, los pimientos de Padrón pimientos-de-padron
export const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/^(el|la|los|las) /, '')
    .replace(/ /g, '-')

// The pictures' names: the bar, empty; a guest's sheet, cut into one
// picture for each face; and each drink and dish
export const BAR = 'tapas/bar'
export const guestSheet = (who: string) => `tapas/${slug(who)}`
export const guestFace = (who: string, face: (typeof FACES)[number]) =>
  `${guestSheet(who)}-${face}`
export const itemPicture = (id: string) => `tapas/item-${slug(id)}`
