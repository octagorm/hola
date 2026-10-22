import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { emptyBank, merge } from './bank'
import { CLOUD } from './cloud'
import { useStore } from './store'
import type { ReactNode } from 'react'
import type { Bank } from './bank'

// The account, for whoever signs in with Google (convex/): the word bank
// is kept on it too, and follows the player to every device signed in.
// The two copies are merged whenever the account's comes in, never one
// written over the other, and each change here is saved a moment later.

export interface Me {
  name: string | null
  email: string
  admin: boolean
}

export interface Account {
  // Whether there are accounts at all (lib/cloud.tsx)
  on: boolean
  loading: boolean
  me: Me | null
  // The account's copy has come in and been merged with this one
  synced: boolean
}

const OFF: Account = { on: false, loading: false, me: null, synced: false }

const Ctx = createContext<Account>(OFF)

export const useAccount = () => useContext(Ctx)

// Inside BankProvider and WithAccounts
export function AccountProvider({ children }: { children: ReactNode }) {
  return CLOUD ? <Synced>{children}</Synced> : children
}

const same = (a: Bank, b: Bank) =>
  JSON.stringify(merge(a, emptyBank())) ===
  JSON.stringify(merge(b, emptyBank()))

function Synced({ children }: { children: ReactNode }) {
  const { bank, absorb } = useStore()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const me = useQuery(api.access.me, isAuthenticated ? {} : 'skip')
  const member = isAuthenticated && !!me
  const remoteRaw = useQuery(api.bank.bank, member ? {} : 'skip')
  const save = useMutation(api.bank.save)
  const merged = useRef(false)

  const remote = useMemo(() => {
    if (remoteRaw === undefined) return undefined
    if (remoteRaw === null) return null
    try {
      return merge(JSON.parse(remoteRaw) as Partial<Bank>, emptyBank())
    } catch {
      return null
    }
  }, [remoteRaw])

  // The bank as it is now, for merging in the account's copy without
  // merging again on every change here
  const latest = useRef(bank)
  useEffect(() => {
    latest.current = bank
  }, [bank])

  // Each copy that comes from the account, on sign-in and whenever another
  // device saves, is merged in: saving this device's bank over it would
  // lose what the other one learnt
  useEffect(() => {
    if (!member) {
      merged.current = false
      return
    }
    if (remote === undefined) return
    merged.current = true
    const both = merge(latest.current, remote ?? emptyBank())
    if (!same(both, latest.current)) absorb(both)
    if (!remote || !same(both, remote))
      void save({ data: JSON.stringify(both) }).catch(() => {})
  }, [member, remote, absorb, save])

  useEffect(() => {
    if (!member || !merged.current || !remote || same(bank, remote)) return
    const timer = setTimeout(() => {
      void save({ data: JSON.stringify(bank) }).catch(() => {})
    }, 2000)
    return () => clearTimeout(timer)
  }, [member, bank, remote, save])

  const account = useMemo(
    () => ({
      on: true,
      loading: isLoading || (isAuthenticated && me === undefined),
      me: me ?? null,
      synced: member && remote !== undefined,
    }),
    [isLoading, isAuthenticated, me, member, remote],
  )
  return <Ctx.Provider value={account}>{children}</Ctx.Provider>
}
