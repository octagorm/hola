import { ConvexError, v } from 'convex/values'
import { internalQuery, mutation, query } from './_generated/server'
import { requireUser } from './access'

// The word bank on the account, so it follows the player from device to
// device. The browser keeps its own copy and merges the two
// (src/app/lib/store.tsx). The bank is stored as the JSON the page keeps;
// the page owns its shape.

// Some hundreds of words and scores; far under Convex's limit per document
const MAX = 400_000

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
    if (row)
      await ctx.db.patch('banks', row._id, { data, updatedAt: Date.now() })
    else
      await ctx.db.insert('banks', {
        userId: user._id,
        data,
        updatedAt: Date.now(),
      })
  },
})
