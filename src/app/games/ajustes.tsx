import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Download, Share, Upload, Volume2 } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { dayKey, merge, startPreview } from '../lib/bank'
import { LEVELS } from '../data/start'
import { parts, subscribe, support, unsubscribe, zone } from '../lib/reminder'
import { SAMPLE } from '../data/voices'
import { say, useVoices } from '../lib/speech'
import { useStore } from '../lib/store'
import { useAccount } from '../lib/account'
import { AccountSettings } from '../account'
import { Page } from '../ui'
import type { ReactNode } from 'react'
import type { Bank } from '../lib/bank'
import type { StartLevel } from '../data/start'
import type { PageProps } from '../registry'

// Settings: the account, the daily reminder, the voice, how the practice
// goes, sound, and the backup that moves the progress from this browser to another. The
// browser's voices are offered only where there are no recordings.

export default function Ajustes({ arg }: PageProps) {
  const { settings, setSettings, bank, absorb, reset } = useStore()
  const account = useAccount()
  const kept = !!account.me
  const { voices, hear, recorded } = useVoices()
  const [sure, setSure] = useState(false)
  const [note, setNote] = useState('')
  const file = useRef<HTMLInputElement>(null)
  // #ajustes/partida, from the notice on the home page: straight to it
  useEffect(() => {
    if (arg) document.getElementById(arg)?.scrollIntoView({ block: 'start' })
  }, [arg])

  const download = () => {
    const data = JSON.stringify({ format: 'hola/1', bank }, null, 1)
    const url = URL.createObjectURL(
      new Blob([data], { type: 'application/json' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = `hola-${dayKey(Date.now())}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const readIn = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as {
        format?: string
        bank?: Partial<Bank>
      }
      if (data.format !== 'hola/1' || !data.bank) throw new Error('not ours')
      const before = Object.keys(bank.cards).length
      absorb(data.bank)
      const after = Object.keys(merge(bank, data.bank).cards).length
      setNote(
        `Lest inn. Ordbanken har nå ${after} ord møtt (${after - before} nye).`,
      )
    } catch {
      setNote('Det var ikke en sikkerhetskopi fra Hola.')
    }
  }

  return (
    <Page es="Ajustes" title="Innstillinger">
      <div className="q-settings">
        {account.on && (
          <Group es="Cuenta" no="Konto">
            <AccountSettings />
          </Group>
        )}

        {account.on && (
          <Group es="Recordatorio" no="Påminnelse">
            <Reminder />
          </Group>
        )}

        <Group es="Punto de partida" no="Startpunkt" id="partida">
          <StartPoint />
        </Group>

        <Group es="Voz" no="Stemme">
          {hear === false ? (
            <p className="q-muted">
              Denne nettleseren har ingen spansk stemme, så ordene leses ikke
              høyt. På Mac og iPhone finnes Mónica, og i Chrome Google español.
            </p>
          ) : (
            <>
              {!recorded && (
                <label className="q-field">
                  <span>Stemme</span>
                  <select
                    value={settings.voice}
                    onChange={(e) => setSettings({ voice: e.target.value })}
                  >
                    <option value="">Den beste som finnes</option>
                    {voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="q-field">
                <span>Fart: {Math.round(settings.rate * 100)} %</span>
                <input
                  type="range"
                  min="0.6"
                  max="1.3"
                  step="0.05"
                  value={settings.rate}
                  onChange={(e) =>
                    setSettings({ rate: Number(e.target.value) })
                  }
                />
              </label>
              <div>
                <button
                  type="button"
                  className="q-btn ghost small"
                  onClick={() => void say(SAMPLE)}
                >
                  <Volume2 /> Prøv stemmen
                </button>
              </div>
              <Toggle
                on={settings.autoplay}
                set={(autoplay) => setSettings({ autoplay })}
                label="Si ordene høyt når de dukker opp"
              />
            </>
          )}
        </Group>

        <Group es="Práctica" no="Øving">
          <div className="q-field">
            <span>Nye ord om dagen, når det er få ord å øve på</span>
            <div className="q-stepper">
              <button
                type="button"
                aria-label="Færre"
                disabled={settings.perDay <= 2}
                onClick={() => setSettings({ perDay: settings.perDay - 1 })}
              >
                −
              </button>
              <b>{settings.perDay}</b>
              <button
                type="button"
                aria-label="Flere"
                disabled={settings.perDay >= 8}
                onClick={() => setSettings({ perDay: settings.perDay + 1 })}
              >
                +
              </button>
            </div>
          </div>
          <Toggle
            on={settings.lenient}
            set={(lenient) => setSettings({ lenient })}
            label="Godta skrevne svar uten aksenter (ñ teller likevel)"
          />
        </Group>

        <Group es="Sonido" no="Lyd">
          <Toggle
            on={settings.effects}
            set={(effects) => setSettings({ effects })}
            label="Lyder når du svarer"
          />
        </Group>

        <Group es="Copia de seguridad" no="Sikkerhetskopi">
          <p className="q-muted">
            {kept
              ? 'Fremgangen ligger i denne nettleseren og på kontoen din. '
              : 'Fremgangen ligger bare i denne nettleseren. '}
            Last ned en sikkerhetskopi for å ta den med til en annen nettleser
            eller maskin, og les den inn der. Det som er lest inn, legges sammen
            med det som er her.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="q-btn small" onClick={download}>
              <Download /> Last ned
            </button>
            <button
              type="button"
              className="q-btn ghost small"
              onClick={() => file.current?.click()}
            >
              <Upload /> Les inn
            </button>
            <input
              ref={file}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void readIn(f)
                e.target.value = ''
              }}
            />
          </div>
          {note && <p className="q-note">{note}</p>}
        </Group>

        <Group es="Empezar de nuevo" no="Begynne på nytt">
          {sure ? (
            <div className="flex flex-wrap items-center gap-3">
              <span>
                Alt du har lært og alle stemplene slettes
                {kept ? ', også på kontoen' : ''}. Sikker?
              </span>
              <button
                type="button"
                className="q-btn small danger"
                onClick={() => {
                  reset()
                  setSure(false)
                  setNote('')
                }}
              >
                Slett alt
              </button>
              <button
                type="button"
                className="q-link"
                onClick={() => setSure(false)}
              >
                Avbryt
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="q-btn ghost small"
              onClick={() => setSure(true)}
            >
              Slett all fremgang
            </button>
          )}
        </Group>
      </div>
    </Page>
  )
}

// A notification each day at a time of the player's choosing, unless
// Dagens økt is finished (lib/reminder.ts, reminders.tsx). Only with Convex,
// which sends it. The permission is asked for from the tap that turns it
// on, as Safari wants.
function Reminder() {
  const { bank, settings, setSettings } = useStore()
  const key = useQuery(api.reminders.key)
  const set = useMutation(api.reminders.set)
  const remove = useMutation(api.reminders.remove)
  const [busy, setBusy] = useState(false)
  const [trouble, setTrouble] = useState<string | null>(null)
  const can = support()
  const blocked = can === 'yes' && Notification.permission === 'denied'

  const turn = async (on: boolean) => {
    setBusy(true)
    setTrouble(null)
    try {
      if (on) {
        if (!key) throw new Error('No key')
        const allowed = await Notification.requestPermission()
        if (allowed !== 'granted') {
          if (allowed === 'default')
            setTrouble('Da må du tillate varsler fra Hola.')
          return
        }
        const today = dayKey(Date.now())
        await set({
          ...parts(await subscribe(key)),
          time: settings.remindAt,
          zone: zone(),
          done: bank.daily[today] ? today : undefined,
        })
        setSettings({ remind: true })
      } else {
        setSettings({ remind: false })
        const endpoint = await unsubscribe()
        // If this fails, the push service will say the subscription is gone
        if (endpoint) await remove({ endpoint }).catch(() => {})
      }
    } catch {
      setTrouble(
        on
          ? 'Det gikk ikke å slå den på akkurat nå. Prøv igjen om litt.'
          : 'Det gikk ikke å slå den av akkurat nå. Prøv igjen om litt.',
      )
    } finally {
      setBusy(false)
    }
  }

  const text =
    can === 'home-screen' ? (
      <>
        På iPhone og iPad virker dette bare i Hola på Hjem-skjermen: trykk på
        Del <Share size={14} className="inline align-[-2px]" /> i Safari, så
        Legg til på Hjem-skjerm, og slå det på der.
      </>
    ) : can === 'old-ios' ? (
      'Varsler fra en app på Hjem-skjermen krever iOS 16.4 eller nyere.'
    ) : can === 'no' ? (
      'Denne nettleseren kan ikke vise varsler fra en nettside.'
    ) : blocked ? (
      'Varsler fra Hola er blokkert. Tillat dem i innstillingene til nettleseren eller telefonen, og slå det på her.'
    ) : key === null ? (
      'Påminnelser er ikke klare her ennå.'
    ) : (
      'Et varsel på dette klokkeslettet hver dag, om du ikke har gjort dagens økt allerede.'
    )

  return (
    <>
      <p className="q-muted">{trouble ?? text}</p>
      {can === 'yes' && (
        <>
          <label className="q-field">
            <span>Klokkeslett</span>
            <input
              type="time"
              value={settings.remindAt}
              onChange={(e) => {
                if (e.target.value)
                  setSettings({ remindAt: e.target.value.slice(0, 5) })
              }}
            />
          </label>
          <Toggle
            on={settings.remind}
            set={(on) => void turn(on)}
            label="Minn meg på dagens økt hver dag"
            disabled={busy || (!settings.remind && (!key || blocked))}
          />
        </>
      )}
    </>
  )
}

// How much Spanish the player knew before Hola. Another choice changes
// only the words never answered; what is learnt stays.
function StartPoint() {
  const { bank, chooseStart } = useStore()
  const [pick, setPick] = useState<StartLevel | null>(null)
  const [done, setDone] = useState(false)
  const preview = pick === null ? null : startPreview(bank, pick)
  const answered = startPreview(bank, bank.base.l).kept
  return (
    <>
      <p className="q-muted">
        Hvor mye spansk du kunne fra før. Du kan bytte når som helst: det endrer
        bare ordene du ikke har svart på ennå
        {answered ? `, og de ${answered} du har øvd på, blir som de er` : ''}.
      </p>
      <div className="q-starts" role="radiogroup" aria-label="Startpunkt">
        {LEVELS.map((x) => {
          const now = bank.base.l === x.level
          const on = (pick ?? bank.base.l) === x.level
          return (
            <button
              key={x.level}
              type="button"
              role="radio"
              aria-checked={on}
              className={on ? 'on' : ''}
              onClick={() => {
                setPick(now ? null : x.level)
                setDone(false)
              }}
            >
              <b>
                {x.name}
                {now && <small>Valgt nå</small>}
              </b>
              <span>{x.about}</span>
            </button>
          )
        })}
      </div>
      {preview && pick !== null && (
        <div className="flex flex-wrap items-center gap-3">
          <span>
            Da blir {preview.known} ord kjente og {preview.practised} ord å øve
            på
            {preview.kept ? `. De ${preview.kept} du har øvd på, beholdes` : ''}
            .
          </span>
          <button
            type="button"
            className="q-btn small"
            onClick={() => {
              chooseStart(pick)
              setPick(null)
              setDone(true)
            }}
          >
            Bruk dette
          </button>
          <button
            type="button"
            className="q-link"
            onClick={() => setPick(null)}
          >
            Avbryt
          </button>
        </div>
      )}
      {done && <p className="q-note">Startpunktet er endret.</p>}
    </>
  )
}

function Group({
  es,
  no,
  id,
  children,
}: {
  es: string
  no: string
  id?: string
  children: ReactNode
}) {
  return (
    <section className="q-frame q-card q-group" id={id}>
      <h2>
        {es}
        <span>{no}</span>
      </h2>
      {children}
    </section>
  )
}

function Toggle({
  on,
  set,
  label,
  disabled,
}: {
  on: boolean
  set: (on: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <label className="q-toggle">
      <input
        type="checkbox"
        checked={on}
        disabled={disabled}
        onChange={(e) => set(e.target.checked)}
      />
      <i aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
}
