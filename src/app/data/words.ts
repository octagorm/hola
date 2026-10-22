// The words Hola teaches, lesson by lesson, in the order they are met.
// Spain's Spanish: ordenador, zumo, coche, vosotros.
//
// One line per word: the Spanish as it is said and typed, with its article
// for a noun; the Norwegian; and for anything but a noun its part of
// speech. A noun's gender comes from its article, and a feminine noun that
// takes «el» (el agua) says so with f. Meanings after the first, after a
// comma, are shown in the word bank and in questions; mixed text uses the
// first.

export type Pos =
  | 'n'
  | 'v'
  | 'adj'
  | 'adv'
  | 'prep'
  | 'conj'
  | 'pron'
  | 'det'
  | 'num'
  | 'int'
  | 'expr'

export interface Word {
  // The Spanish as written in the list, which is unique: 'el gato'
  id: string
  es: string
  no: string
  pos: Pos
  // A noun's gender
  g?: 'm' | 'f'
  // A noun used in the plural: los padres
  pl?: boolean
  lesson: string
  // The word without its article, as in a crossword: 'gato'
  bare: string
}

export interface Lesson {
  id: string
  es: string
  no: string
}

const LIST: Array<Lesson & { words: string }> = [
  {
    id: 'saludos',
    es: 'Saludos',
    no: 'Hilsener',
    words: `
      hola | hei | int
      adiós | ha det | int
      buenos días | god morgen | expr
      buenas tardes | god ettermiddag | expr
      buenas noches | god kveld, god natt | expr
      hasta luego | vi ses | expr
      hasta mañana | vi ses i morgen | expr
      gracias | takk | int
      muchas gracias | tusen takk | expr
      de nada | ingen årsak | expr
      por favor | vær så snill | expr
      perdón | unnskyld | int
      lo siento | beklager | expr
      sí | ja | adv
      no | nei, ikke | adv
      vale | ok, greit | int
      bien | bra | adv
      mal | dårlig | adv
      ¿qué tal? | hvordan går det? | expr
      muy | veldig | adv
      mucho gusto | hyggelig å treffe deg | expr
    `,
  },
  {
    id: 'yo',
    es: 'Yo y tú',
    no: 'Jeg og du',
    words: `
      yo | jeg | pron
      tú | du | pron
      él | han | pron
      ella | hun | pron
      usted | De, du (høflig) | pron
      nosotros | vi | pron
      vosotros | dere | pron
      ellos | de | pron
      ser | være (hva noe er) | v
      estar | være (hvor og hvordan) | v
      tener | ha | v
      llamarse | hete | v
      me llamo | jeg heter | expr
      ¿cómo te llamas? | hva heter du? | expr
      el nombre | navn
      el hombre | mann
      la mujer | kvinne, kone
      el niño | gutt, barn
      la niña | jente
      el amigo | venn
      la amiga | venninne
      el señor | herre, herr
      la señora | dame, fru
      la persona | person
    `,
  },
  {
    id: 'pequenas',
    es: 'Palabras pequeñas',
    no: 'Småord',
    words: `
      el | -en (hankjønn) | det
      la | -en, -a (hunkjønn) | det
      los | -ene (hankjønn) | det
      las | -ene (hunkjønn) | det
      un | en (hankjønn) | det
      una | en, ei (hunkjønn) | det
      y | og | conj
      o | eller | conj
      pero | men | conj
      porque | fordi | conj
      que | som, at | conj
      de | av, fra | prep
      a | til | prep
      en | i, på | prep
      con | med | prep
      sin | uten | prep
      para | for, til | prep
      por | gjennom, for | prep
      del | av den | prep
      al | til den | prep
      mi | min | det
      tu | din | det
      su | hans, hennes, deres | det
      me | meg | pron
      te | deg | pron
      lo | ham, den | pron
      le | ham, henne (til) | pron
      se | seg | pron
      este | denne | det
      esto | dette | pron
      aquí | her | adv
      allí | der | adv
      hay | det er, det finnes | expr
      mucho | mye | adv
      poco | lite | adv
      más | mer | adv
      todo | alt, hele | pron
      nada | ingenting | pron
      nadie | ingen | pron
      algo | noe | pron
      también | også | adv
    `,
  },
  {
    id: 'numeros',
    es: 'Números',
    no: 'Tall',
    words: `
      uno | en, én | num
      dos | to | num
      tres | tre | num
      cuatro | fire | num
      cinco | fem | num
      seis | seks | num
      siete | sju | num
      ocho | åtte | num
      nueve | ni | num
      diez | ti | num
      once | elleve | num
      doce | tolv | num
      veinte | tjue | num
      treinta | tretti | num
      cincuenta | femti | num
      cien | hundre | num
      mil | tusen | num
      el número | tall, nummer
      primero | første | adj
      último | siste | adj
    `,
  },
  {
    id: 'familia',
    es: 'La familia',
    no: 'Familien',
    words: `
      la familia | familie
      la madre | mor
      el padre | far
      los padres | foreldre
      el hijo | sønn
      la hija | datter
      los hijos | barn (ens egne)
      el hermano | bror
      la hermana | søster
      el abuelo | bestefar
      la abuela | bestemor
      el tío | onkel
      la tía | tante
      el primo | fetter
      la prima | kusine
      el marido | ektemann
      el bebé | baby
      el perro | hund
      el gato | katt
      casado | gift | adj
      joven | ung | adj
      mayor | eldre | adj
    `,
  },
  {
    id: 'comida',
    es: 'Tapas y comida',
    no: 'Mat og drikke',
    words: `
      la comida | mat, måltid
      el pan | brød
      el agua | vann | f
      el vino | vin
      la cerveza | øl
      el café | kaffe
      el té | te
      la leche | melk
      el zumo | juice
      el queso | ost
      el jamón | skinke
      la tortilla | omelett
      la aceituna | oliven
      el aceite | olje
      la sal | salt
      el azúcar | sukker
      el huevo | egg
      la naranja | appelsin
      la manzana | eple
      el plátano | banan
      el tomate | tomat
      la patata | potet
      el arroz | ris
      la sopa | suppe
      el pescado | fisk (som mat)
      la carne | kjøtt
      el pollo | kylling
      la ensalada | salat
      el postre | dessert
      la tapa | smårett, lokk
      el plato | tallerken, rett
      el vaso | glass
      la botella | flaske
      la cuenta | regning
      el camarero | servitør
      el hambre | sult | f
      comer | spise | v
      beber | drikke | v
      tomar | ta, drikke | v
      querer | ville, ville ha | v
      rico | deilig, rik | adj
    `,
  },
  {
    id: 'casa',
    es: 'La casa',
    no: 'Huset',
    words: `
      la casa | hus, hjem
      la puerta | dør
      la ventana | vindu
      la mesa | bord
      la silla | stol
      la cama | seng
      la cocina | kjøkken
      el baño | bad
      la habitación | rom, soverom
      el cajón | skuff
      el reloj | klokke, ur
      la llave | nøkkel
      la lámpara | lampe
      el espejo | speil
      el sofá | sofa
      el libro | bok
      el teléfono | telefon
      el ordenador | datamaskin
      la televisión | TV
      la foto | bilde, foto
      el cartón | papp
      el piano | piano
      el jardín | hage
      la pared | vegg
      el suelo | gulv, bakke
      el techo | tak (innvendig)
      la luz | lys
      abrir | åpne | v
      cerrar | lukke | v
      vivir | bo, leve | v
      dormir | sove | v
    `,
  },
  {
    id: 'verbos',
    es: 'Verbos',
    no: 'Verb',
    words: `
      hablar | snakke | v
      ir | gå, dra | v
      venir | komme | v
      ver | se | v
      mirar | se på | v
      hacer | gjøre, lage | v
      poder | kunne | v
      saber | vite, kunne | v
      conocer | kjenne | v
      decir | si | v
      dar | gi | v
      llegar | komme fram | v
      salir | gå ut, dra | v
      leer | lese | v
      escribir | skrive | v
      escuchar | lytte, høre på | v
      oír | høre | v
      buscar | lete etter | v
      encontrar | finne | v
      pensar | tenke | v
      creer | tro | v
      preguntar | spørre | v
      comprar | kjøpe | v
      pagar | betale | v
      trabajar | jobbe | v
      aprender | lære | v
      entender | forstå | v
      necesitar | trenge | v
      gustar | like, falle i smak | v
      me gusta | jeg liker | expr
      esperar | vente, håpe | v
      jugar | leke, spille | v
      cantar | synge | v
      bailar | danse | v
      pintar | male | v
      llevar | bære, ha på seg | v
      volver | komme tilbake | v
      empezar | begynne | v
      terminar | slutte, bli ferdig | v
      caer | falle | v
      correr | løpe | v
      andar | gå (til fots) | v
      montar | ri | v
      ayudar | hjelpe | v
      ganar | vinne, tjene | v
      romper | knuse, ødelegge | v
      perder | miste, tape | v
      llamar | kalle, ringe | v
      moverse | bevege seg | v
      convertir | forvandle, gjøre om | v
      acordarse | huske | v
      soñar | drømme | v
    `,
  },
  {
    id: 'adjetivos',
    es: 'Adjetivos',
    no: 'Adjektiv',
    words: `
      grande | stor | adj
      pequeño | liten | adj
      bueno | god, snill | adj
      malo | dårlig, slem | adj
      nuevo | ny | adj
      viejo | gammel | adj
      bonito | pen | adj
      feo | stygg | adj
      alto | høy | adj
      bajo | lav | adj
      largo | lang | adj
      corto | kort | adj
      caliente | varm, het | adj
      frío | kald | adj
      blando | myk | adj
      duro | hard | adj
      rápido | rask | adj
      lento | langsom | adj
      fácil | lett, enkel | adj
      difícil | vanskelig | adj
      feliz | lykkelig | adj
      triste | trist | adj
      contento | fornøyd, glad | adj
      cansado | trøtt, sliten | adj
      simpático | hyggelig, grei | adj
      loco | gal | adj
      valiente | modig | adj
      enorme | enorm, kjempestor | adj
      delgado | tynn, slank | adj
      flaco | mager | adj
      gordo | tykk | adj
      pobre | fattig, stakkars | adj
      famoso | berømt | adj
      elegante | elegant | adj
      extraño | rar, merkelig | adj
      hermoso | vakker | adj
      magnífico | storartet | adj
      mismo | samme, selv | adj
      otro | annen, en til | adj
    `,
  },
  {
    id: 'colores',
    es: 'Los colores',
    no: 'Farger',
    words: `
      el color | farge
      rojo | rød | adj
      azul | blå | adj
      verde | grønn | adj
      amarillo | gul | adj
      blanco | hvit | adj
      negro | svart | adj
      gris | grå | adj
      marrón | brun | adj
      rosa | rosa | adj
      morado | lilla | adj
      dorado | gyllen | adj
      claro | lys, klar | adj
      oscuro | mørk | adj
    `,
  },
  {
    id: 'tiempo',
    es: 'El tiempo',
    no: 'Tid og vær',
    words: `
      el día | dag
      la noche | natt, kveld
      la mañana | morgen, formiddag
      la tarde | ettermiddag, kveld
      hoy | i dag | adv
      mañana | i morgen | adv
      ayer | i går | adv
      ahora | nå | adv
      entonces | da, så | adv
      siempre | alltid | adv
      nunca | aldri | adv
      tanto | så mye | adv
      la semana | uke
      el mes | måned
      el año | år
      la hora | time, klokkeslett
      el minuto | minutt
      temprano | tidlig | adv
      tarde | sent | adv
      pronto | snart | adv
      de pronto | plutselig | expr
      al final | til slutt | expr
      el lunes | mandag
      el martes | tirsdag
      el miércoles | onsdag
      el jueves | torsdag
      el viernes | fredag
      el sábado | lørdag
      el domingo | søndag
      el sol | sol
      la luna | måne
      la estrella | stjerne
      la lluvia | regn
      el viento | vind
      la nieve | snø
      el calor | varme
      el frío | kulde
      el tiempo | tid, vær
      la primavera | vår
      el verano | sommer
      el otoño | høst
      el invierno | vinter
    `,
  },
  {
    id: 'ciudad',
    es: 'El viaje',
    no: 'Reisen',
    words: `
      la ciudad | by
      el pueblo | landsby, folk
      la calle | gate
      la plaza | torg, plass
      la estación | stasjon
      el tren | tog
      el autobús | buss
      el coche | bil
      el avión | fly
      el billete | billett
      el hotel | hotell
      el museo | museum
      la iglesia | kirke
      el mercado | marked
      la tienda | butikk
      el restaurante | restaurant
      el bar | bar, kafé
      el banco | bank, benk
      el hospital | sykehus
      la playa | strand
      el mar | hav
      la montaña | fjell
      el río | elv
      el puente | bru
      el camino | vei, sti
      el mapa | kart
      la maleta | koffert
      el viaje | reise
      el pasaporte | pass
      el vecino | nabo
      a la izquierda | til venstre | expr
      a la derecha | til høyre | expr
      todo recto | rett fram | expr
      cerca | nær | adv
      lejos | langt unna | adv
      hacia | mot | prep
    `,
  },
  {
    id: 'cuerpo',
    es: 'El cuerpo',
    no: 'Kroppen',
    words: `
      el cuerpo | kropp
      la cabeza | hode
      la cara | ansikt
      el ojo | øye
      la nariz | nese
      la boca | munn
      el labio | leppe
      el diente | tann
      la oreja | øre
      el pelo | hår
      el bigote | bart
      la mano | hånd
      el brazo | arm
      la pierna | bein
      el pie | fot
      el hombro | skulder
      el corazón | hjerte
    `,
  },
  {
    id: 'preguntas',
    es: 'Preguntas',
    no: 'Spørsmål',
    words: `
      qué | hva | pron
      quién | hvem | pron
      dónde | hvor | adv
      cuándo | når | adv
      cómo | hvordan | adv
      por qué | hvorfor | adv
      cuánto | hvor mye | adv
      cuál | hvilken | pron
    `,
  },
  {
    id: 'mancha',
    es: 'La Mancha',
    no: 'Don Quijotes ord',
    words: `
      el caballero | ridder
      el escudero | væpner
      el caballo | hest
      el burro | esel
      el molino | mølle
      el molino de viento | vindmølle
      el gigante | kjempe
      la lanza | lanse
      el escudo | skjold
      la espada | sverd
      el yelmo | hjelm
      la armadura | rustning
      el campo | mark, landsbygd
      el lugar | sted
      la aventura | eventyr
      la batalla | slag, kamp
      el castillo | slott
      la venta | vertshus, salg
      el ventero | vertshusvert
      el rey | konge
      la reina | dronning
      la dama | dame
      el enemigo | fiende
      la isla | øy
      la ínsula | øy (gammeldags)
      el mundo | verden
      el hidalgo | lavadelsmann
      el ama | husholderske | f
      el cura | prest
      el barbero | barber
      el mago | trollmann
      la locura | galskap
      cuyo | hvis (som eier) | pron
      atacar | angripe | v
      luchar | kjempe, slåss | v
    `,
  },
  {
    id: 'suenos',
    es: 'El sueño',
    no: 'Drømmen',
    words: `
      el sueño | drøm, søvn
      la hormiga | maur
      el elefante | elefant
      la jirafa | sjiraff
      el desierto | ørken
      la sombra | skygge
      el cielo | himmel
      la nube | sky
      el fuego | ild
      la langosta | hummer
      el caracol | snegle
      la mariposa | sommerfugl
      el pájaro | fugl
      el pez | fisk (levende)
      la flor | blomst
      el árbol | tre
      la piedra | stein
      el sombrero | hatt
      la cuchara | skje
      el tenedor | gaffel
      el cuchillo | kniv
      derretirse | smelte | v
      raro | rar | adj
      dormido | sovende | adj
      despierto | våken | adj
    `,
  },
]

