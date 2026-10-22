import { ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import type { ReactNode } from 'react'

// Accounts, through Convex (convex/): signed in with Google, the word bank
// is kept on the account too (lib/account.tsx). All of it stays off until
// the page is built with PUBLIC_CONVEX_URL, the address of production's
// Convex (.env.production), so the page works the same without it.

const ADDRESS: string | undefined = import.meta.env.PUBLIC_CONVEX_URL

export const CLOUD = !!ADDRESS

// One client for the page, made on first use
let client: ConvexReactClient | undefined
const convex = () => (client ??= new ConvexReactClient(ADDRESS ?? ''))

// With sign-in. Also finishes a Google sign-in when the page loads with
// ?code= (Google returns to the page given as redirectTo).
export function WithAccounts({ children }: { children: ReactNode }) {
  if (!CLOUD) return children
  return <ConvexAuthProvider client={convex()}>{children}</ConvexAuthProvider>
}
