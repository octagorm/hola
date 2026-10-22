import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

// What Hola keeps for those who sign in: the accounts (Convex Auth's
// tables) and each one's word bank. Keep /personvern in step with this.

export default defineSchema({
  ...authTables,

  // The word bank, as the page's own JSON, so it follows the account from
  // device to device
  banks: defineTable({
    userId: v.id('users'),
    data: v.string(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),
})
