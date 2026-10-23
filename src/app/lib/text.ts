import { WORD, gloss } from '../data/words.ts'

// A line of mixed text as written in the data (data/quijote.ts has the
// markup), made into tokens: each word with its id in the bank and the
// Norwegian that stands in for it, names as they are, punctuation apart.

export interface Token {
  // As the Spanish has it here: 'molinos', 'el campo', 'Don Quijote'
  es: string
  // The word in the bank; none for a name or punctuation
  id?: string
  // The Norwegian for it here
  no: string
  name?: boolean
  punct?: boolean
}

// Punctuation that sits against the word before it, and the word after
const BEFORE = new Set([',', '.', ';', ':', '!', '?', '»', '…', '~'])
const AFTER = new Set(['¡', '¿', '«', '—'])
export const PUNCT = new Set([...BEFORE, ...AFTER])

const spaced = (s: string) => s.replaceAll('_', ' ')

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const isCapital = (s: string) =>
  s.charAt(0) !== s.charAt(0).toLowerCase() &&
  s.charAt(0) === s.charAt(0).toUpperCase()

export function tokens(line: string): Array<Token> {
  const toks = line
    .split(' ')
    .filter(Boolean)
    .map((raw): Token => {
      if (PUNCT.has(raw))
        return { es: raw === '~' ? '—' : raw, no: raw, punct: true }
      if (raw.startsWith('^')) {
        const name = spaced(raw.slice(1))
        return { es: name, no: name, name: true }
      }
      const [left, override] = raw.split('=') as [string, string | undefined]
      const [form, link] = left.split('>') as [string, string | undefined]
      const es = spaced(form)
      const id = spaced(link ?? es.toLowerCase())
      const w = WORD[id]
      if (!w) throw new Error(`Not in the word bank: ${id} (in "${line}")`)
      const no = override ? spaced(override) : gloss(w)
      return { es, id, no: isCapital(es) ? capital(no) : no }
    })
  // A Norwegian that ends as the line goes on (¡qué rico! as «så godt!»
  // before «!») leaves the mark to the line, so that it is not shown twice
  return toks.map((t, i) => {
    const mark = t.no.at(-1)
    return t.id && (mark === '!' || mark === '?') && toks[i + 1]?.no === mark
      ? { ...t, no: t.no.slice(0, -1) }
      : t
  })
}

// Where a space goes before a token: not before closing punctuation, nor
// after opening punctuation
export function spaceBefore(toks: Array<Token>, i: number): boolean {
  if (i === 0) return false
  const t = toks[i]
  const prev = toks[i - 1]
  if (t.punct && (BEFORE.has(t.no) || t.no === '~')) return false
  if (prev.punct && AFTER.has(prev.no)) return false
  return true
}

// The line as Spanish is written, for reading aloud
export const plain = (line: string) => {
  const toks = tokens(line)
  return toks.map((t, i) => (spaceBefore(toks, i) ? ' ' : '') + t.es).join('')
}

// The word ids in a line
export const wordIds = (line: string) => [
  ...new Set(tokens(line).flatMap((t) => (t.id ? [t.id] : []))),
]
