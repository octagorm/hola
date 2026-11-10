import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { answered, emptyBank, merge, same, strangers, withStart } from './bank'
import { CLOUD } from './cloud'
import { aside, owner, setAside, setOwner, useStore } from './store'
import type { ReactNode } from 'react'
import type { Bank } from './bank'

// The account, for whoever signs in with Google (convex/): the word bank
// is kept on it too, and follows the player to every device signed in.
// The two copies are merged whenever the account's comes in, never one
// written over the other, and each change here is saved a moment later.
// Only when both hold answers and may be two people's (strangers in
// lib/bank.ts) is the player asked first: joined, or the browser's bank set
// aside until signing out and the account's used alone.

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
  // Waiting for an answer before the two banks are joined: the words
  // answered in this browser and on the account
  ask: { here: number; account: number } | null
  // The answer: join them, or keep the browser's apart
  decide: (join: boolean) => void
}

const OFF: Account = {
  on: false,
  loading: false,
  me: null,
  synced: false,
  ask: null,
  decide: () => {},
}

const Ctx = createContext<Account>(OFF)

export const useAccount = () => useContext(Ctx)

// Inside BankProvider and WithAccounts
export function AccountProvider({ children }: { children: ReactNode }) {
  return CLOUD ? <Synced>{children}</Synced> : children
}

function Synced({ children }: { children: ReactNode }) {
  const { bank, absorb, swapBank } = useStore()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const me = useQuery(api.access.me, isAuthenticated ? {} : 'skip')
  const member = isAuthenticated && !!me
  const remoteRaw = useQuery(api.bank.bank, member ? {} : 'skip')
  const save = useMutation(api.bank.save)
  const merged = useRef(false)
  const [ask, setAsk] = useState<Account['ask']>(null)

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
  const email = me?.email
  const join = useCallback(
    (theirs: Bank | null, mine: Bank) => {
      merged.current = true
      if (email) setOwner(email)
      const both = merge(mine, theirs ?? emptyBank())
      if (!same(both, mine)) absorb(both)
      if (!theirs || !same(both, theirs))
        void save({ data: JSON.stringify(both) }).catch(() => {})
    },
    [email, absorb, save],
  )

  useEffect(() => {
    if (!member || !email) {
      merged.current = false
      setAsk(null)
      return
    }
    if (remote === undefined) return
    const theirs = remote ?? emptyBank()
    if (!merged.current && strangers(latest.current, theirs, owner(), email)) {
      setAsk({ here: answered(latest.current), account: answered(theirs) })
      return
    }
    join(remote, latest.current)
  }, [member, email, remote, join])

  const decide = useCallback(
    (together: boolean) => {
      if (!email || remote === undefined) return
      setAsk(null)
      if (together) return join(remote, latest.current)
      // The browser's bank is kept until signing out, and the account's
      // takes its place
      setAside({ bank: latest.current, owner: owner() })
      const theirs = remote ?? withStart(emptyBank(), Date.now())
      latest.current = theirs
      swapBank(theirs)
      setOwner(email)
      merged.current = true
      if (!remote) void save({ data: JSON.stringify(theirs) }).catch(() => {})
    },
    [email, remote, join, swapBank, save],
  )

  // Signed out: a bank set aside comes back, and the account's leaves
  useEffect(() => {
    if (isLoading || isAuthenticated) return
    const kept = aside()
    if (!kept) return
    setAside(null)
    setOwner(kept.owner)
    swapBank(kept.bank)
  }, [isLoading, isAuthenticated, swapBank])

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
      synced: member && remote !== undefined && !ask,
      ask,
      decide,
    }),
    [isLoading, isAuthenticated, me, member, remote, ask, decide],
  )
  return <Ctx.Provider value={account}>{children}</Ctx.Provider>
}
