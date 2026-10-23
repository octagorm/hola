// Ayer, hoy, mañana: sentences said yesterday, today and tomorrow. Ayer
// takes the pretérito indefinido (comí), hoy the present (como), mañana
// «ir a» and the infinitive (voy a comer), the commonest future and the
// easiest. Hoy is kept to the present: Spain says «hoy he comido» of what
// is already done today, and that is another game.
//
// Every form is written out by hand, not conjugated by rule, and checked
// against a table in tests/tiempos.test.ts. Each sentence: the verb (an id
// in the bank) and who does it; then the three versions, each with the
// verb's form in brackets, the same form for the wrong person (offered to
// pick from: for yo, tú and ellos the form for él; for él, ella and usted
// the form for yo; for nosotros and vosotros the form for ellos), and the
// Norwegian.
//
// In four levels, easiest first: regular verbs with yo; with tú, él, ella
// and usted; in the plural, and with yo where the spelling or the stem
// changes (llegué, busqué, pienso, salgo, vuelvo); and the irregular
// verbs. Nosotros only with -er verbs, whose past and present differ
// (comimos, comemos: hablamos is both).

export type Time = 'ayer' | 'hoy' | 'manana'

export const TIMES: Array<Time> = ['ayer', 'hoy', 'manana']

export type Who =
  'yo' | 'tú' | 'él' | 'ella' | 'usted' | 'nosotros' | 'vosotros' | 'ellos'

export type Level = 1 | 2 | 3 | 4

export interface Version {
  // The sentence, the verb's form in brackets: 'Ayer [comí] paella.'
  es: string
  // The form for the wrong person
  miss: string
  no: string
}

export interface Sentence {
  verb: string
  who: Who
  level: Level
  ayer: Version
  hoy: Version
  manana: Version
}

