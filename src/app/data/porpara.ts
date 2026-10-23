// Por o para: sentences with a gap where por or para goes, by the rule
// that decides it. Only sentences where one of the two is right: none
// where both would do with different meanings (Trabajo por/para mi
// familia; Este autobús va por/para el centro).
//
// One line per sentence, as in data/words.ts: the Spanish with _ for the
// gap; the Norwegian; the other words of the bank in it, by id (articles
// left out); and for a fixed expression, the expression and what it means.
// tests/porpara.test.ts checks that every word is in the bank.

export type Rule =
  | 'destinatario'
  | 'destino'
  | 'plazo'
  | 'finalidad'
  | 'causa'
  | 'lugar'
  | 'cambio'
  | 'medio'
  | 'tiempo'
  | 'per'
  | 'agente'
  | 'fijo'

export type Answer = 'por' | 'para'

export interface RuleInfo {
  // The word the rule takes; a fixed expression takes either
  word?: Answer
  // A name for it, short
  name: string
  // Why, in a line
  why: string
}

export const RULES: Record<Rule, RuleInfo> = {
  destinatario: {
    word: 'para',
    name: 'mottaker',
    why: 'Para viser hvem noe er til.',
  },
  destino: {
    word: 'para',
    name: 'mål',
    why: 'Para peker mot målet: dit man skal.',
  },
  plazo: {
    word: 'para',
    name: 'frist',
    why: 'Para gir en frist: til da, innen da.',
  },
  finalidad: {
    word: 'para',
    name: 'hensikt',
    why: 'Para viser hensikten: for å.',
  },
  causa: {
    word: 'por',
    name: 'grunn',
    why: 'Por viser grunnen: på grunn av, takk for.',
  },
  lugar: {
    word: 'por',
    name: 'vei',
    why: 'Por viser veien: gjennom, over, rundt i.',
  },
  cambio: {
    word: 'por',
    name: 'bytte og pris',
    why: 'Por viser bytte og pris: i bytte mot, for så mye.',
  },
  medio: {
    word: 'por',
    name: 'måte',
    why: 'Por viser måten: i telefonen, på TV, med posten.',
  },
  tiempo: {
    word: 'por',
    name: 'tid på dagen',
    why: 'Por med tid på dagen: om morgenen, om kvelden.',
  },
  per: {
    word: 'por',
    name: 'per',
    why: 'Por betyr per: for hver person, hver uke, hver time.',
  },
  agente: {
    word: 'por',
    name: 'av hvem',
    why: 'Por viser hvem som gjorde det: skrevet av, malt av.',
  },
  fijo: { name: 'fast uttrykk', why: 'Et fast uttrykk.' },
}