const ARTICLE: Record<string, { g: 'm' | 'f'; pl: boolean }> = {
  el: { g: 'm', pl: false },
  la: { g: 'f', pl: false },
  los: { g: 'm', pl: true },
  las: { g: 'f', pl: true },
}

const POS = new Set<string>([
  'n',
  'v',
  'adj',
  'adv',
  'prep',
  'conj',
  'pron',
  'det',
  'num',
  'int',
  'expr',
])

function parse(lesson: string, line: string): Word {
  const [es, no, flag] = line.split('|').map((s) => s.trim())
  if (!es || !no) throw new Error(`Not a word: "${line}"`)
  const [first, ...rest] = es.split(' ')
  const art = rest.length ? ARTICLE[first] : undefined
  // A noun: its article first, and nothing said of its part of speech but
  // perhaps its gender
  if (art && (!flag || flag === 'f' || flag === 'm')) {
    return {
      id: es,
      es,
      no,
      pos: 'n',
      g: (flag as 'm' | 'f' | undefined) ?? art.g,
      ...(art.pl ? { pl: true } : {}),
      lesson,
      bare: rest.join(' '),
    }
  }
  if (!flag || !POS.has(flag))
    throw new Error(`No part of speech for "${es}" (${lesson})`)
  return { id: es, es, no, pos: flag as Pos, lesson, bare: es }
}

export const LESSONS: Array<Lesson> = LIST.map(({ id, es, no }) => ({
  id,
  es,
  no,
}))

export const WORDS: Array<Word> = LIST.flatMap((l) =>
  l.words
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => parse(l.id, line)),
)

export const WORD: Record<string, Word | undefined> = Object.fromEntries(
  WORDS.map((w) => [w.id, w]),
)

export const LESSON: Record<string, Lesson | undefined> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
)

// A word that can stand in the crossword and the ring of letters: one word,
// and not a greeting, a saying or an article, which make poor clues
export const isClue = (w: Word) =>
  !w.bare.includes(' ') && !['det', 'int', 'expr'].includes(w.pos)

// The first meaning, as mixed text shows it
export const gloss = (w: Word) => w.no.split(', ')[0]

// The meaning as a question or the word bank shows it: a verb with «å»
export const meaning = (w: Word) => (w.pos === 'v' ? `å ${w.no}` : w.no)

// The article and the word, apart, for showing the article in its
// gender's colour
export function article(w: Word): { art: string; rest: string } | null {
  if (w.pos !== 'n') return null
  const [art, ...rest] = w.es.split(' ')
  return { art, rest: rest.join(' ') }
}
