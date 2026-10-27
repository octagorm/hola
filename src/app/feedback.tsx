import { useEffect, useRef, useState } from 'react'
import { useAction } from 'convex/react'
import { ConvexError } from 'convex/values'
import { Check, ImagePlus, Send, X } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { useAccount } from './lib/account'
import { pictureIn, shrink } from './lib/screenshot'
import type { Shot } from './lib/screenshot'

// At the foot of the home page: a few words to Gorm's inbox
// (convex/feedback.ts), with a screenshot pasted, dropped or chosen, and a
// name or address if the sender wants an answer. Signed in, the account's
// name and address are filled in, to be changed or cleared. Shown only
// with Convex (lib/cloud.tsx).
const MAX_TEXT = 1800
const MAX_FROM = 100

const WHY: Record<string, string> = {
  'Too many': 'Mange meldinger har kommet akkurat nå. Prøv igjen om litt.',
  'Not a picture': 'Det bildet kunne ikke sendes. Prøv et annet.',
}

export function Feedback() {
  const account = useAccount()
  const send = useAction(api.feedback.send)
  const [text, setText] = useState('')
  const [from, setFrom] = useState('')
  const [touched, setTouched] = useState(false)
  const [shot, setShot] = useState<Shot | null>(null)
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const [over, setOver] = useState(false)
  const pick = useRef<HTMLInputElement>(null)
  const me = account.me
  useEffect(() => {
    if (me && !touched) setFrom(me.name ? `${me.name} (${me.email})` : me.email)
  }, [me, touched])
  // The preview's address is let go when it is replaced or the form goes
  useEffect(
    () => () => {
      if (shot) URL.revokeObjectURL(shot.url)
    },
    [shot],
  )

  const attach = async (file: File | null) => {
    if (!file) return
    try {
      setShot(await shrink(file))
      if (state === 'error') setState('idle')
    } catch {
      setError('Det bildet kunne ikke leses. Prøv et annet.')
      setState('error')
    }
  }

  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!text.trim() || state === 'busy') return
    setState('busy')
    try {
      await send({
        text,
        from: from.trim() || undefined,
        image: shot ? { type: shot.type, bytes: shot.bytes } : undefined,
      })
      setText('')
      setShot(null)
      setState('sent')
    } catch (err) {
      setError(
        (err instanceof ConvexError && WHY[String(err.data)]) ||
          'Det gikk ikke gjennom. Prøv igjen.',
      )
      setState('error')
    }
  }

  return (
    <section
      className="q-frame q-card q-group q-feedback"
      aria-labelledby="q-feedback"
    >
      <h2 id="q-feedback">
        Buzón<span>Tilbakemelding</span>
      </h2>
      <p className="q-muted">
        Er noe feil, mangler noe, eller er det noe du liker? Det går rett til
        Gorm, som lager Hola. Et skjermbilde hjelper med å vise et problem.
      </p>
      {state === 'sent' ? (
        <div className="q-feedback-row">
          <p className="q-feedback-sent">
            <Check /> Takk, den er sendt.
          </p>
          <button
            type="button"
            className="q-btn ghost small"
            onClick={() => setState('idle')}
          >
            Skriv en til
          </button>
        </div>
      ) : (
        <form
          className={`q-feedback-form${over ? ' over' : ''}`}
          onSubmit={(e) => void submit(e)}
          onPaste={(e) => {
            const file = pictureIn(e.clipboardData)
            if (file) {
              e.preventDefault()
              void attach(file)
            }
          }}
          onDragOver={(e) => {
            if (!e.dataTransfer.types.includes('Files')) return
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            const file = pictureIn(e.dataTransfer)
            setOver(false)
            if (file) {
              e.preventDefault()
              void attach(file)
            }
          }}
        >
          <label className="q-field">
            <span>Meldingen din</span>
            <textarea
              required
              rows={4}
              maxLength={MAX_TEXT}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <div className="q-feedback-row start">
            {shot ? (
              <span className="q-feedback-shot">
                <img src={shot.url} alt="Skjermbildet som sendes med" />
                <button
                  type="button"
                  onClick={() => setShot(null)}
                  aria-label="Ta bort bildet"
                  title="Ta bort bildet"
                >
                  <X />
                </button>
              </span>
            ) : (
              <>
                <button
                  type="button"
                  className="q-btn ghost small"
                  onClick={() => pick.current?.click()}
                >
                  <ImagePlus /> Legg ved bilde
                </button>
                <span className="q-muted q-feedback-paste">
                  eller lim det inn her
                </span>
              </>
            )}
            <input
              ref={pick}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                void attach(e.target.files?.[0] ?? null)
                e.target.value = ''
              }}
            />
          </div>
          <label className="q-field">
            <span>Navn eller e-post (valgfritt, om du vil ha svar)</span>
            <input
              type="text"
              autoComplete="email"
              maxLength={MAX_FROM}
              value={from}
              onChange={(e) => {
                setTouched(true)
                setFrom(e.target.value)
              }}
            />
          </label>
          <div className="q-feedback-row">
            {state === 'error' && (
              <p role="alert" className="q-feedback-error">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="q-btn"
              disabled={!text.trim() || state === 'busy'}
            >
              <Send /> {state === 'busy' ? 'Sender …' : 'Send'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
