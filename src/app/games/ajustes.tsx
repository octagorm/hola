import { useRef, useState } from 'react'
import { Download, Upload, Volume2 } from 'lucide-react'
import { dayKey, merge } from '../lib/bank'
import { SAMPLE } from '../data/voices'
import { say, useVoices } from '../lib/speech'
import { startMusic, stopMusic } from '../lib/music'
import { useStore } from '../lib/store'
import { useAccount } from '../lib/account'
import { AccountSettings } from '../account'
import { Page } from '../ui'
import type { ReactNode } from 'react'
import type { Bank } from '../lib/bank'

// Settings: the account, the voice, how the practice goes, sound, and the
// backup that moves the progress from this browser to another. The
// browser's voices are offered only where there are no recordings.

export default function Ajustes() {
  const { settings, setSettings, bank, absorb, reset } = useStore()
  const account = useAccount()
  const kept = !!account.me
  const { voices, hear, recorded } = useVoices()
  const [sure, setSure] = useState(false)
  const [note, setNote] = useState('')
  const file = useRef<HTMLInputElement>(null)

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
            <span>Nye ord om dagen, når få ord skal repeteres</span>
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
          <Toggle
            on={settings.music}
            set={(music) => {
              setSettings({ music })
              if (music) startMusic()
              else stopMusic()
            }}
            label="Gitar i bakgrunnen"
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

function Group({
  es,
  no,
  children,
}: {
  es: string
  no: string
  children: ReactNode
}) {
  return (
    <section className="q-frame q-card q-group">
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
}: {
  on: boolean
  set: (on: boolean) => void
  label: string
}) {
  return (
    <label className="q-toggle">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => set(e.target.checked)}
      />
      <i aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
}
