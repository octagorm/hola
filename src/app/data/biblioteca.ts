import { TESTAMENTO } from './libros/testamento.ts'
import { INSACIABLE } from './libros/insaciable.ts'
import { PALACIO } from './libros/palacio.ts'
import { GANGA } from './libros/ganga.ts'
import { BOLONDRON } from './libros/bolondron.ts'
import { DAMA1 } from './libros/dama1.ts'
import { DAMA2 } from './libros/dama2.ts'
import { DAMA3 } from './libros/dama3.ts'
import { DAMA4 } from './libros/dama4.ts'
import { DAMA5 } from './libros/dama5.ts'
import { DAMA6 } from './libros/dama6.ts'
import { DAMA7 } from './libros/dama7.ts'

// The library: short texts as they were written, read a page at a time in
// the reader (games/biblioteca.tsx), each word in Spanish with the Norwegian
// over it until it is known. The first are folk tales from E. S. Harrison's
// An Elementary Spanish Reader (Ginn, Boston 1912), told simply for
// beginners and in the public domain; only the spelling is brought up to
// date (dió → dio, Vd. → usted, sólo → solo) and the dashes set as Spanish
// sets them today. Then come texts written for Hola, such as the crime
// story La dama del abanico azul, a chapter to a text (libros/dama*.ts).
// Each text stands on a shelf (SHELVES), which the library's page shows
// under a heading of its own.
//
// A text's lines are in the markup of data/quijote.ts, a paragraph at a
// time, sentence by sentence, so that reading aloud can go a sentence at a
// time. The words it needs beyond the bank are a lesson of their own in
// data/words.ts (`book`), with the text's id: they are met only here, when
// a word's card is told it is known or to be practised.

export interface Book {
  // Its page: /#biblioteca/testamento, and its lesson of words
  id: string
  // The shelf it stands on (SHELVES)
  shelf: string
  es: string
  no: string
  // Who wrote it, or where it is from, in Norwegian
  by: string
  // On its page, above the text: what it is, in a few plain lines
  about: string
  // Where it is from; a text written for Hola has no address
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
  DAMA1,
  DAMA2,
  DAMA3,
  DAMA4,
  DAMA5,
  DAMA6,
  DAMA7,
]

// The shelves, each with a few words on what stands on it
export interface Shelf {
  id: string
  es: string
  no: string
  about: string
}

export const SHELVES: Array<Shelf> = [
  {
    id: 'cuentos',
    es: 'Cuentos de 1912',
    no: 'Folkefortellinger fra 1912',
    about:
      'Korte spanske folkefortellinger slik de ble skrevet for nybegynnere i 1912, ikke gjenfortalt.',
  },
  {
    id: 'dama',
    es: 'La dama del abanico azul',
    no: 'Damen med den blå vifta',
    about:
      'En krim i sju kapitler, skrevet for Hola. En pensjonert politietterforsker fra Bergen lærer spansk i Toledo, der et maleri og en død mann ikke er det de ser ut til.',
  },
]

export const BOOK: Record<string, Book | undefined> = Object.fromEntries(
  BOOKS.map((b) => [b.id, b]),
)

// Every sentence of a text, in order
export const sentencesOf = (b: Book) => b.text.flat()