const LIST: Record<Rule, string> = {
  destinatario: `
    Este regalo es _ ti. | Denne gaven er til deg. | este, ser
    Las flores son _ mi madre. | Blomstene er til moren min. | la flor, ser, mi, la madre
    Este libro es _ mi hermana. | Denne boka er til søsteren min. | este, el libro, ser, mi, la hermana
    ¿Tienen una mesa _ cuatro? | Har dere et bord til fire? | tener, la mesa, cuatro
    Un zumo de naranja _ el niño. | En appelsinjuice til gutten. | el zumo, de, la naranja, el niño
    Hay una carta _ usted. | Det er et brev til Dem. | hay, usted
    El postre es _ los niños. | Desserten er til barna. | el postre, ser, el niño
  `,
  destino: `
    El tren _ Sevilla sale a las ocho. | Toget til Sevilla går klokka åtte. | el tren, salir, a, ocho
    Tengo un billete _ Valencia. | Jeg har en billett til Valencia. | tener, el billete
    ¿A qué hora sale el autobús _ Toledo? | Når går bussen til Toledo? | a, qué, la hora, salir, el autobús
    El avión _ Londres sale tarde. | Flyet til London går sent. | el avión, salir, tarde
    Ahora voy _ casa. | Nå drar jeg hjem. | ahora, ir, la casa
  `,
  plazo: `
    Necesito el libro _ el lunes. | Jeg trenger boka til mandag. | necesitar, el libro, el lunes
    Tengo que terminar _ mañana. | Jeg må bli ferdig til i morgen. | tener, que, terminar, mañana
    Quiero la habitación _ el sábado. | Jeg vil ha rommet til lørdag. | querer, la habitación, el sábado
    El trabajo es _ el viernes. | Arbeidet skal være ferdig til fredag. | ser, el viernes
    Tengo que escribir la carta _ el miércoles. | Jeg må skrive brevet innen onsdag. | tener, que, escribir, el miércoles
  `,
  finalidad: `
    Aprendo español _ hablar con mis amigos. | Jeg lærer spansk for å snakke med vennene mine. | aprender, hablar, con, mi, el amigo
    Necesito gafas _ leer. | Jeg trenger briller for å lese. | necesitar, leer
    Trabajo _ vivir. | Jeg jobber for å leve. | trabajar, vivir
    Abro la ventana _ ver el mar. | Jeg åpner vinduet for å se havet. | abrir, la ventana, ver, el mar
    Voy al mercado _ comprar pan. | Jeg går på markedet for å kjøpe brød. | ir, al, el mercado, comprar, el pan
    Llamo al camarero _ pagar. | Jeg roper på servitøren for å betale. | llamar, al, el camarero, pagar
    Leo mucho _ aprender. | Jeg leser mye for å lære. | leer, mucho, aprender
    La llave es _ la puerta del jardín. | Nøkkelen er til hagedøra. | la llave, ser, la puerta, del, el jardín
    El aceite es _ la ensalada. | Oljen er til salaten. | el aceite, ser, la ensalada
  `,
  causa: `
    Gracias _ todo. | Takk for alt. | gracias, todo
    Muchas gracias _ la comida. | Tusen takk for maten. | muchas gracias, la comida
    Perdón _ llegar tarde. | Unnskyld at jeg kommer for sent. | perdón, llegar, tarde
    Gracias _ venir. | Takk for at du kom. | gracias, venir
    No salimos _ la lluvia. | Vi går ikke ut på grunn av regnet. | no, salir, la lluvia
    Hoy no trabajo _ el calor. | I dag jobber jeg ikke, på grunn av varmen. | hoy, no, trabajar, el calor
    El pueblo es famoso _ su vino. | Landsbyen er berømt for vinen sin. | el pueblo, ser, famoso, su, el vino
    Don Quijote pierde la cabeza _ los libros. | Don Quijote mister forstanden på grunn av bøkene. | perder, la cabeza, el libro
  `,
  lugar: `
    El gato sale _ la ventana. | Katten går ut gjennom vinduet. | el gato, salir, la ventana
    El tren pasa _ el puente. | Toget kjører over brua. | el tren, el puente
    El río pasa _ la ciudad. | Elva renner gjennom byen. | el río, la ciudad
    Paseo _ el parque. | Jeg går tur i parken. |
    ¿Hay un banco _ aquí? | Er det en bank her i nærheten? | hay, el banco, aquí
    Don Quijote busca aventuras _ el mundo. | Don Quijote leter etter eventyr rundt i verden. | buscar, la aventura, el mundo
  `,
  cambio: `
    Lo compré _ diez euros. | Jeg kjøpte den for ti euro. | lo, comprar, diez
    Pago veinte euros _ el libro. | Jeg betaler tjue euro for boka. | pagar, veinte, el libro
    Te cambio mi manzana _ tu plátano. | Jeg bytter eplet mitt mot bananen din. | te, mi, la manzana, tu, el plátano
    Vendo el coche _ mil euros. | Jeg selger bilen for tusen euro. | el coche, mil
  `,
  medio: `
    Hablamos _ teléfono. | Vi snakker i telefonen. | hablar, el teléfono
    Lo vi _ la televisión. | Jeg så det på TV. | lo, ver, la televisión
    Te mando la foto _ correo. | Jeg sender deg bildet i posten. | te, la foto
    Lo oí _ la radio. | Jeg hørte det på radioen. | lo, oír
  `,
  tiempo: `
    Trabajo _ la mañana. | Jeg jobber om formiddagen. | trabajar, la mañana
    El bar abre _ la noche. | Baren åpner om kvelden. | el bar, abrir, la noche
    _ la tarde, tomo un café. | Om ettermiddagen tar jeg en kaffe. | la tarde, tomar, el café
    Vamos a la playa _ la mañana. | Vi drar til stranda om morgenen. | ir, a, la playa, la mañana
  `,
  per: `
    Dos euros _ persona. | To euro per person. | dos, la persona
    Corro tres veces _ semana. | Jeg løper tre ganger i uka. | correr, tres, la semana
    El tren va a cien kilómetros _ hora. | Toget kjører i hundre kilometer i timen. | el tren, ir, a, cien, la hora
    La habitación cuesta cincuenta euros _ noche. | Rommet koster femti euro natta. | la habitación, cincuenta, la noche
  `,
  agente: `
    Don Quijote fue escrito _ Cervantes. | Don Quijote ble skrevet av Cervantes. | ser, escribir
    El Guernica fue pintado _ Picasso. | Guernica ble malt av Picasso. | ser, pintar
  `,
  fijo: `
    Un café, _ favor. | En kaffe, takk. | el café | por favor = vær så snill
    ¡_ fin llega el verano! | Endelig kommer sommeren! | llegar, el verano | por fin = endelig
    Sí, _ supuesto. | Ja, selvfølgelig. | sí | por supuesto = selvfølgelig
    Me gustan los animales, _ ejemplo, los gatos. | Jeg liker dyr, for eksempel katter. | me, gustar, el gato | por ejemplo = for eksempel
    Hace frío. _ eso, no salimos. | Det er kaldt. Derfor går vi ikke ut. | hacer, el frío, no, salir | por eso = derfor
    Veo el mar _ primera vez. | Jeg ser havet for første gang. | ver, el mar, primero | por primera vez = for første gang
    Un café _ llevar. | En kaffe å ta med. | el café, llevar | para llevar = å ta med
    Esto es _ siempre. | Dette er for alltid. | esto, ser, siempre | para siempre = for alltid
  `,
}

export interface Gap {
  // The Spanish with _ where por or para goes, which is also its key
  es: string
  a: Answer
  no: string
  rule: Rule
  // The other words of the bank in it, by id
  words: Array<string>
  // A fixed expression, and what it means: ['por fin', 'endelig']
  expr?: [string, string]
}

function parse(rule: Rule, line: string): Gap {
  const [es, no, words = '', expr] = line.split('|').map((s) => s.trim())
  if (!es || !no) throw new Error(`Not a sentence: "${line}"`)
  const pair = expr
    ? (expr.split('=').map((s) => s.trim()) as [string, string])
    : undefined
  const a = RULES[rule].word ?? (pair?.[0].split(' ')[0] as Answer | undefined)
  if (a !== 'por' && a !== 'para') throw new Error(`No answer: "${line}"`)
  return {
    es,
    a,
    no,
    rule,
    words: words
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    ...(pair ? { expr: pair } : {}),
  }
}

export const GAPS: Array<Gap> = (Object.keys(LIST) as Array<Rule>).flatMap(
  (rule) =>
    LIST[rule]
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line) => parse(rule, line)),
)
