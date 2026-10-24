// How El Rastro's paintings fit together, shared by the page
// (games/rastroArt.tsx) and the prompts (data/rastro-prompts.ts): a
// background is asked for with the stall's table top level at this share
// of its height, with the seller standing behind it

export const TABLE_AT = 0.62

// Where the table top came out in each background as the page shows it
// (cut to 5:3 from the middle of the painting), measured, since the
// paintings put it lower than asked
export const TABLE: Record<
  'street' | 'paco' | 'rosa' | 'julian' | 'pilar',
  number
> = {
  street: 0.678,
  paco: 0.694,
  rosa: 0.711,
  julian: 0.722,
  pilar: 0.733,
}

// The faces a seller's sheet holds, left to right, each painted as
// rastro/<seller>-<face>
export const FACES = ['wait', 'talk', 'good', 'cross'] as const
