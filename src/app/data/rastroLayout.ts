// How El Rastro's paintings fit together, shared by the page
// (games/rastroArt.tsx) and the prompts (data/rastro-prompts.ts): a
// background is asked for with the stall's table top level at this share
// of its height, with the seller standing behind it

export const TABLE_AT = 0.62

// Where the table top came out in each painted background, measured, since
// the paintings put it lower than asked
export const TABLE: Record<
  'street' | 'paco' | 'rosa' | 'julian' | 'pilar',
  number
> = {
  street: 0.66,
  paco: 0.675,
  rosa: 0.69,
  julian: 0.7,
  pilar: 0.71,
}

// The faces a seller's sheet holds, left to right, each painted as
// rastro/<seller>-<face>
export const FACES = ['wait', 'talk', 'good', 'cross'] as const