const LEVELS: Array<string> = [
  `
  comer, yo
    Ayer [comí] paella. | comió | I går spiste jeg paella.
    Hoy [como] paella. | come | I dag spiser jeg paella.
    Mañana [voy a comer] paella. | va a comer | I morgen skal jeg spise paella.
  comprar, yo
    Ayer [compré] pan. | compró | I går kjøpte jeg brød.
    Hoy [compro] pan. | compra | I dag kjøper jeg brød.
    Mañana [voy a comprar] pan. | va a comprar | I morgen skal jeg kjøpe brød.
  trabajar, yo
    Ayer [trabajé] en casa. | trabajó | I går jobbet jeg hjemme.
    Hoy [trabajo] en casa. | trabaja | I dag jobber jeg hjemme.
    Mañana [voy a trabajar] en casa. | va a trabajar | I morgen skal jeg jobbe hjemme.
  hablar, yo
    Ayer [hablé] con mi madre. | habló | I går snakket jeg med moren min.
    Hoy [hablo] con mi madre. | habla | I dag snakker jeg med moren min.
    Mañana [voy a hablar] con mi madre. | va a hablar | I morgen skal jeg snakke med moren min.
  beber, yo
    Ayer [bebí] mucha agua. | bebió | I går drakk jeg mye vann.
    Hoy [bebo] mucha agua. | bebe | I dag drikker jeg mye vann.
    Mañana [voy a beber] mucha agua. | va a beber | I morgen skal jeg drikke mye vann.
  escribir, yo
    Ayer [escribí] una carta. | escribió | I går skrev jeg et brev.
    Hoy [escribo] una carta. | escribe | I dag skriver jeg et brev.
    Mañana [voy a escribir] una carta. | va a escribir | I morgen skal jeg skrive et brev.
  cantar, yo
    Ayer [canté] en la iglesia. | cantó | I går sang jeg i kirken.
    Hoy [canto] en la iglesia. | canta | I dag synger jeg i kirken.
    Mañana [voy a cantar] en la iglesia. | va a cantar | I morgen skal jeg synge i kirken.
  aprender, yo
    Ayer [aprendí] mucho. | aprendió | I går lærte jeg mye.
    Hoy [aprendo] mucho. | aprende | I dag lærer jeg mye.
    Mañana [voy a aprender] mucho. | va a aprender | I morgen skal jeg lære mye.
  tomar, yo
    Ayer [tomé] un café con mi amiga. | tomó | I går tok jeg en kaffe med venninnen min.
    Hoy [tomo] un café con mi amiga. | toma | I dag tar jeg en kaffe med venninnen min.
    Mañana [voy a tomar] un café con mi amiga. | va a tomar | I morgen skal jeg ta en kaffe med venninnen min.
  `,
  `
  llamar, tú
    Ayer [llamaste] a tu madre. | llamó | I går ringte du moren din.
    Hoy [llamas] a tu madre. | llama | I dag ringer du moren din.
    Mañana [vas a llamar] a tu madre. | va a llamar | I morgen skal du ringe moren din.
  hablar, tú
    Ayer [hablaste] con el camarero. | habló | I går snakket du med servitøren.
    Hoy [hablas] con el camarero. | habla | I dag snakker du med servitøren.
    Mañana [vas a hablar] con el camarero. | va a hablar | I morgen skal du snakke med servitøren.
  trabajar, usted
    Ayer usted [trabajó] mucho. | trabajé | I går jobbet De mye.
    Hoy usted [trabaja] mucho. | trabajo | I dag jobber De mye.
    Mañana usted [va a trabajar] mucho. | voy a trabajar | I morgen skal De jobbe mye.
  pintar, él
    Ayer mi padre [pintó] la casa. | pinté | I går malte faren min huset.
    Hoy mi padre [pinta] la casa. | pinto | I dag maler faren min huset.
    Mañana mi padre [va a pintar] la casa. | voy a pintar | I morgen skal faren min male huset.
  bailar, ella
    Ayer mi abuela [bailó] flamenco. | bailé | I går danset bestemoren min flamenco.
    Hoy mi abuela [baila] flamenco. | bailo | I dag danser bestemoren min flamenco.
    Mañana mi abuela [va a bailar] flamenco. | voy a bailar | I morgen skal bestemoren min danse flamenco.
  abrir, usted
    Ayer usted [abrió] la tienda. | abrí | I går åpnet De butikken.
    Hoy usted [abre] la tienda. | abro | I dag åpner De butikken.
    Mañana usted [va a abrir] la tienda. | voy a abrir | I morgen skal De åpne butikken.
  romper, él
    Ayer el perro [rompió] un vaso. | rompí | I går knuste hunden et glass.
    Hoy el perro [rompe] un vaso. | rompo | I dag knuser hunden et glass.
    Mañana el perro [va a romper] un vaso. | voy a romper | I morgen kommer hunden til å knuse et glass.
  ganar, él
    Ayer el caballero [ganó] la batalla. | gané | I går vant ridderen slaget.
    Hoy el caballero [gana] la batalla. | gano | I dag vinner ridderen slaget.
    Mañana el caballero [va a ganar] la batalla. | voy a ganar | I morgen kommer ridderen til å vinne slaget.
  comer, él
    Ayer el gato [comió] pescado. | comí | I går spiste katten fisk.
    Hoy el gato [come] pescado. | como | I dag spiser katten fisk.
    Mañana el gato [va a comer] pescado. | voy a comer | I morgen skal katten spise fisk.
  pagar, él
    Ayer mi marido [pagó] la cuenta. | pagué | I går betalte mannen min regningen.
    Hoy mi marido [paga] la cuenta. | pago | I dag betaler mannen min regningen.
    Mañana mi marido [va a pagar] la cuenta. | voy a pagar | I morgen skal mannen min betale regningen.
  escribir, ella
    Ayer la niña [escribió] su nombre. | escribí | I går skrev jenta navnet sitt.
    Hoy la niña [escribe] su nombre. | escribo | I dag skriver jenta navnet sitt.
    Mañana la niña [va a escribir] su nombre. | voy a escribir | I morgen skal jenta skrive navnet sitt.
  esperar, ella
    Ayer mi tía [esperó] en la estación. | esperé | I går ventet tanten min på stasjonen.
    Hoy mi tía [espera] en la estación. | espero | I dag venter tanten min på stasjonen.
    Mañana mi tía [va a esperar] en la estación. | voy a esperar | I morgen skal tanten min vente på stasjonen.
  comprar, ella
    Ayer mi madre [compró] pescado en el mercado. | compré | I går kjøpte moren min fisk på markedet.
    Hoy mi madre [compra] pescado en el mercado. | compro | I dag kjøper moren min fisk på markedet.
    Mañana mi madre [va a comprar] pescado en el mercado. | voy a comprar | I morgen skal moren min kjøpe fisk på markedet.
  `,
  `
  comer, nosotros
    Ayer [comimos] en un restaurante. | comieron | I går spiste vi på restaurant.
    Hoy [comemos] en un restaurante. | comen | I dag spiser vi på restaurant.
    Mañana [vamos a comer] en un restaurante. | van a comer | I morgen skal vi spise på restaurant.
  beber, nosotros
    Ayer [bebimos] cerveza en el bar. | bebieron | I går drakk vi øl på baren.
    Hoy [bebemos] cerveza en el bar. | beben | I dag drikker vi øl på baren.
    Mañana [vamos a beber] cerveza en el bar. | van a beber | I morgen skal vi drikke øl på baren.
  bailar, ellos
    Ayer los niños [bailaron] en la plaza. | bailó | I går danset barna på torget.
    Hoy los niños [bailan] en la plaza. | baila | I dag danser barna på torget.
    Mañana los niños [van a bailar] en la plaza. | va a bailar | I morgen skal barna danse på torget.
  llegar, ellos
    Ayer mis padres [llegaron] a Madrid. | llegó | I går kom foreldrene mine til Madrid.
    Hoy mis padres [llegan] a Madrid. | llega | I dag kommer foreldrene mine til Madrid.
    Mañana mis padres [van a llegar] a Madrid. | va a llegar | I morgen kommer foreldrene mine til Madrid.
  comprar, vosotros
    Ayer [comprasteis] un coche nuevo. | compraron | I går kjøpte dere en ny bil.
    Hoy [compráis] un coche nuevo. | compran | I dag kjøper dere en ny bil.
    Mañana [vais a comprar] un coche nuevo. | van a comprar | I morgen skal dere kjøpe en ny bil.
  esperar, vosotros
    Ayer [esperasteis] el autobús. | esperaron | I går ventet dere på bussen.
    Hoy [esperáis] el autobús. | esperan | I dag venter dere på bussen.
    Mañana [vais a esperar] el autobús. | van a esperar | I morgen skal dere vente på bussen.
  llegar, yo
    Ayer [llegué] temprano al trabajo. | llegó | I går kom jeg tidlig på jobb.
    Hoy [llego] temprano al trabajo. | llega | I dag kommer jeg tidlig på jobb.
    Mañana [voy a llegar] temprano al trabajo. | va a llegar | I morgen kommer jeg tidlig på jobb.
  buscar, yo
    Ayer [busqué] un hotel. | buscó | I går lette jeg etter et hotell.
    Hoy [busco] un hotel. | busca | I dag leter jeg etter et hotell.
    Mañana [voy a buscar] un hotel. | va a buscar | I morgen skal jeg lete etter et hotell.
  pensar, yo
    Ayer [pensé] en ti. | pensó | I går tenkte jeg på deg.
    Hoy [pienso] en ti. | piensa | I dag tenker jeg på deg.
    Mañana [voy a pensar] en ti. | va a pensar | I morgen kommer jeg til å tenke på deg.
  salir, yo
    Ayer [salí] con mis amigos. | salió | I går gikk jeg ut med vennene mine.
    Hoy [salgo] con mis amigos. | sale | I dag går jeg ut med vennene mine.
    Mañana [voy a salir] con mis amigos. | va a salir | I morgen skal jeg gå ut med vennene mine.
  volver, yo
    Ayer [volví] tarde a casa. | volvió | I går kom jeg sent hjem.
    Hoy [vuelvo] tarde a casa. | vuelve | I dag kommer jeg sent hjem.
    Mañana [voy a volver] tarde a casa. | va a volver | I morgen kommer jeg sent hjem.
  `,
  `
  ir, yo
    Ayer [fui] a la playa. | fue | I går dro jeg til stranda.
    Hoy [voy] a la playa. | va | I dag drar jeg til stranda.
    Mañana [voy a ir] a la playa. | va a ir | I morgen skal jeg dra til stranda.
  tener, yo
    Ayer [tuve] mucho trabajo. | tuvo | I går hadde jeg mye å gjøre.
    Hoy [tengo] mucho trabajo. | tiene | I dag har jeg mye å gjøre.
    Mañana [voy a tener] mucho trabajo. | va a tener | I morgen får jeg mye å gjøre.
  hacer, yo
    Ayer [hice] una tortilla. | hizo | I går lagde jeg en omelett.
    Hoy [hago] una tortilla. | hace | I dag lager jeg en omelett.
    Mañana [voy a hacer] una tortilla. | va a hacer | I morgen skal jeg lage en omelett.
  ver, yo
    Ayer [vi] a mis amigos. | vio | I går traff jeg vennene mine.
    Hoy [veo] a mis amigos. | ve | I dag treffer jeg vennene mine.
    Mañana [voy a ver] a mis amigos. | va a ver | I morgen skal jeg treffe vennene mine.
  estar, yo
    Ayer [estuve] en Madrid. | estuvo | I går var jeg i Madrid.
    Hoy [estoy] en Madrid. | está | I dag er jeg i Madrid.
    Mañana [voy a estar] en Madrid. | va a estar | I morgen er jeg i Madrid.
  poder, yo
    Ayer no [pude] venir. | pudo | I går kunne jeg ikke komme.
    Hoy no [puedo] venir. | puede | I dag kan jeg ikke komme.
    Mañana no [voy a poder] venir. | va a poder | I morgen kan jeg ikke komme.
  ser, él
    Ayer [fue] un día bonito. | fui | I går var en fin dag.
    Hoy [es] un día bonito. | soy | I dag er en fin dag.
    Mañana [va a ser] un día bonito. | voy a ser | I morgen blir en fin dag.
  venir, él
    Ayer mi hermano [vino] a comer. | vine | I går kom broren min på middag.
    Hoy mi hermano [viene] a comer. | vengo | I dag kommer broren min på middag.
    Mañana mi hermano [va a venir] a comer. | voy a venir | I morgen kommer broren min på middag.
  decir, ella
    Ayer mi madre [dijo] que sí. | dije | I går sa moren min ja.
    Hoy mi madre [dice] que sí. | digo | I dag sier moren min ja.
    Mañana mi madre [va a decir] que sí. | voy a decir | I morgen sier moren min ja.
  hacer, nosotros
    Ayer [hicimos] una paella. | hicieron | I går lagde vi paella.
    Hoy [hacemos] una paella. | hacen | I dag lager vi paella.
    Mañana [vamos a hacer] una paella. | van a hacer | I morgen skal vi lage paella.
  ir, vosotros
    Ayer [fuisteis] al cine. | fueron | I går gikk dere på kino.
    Hoy [vais] al cine. | van | I dag går dere på kino.
    Mañana [vais a ir] al cine. | van a ir | I morgen skal dere gå på kino.
  tener, ellos
    Ayer los vecinos [tuvieron] una fiesta. | tuvo | I går hadde naboene fest.
    Hoy los vecinos [tienen] una fiesta. | tiene | I dag har naboene fest.
    Mañana los vecinos [van a tener] una fiesta. | va a tener | I morgen skal naboene ha fest.
  dormir, él
    Ayer el bebé [durmió] mucho. | dormí | I går sov babyen mye.
    Hoy el bebé [duerme] mucho. | duermo | I dag sover babyen mye.
    Mañana el bebé [va a dormir] mucho. | voy a dormir | I morgen kommer babyen til å sove mye.
  leer, ella
    Ayer mi abuela [leyó] un libro. | leí | I går leste bestemoren min en bok.
    Hoy mi abuela [lee] un libro. | leo | I dag leser bestemoren min en bok.
    Mañana mi abuela [va a leer] un libro. | voy a leer | I morgen skal bestemoren min lese en bok.
  `,
]

