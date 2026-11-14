import { ConvexError, v } from 'convex/values'
import { internalQuery, mutation, query } from './_generated/server'
import { requireUser } from './access'

// The word bank on the account, so it follows the player from device to
// device. The browser keeps its own copy and merges the two
// (src/app/lib/store.tsx). The bank is stored as the JSON the page keeps;
// the page owns its shape.

// Every word with its last answers logged comes to well under this;
// under Convex's limit of 1 MiB per document
const MAX = 900_000

// Saves an account may make in a minute. The page saves two seconds after
// a change, so a player hard at it makes some twenty; a page that answers
// each copy from the account with a save of its own (two devices that
// never agree, lib/account.tsx) makes several a second, each one waking the
// other. A save over the cap is not written, so nothing comes back to
// answer, and such a loop stops. The browser keeps everything, and its
// next save carries it all.
export const SAVES = 30
const MINUTE = 60_000

export const bank = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx)
    const row = await ctx.db
      .query('banks')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first()
    return row ? row.data : null
  },
})

// One account's word bank, by its address, for writing an audiobook from
// its words (scripts/lydbok-ord.ts); internal, so only run from the
// deployment's own tools:
//   npx convex run --prod bank:forEmail '{"email": "…"}'
export const forEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const want = email.trim().toLowerCase()
    const users = await ctx.db.query('users').collect()
    const user = users.find((u) => u.email?.toLowerCase() === want)
    if (!user) return null
    const row = await ctx.db
      .query('banks')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first()
    return row ? row.data : null
  },
})

export const save = mutation({
  args: { data: v.string() },
  handler: async (ctx, { data }) => {
    const user = await requireUser(ctx)
    if (data.length > MAX) throw new ConvexError('Word bank too large')
    try {
      const parsed: unknown = JSON.parse(data)
      if (typeof parsed !== 'object' || parsed === null || !('cards' in parsed))
        throw new Error()
    } catch {
      throw new ConvexError('Not a word bank')
    }
    const row = await ctx.db
      .query('banks')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first()
    const now = Date.now()
    if (!row) {
      await ctx.db.insert('banks', {
        userId: user._id,
        data,
        updatedAt: now,
        since: now,
        saves: 1,
      })
      return
    }
    // (nothing new is not written either: a write wakes every device)
    if (row.data === data) return
    const within = now - (row.since ?? 0) < MINUTE
    const saves = within ? (row.saves ?? 0) : 0
    if (saves >= SAVES) return
    await ctx.db.patch('banks', row._id, {
      data,
      updatedAt: now,
      since: within ? row.since : now,
      saves: saves + 1,
    })
  },
})
