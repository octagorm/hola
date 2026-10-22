import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { CLOUD, WithAccounts } from './lib/cloud'
import type { ReactNode } from 'react'
import './hola.css'

// /admin: everyone who has signed in (anyone may; see convex/access.ts),
// newest first, with when their word bank was last saved. Only for the
// admin.

export default function Admin() {
  if (!CLOUD)
    return (
      <Shell>
        <p className="q-muted">Kontoene er ikke satt opp ennå.</p>
      </Shell>
    )
  return (
    <WithAccounts>
      <AdminPage />
    </WithAccounts>
  )
}

const date = (ms: number) =>
  new Date(ms).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

function AdminPage() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { signIn, signOut } = useAuthActions()
  const me = useQuery(api.access.me, isAuthenticated ? {} : 'skip')

  if (isLoading || (isAuthenticated && me === undefined))
    return <Shell>…</Shell>
  if (!isAuthenticated || !me)
    return (
      <Shell>
        <p className="q-muted">Logg inn som administrator.</p>
        <button
          type="button"
          className="q-btn small"
          onClick={() => void signIn('google', { redirectTo: '/admin' })}
        >
          Logg inn med Google
        </button>
      </Shell>
    )
  if (!me.admin)
    return (
      <Shell>
        <p className="q-muted">Denne siden er bare for administratoren.</p>
        <button
          type="button"
          className="q-btn ghost small"
          onClick={() => void signOut()}
        >
          Logg ut
        </button>
      </Shell>
    )
  return (
    <Shell>
      <Users />
    </Shell>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="q-shell">
      <header className="q-top">
        <h1>
          Usuarios<small>Brukere</small>
        </h1>
      </header>
      <main className="q-main q-admin">{children}</main>
    </div>
  )
}

function Users() {
  const users = useQuery(api.access.users)
  if (users === undefined) return <p className="q-muted">…</p>
  return (
    <>
      <p className="q-muted">
        {users.length === 1
          ? 'Én har logget inn.'
          : `${users.length} har logget inn.`}{' '}
        Hver ny bruker varsles i innboksen på admin.ymse.land.
      </p>
      <table>
        <thead>
          <tr>
            <th>Navn</th>
            <th>E-post</th>
            <th>Kom</th>
            <th>Sist lagret</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name ?? '–'}</td>
              <td>{u.email}</td>
              <td>{date(u.createdAt)}</td>
              <td>{u.savedAt ? date(u.savedAt) : '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