const WHO = new Set<string>([
  'yo',
  'tú',
  'él',
  'ella',
  'usted',
  'nosotros',
  'vosotros',
  'ellos',
])

const START: Record<Time, string> = {
  ayer: 'Ayer ',
  hoy: 'Hoy ',
  manana: 'Mañana ',
}

function version(line: string | undefined, t: Time): Version {
  const [es, miss, no] = (line ?? '').split('|').map((s) => s.trim())
  if (!es.startsWith(START[t]) || !miss || !no)
    throw new Error(`Not a version for ${t}: "${line}"`)
  return { es, miss, no }
}

function parse(block: string, level: Level): Array<Sentence> {
  const lines = block
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  const out: Array<Sentence> = []
  for (let i = 0; i < lines.length; i += 4) {
    const [verb, who] = lines[i].split(',').map((s) => s.trim())
    if (!verb || !WHO.has(who)) throw new Error(`Not a verb: "${lines[i]}"`)
    out.push({
      verb,
      who: who as Who,
      level,
      ayer: version(lines.at(i + 1), 'ayer'),
      hoy: version(lines.at(i + 2), 'hoy'),
      manana: version(lines.at(i + 3), 'manana'),
    })
  }
  return out
}

export const SENTENCES: Array<Sentence> = LEVELS.flatMap((block, i) =>
  parse(block, (i + 1) as Level),
)
