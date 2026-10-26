import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

// What Hola keeps: for those who sign in, the accounts (Convex Auth's
// tables) and each one's word bank; and for anyone who turns it on, the
// daily reminder. Keep /personvern in step with this.

export default defineSchema({
  ...authTables,

  // The word bank, as the page's own JSON, so it follows the account from
  // device to device
  banks: defineTable({
    userId: v.id('users'),
    data: v.string(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // A daily reminder to do Dagens økt, pushed to one browser
  // (convex/reminders.ts), with or without an account: its push
  // subscription, the time of day and time zone it is for, and the last day
  // the chapter was finished there. Linked to the account of whoever was
  // signed in, so that a chapter finished on another device counts too.
  reminders: defineTable({
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    // 'HH:MM', on the clock of `zone` (IANA)
    time: v.string(),
    zone: v.string(),
    // When the next one is due
    next: v.number(),
    // The last day the chapter was finished, 'YYYY-MM-DD' in `zone`
    done: v.optional(v.string()),
    userId: v.optional(v.id('users')),
  })
    .index('by_endpoint', ['endpoint'])
    .index('by_next', ['next'])
    .index('by_user', ['userId']),
})
