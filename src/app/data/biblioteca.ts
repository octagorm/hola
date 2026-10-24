import { TESTAMENTO } from './libros/testamento.ts'
import { INSACIABLE } from './libros/insaciable.ts'
import { PALACIO } from './libros/palacio.ts'
import { GANGA } from './libros/ganga.ts'
import { BOLONDRON } from './libros/bolondron.ts'

// The library: short texts as they were written, read a page at a time in
// the reader (games/biblioteca.tsx), each word in Spanish with the Norwegian
// over it until it is known. The first are folk tales from E. S. Harrison's
// An Elementary Spanish Reader (Ginn, Boston 1912), told simply for
// beginners and in the public domain; only the spelling is brought up to
// date (dió → dio, Vd. → usted, sólo → solo) and the dashes set as Spanish
// sets them today.
//
// A text's lines are in the markup of data/quijote.ts, a paragraph at a
// time, sentence by sentence, so that reading aloud can go a sentence at a
// time. The words it needs beyond the bank are a lesson of their own in
// data/words.ts (`book`), with the text's id: they are met only here, when
// a word's card is told it is known or to be practised.

export interface Book {
  // Its page: /#biblioteca/testamento, and its lesson of words
  id: string
  es: string
  no: string
  // Who wrote it, or where it is from, in Norwegian
  by: string
  // On its page, above the text: what it is, in a few plain lines
  about: string
  source: { label: string; url: string }
  // Paragraphs, each a list of sentences in markup
  text: Array<Array<string>>
  // What a form of a word is, by the form as written, in lower case:
  // 'dijo' → 'decir i fortid: han, hun, De sa'
  forms: Record<string, string>
  // Notes on a word where it stands, by the key after # in the markup
  notes: Record<string, string>
}

export const BOOKS: Array<Book> = [
  TESTAMENTO,
  INSACIABLE,
  PALACIO,
  GANGA,
  BOLONDRON,
]

export const BOOK: Record<string, Book | undefined> = Object.fromEntries(
  BOOKS.map((b) => [b.id, b]),
)

// Every sentence of a text, in order
export const sentencesOf = (b: Book) => b.text.flat()
