// Orden: sentences to put in Spanish order, from three words to eight,
// each with its Norwegian, a level from the simplest (1) to the longest
// (4), the picture its panel gets, and what it shows that Norwegian does
// otherwise. Spain's Spanish, of words in the bank.
//
// Each sentence is written in the markup of mixed text (data/quijote.ts):
// a word in the bank as written there, or as form>id (tengo>tener); a name
// as ^Madrid; _ for a space inside a token (por_favor, a_la_derecha); and
// punctuation apart. Each token but punctuation is a tile. `also` holds
// other orders of the same tiles that are as right (Hoy hace sol, Hace sol
// hoy), written the same way, so that each can be shown and said.

export type Pic =
  | 'casa'
  | 'cafe'
  | 'tren'
  | 'sol'
  | 'gato'
  | 'perro'
  | 'mesa'
  | 'luna'
  | 'lluvia'
  | 'mercado'
  | 'reloj'
  | 'molino'
  | 'libro'
  | 'mar'
  | 'iglesia'
  | 'coche'

// What a sentence shows, said once for all the sentences that show it.
// Spanish is set between asterisks, to be shown apart.
export const POINTS = {
  articulo: 'Spansk har artikkelen foran ordet: *el gato* er katten.',
  general:
    'Om noe i sin alminnelighet bruker spansk artikkel: *los gatos* er katter, *el café* er kaffe.',
  adjetivo: 'Adjektivet står etter ordet: *una casa blanca* er et hvitt hus.',
  buen: '*Bueno* blir *buen* foran et hankjønnsord, og står da foran det: *buen tiempo*.',
  agua: '*Agua* er hunkjønn, så det heter *fría*, selv om artikkelen er *el*.',
  sujeto:
    'Verbet viser hvem det er, så *yo*, *tú* og *nosotros* trengs ikke: *tengo* er jeg har.',
  det: 'Spansk har ikke noe «det» som subjekt: *es lunes* er det er mandag.',
  negacion: '*No* står foran verbet: *no trabajo* er jeg jobber ikke.',
  doble:
    'Spansk nekter to ganger: *no entiendo nada* er jeg forstår ingenting.',
  nunca:
    '*Nunca* står foran verbet. Står det etter, må *no* stå foran: *no como nunca carne*.',
  pregunta:
    'Spørreordet står først, og verbet rett etter: *¿dónde vive tu hermana?*',
  si: 'Et ja–nei-spørsmål kan ha samme rekkefølge som en vanlig setning; *¿ ?* og tonefallet viser at det er et spørsmål.',
  prep: 'Preposisjonen står først i spørsmålet: *¿de dónde eres?* er hvor er du fra?',
  pronombre:
    'Små ord som *lo*, *te* og *me* står foran verbet: *te veo* er jeg ser deg.',
  nome: '*No* står foran *me* og *te*: *no me gusta* er jeg liker ikke.',
  gustar:
    'Med *gustar* er det tingen som faller i smak: *me gusta el café* er jeg liker kaffe.',
  gustan: 'Liker man flere ting, blir det *gustan*: *me gustan los gatos*.',
  hay: '*Hay* betyr det er eller det finnes: *hay un gato* er det er en katt.',
  tiempo: 'Tidsord som *hoy* og *mañana* kan stå først eller sist i setningen.',
  hacer:
    'Været sies med *hacer*: *hace sol* er det er sol, *hace calor* er det er varmt.',
  tener: 'Sult og kulde har man på spansk: *tengo frío* er jeg fryser.',
  edad: 'Alderen har man på spansk, med *tener*: *tengo cincuenta años* er jeg er femti år gammel.',
  hora: 'Klokka sies med *ser* og *la* eller *las*: *son las tres* er klokka er tre.',
  dias: 'Ukedagene får artikkel: *el sábado* er på lørdag, *los domingos* på søndager.',
  de: 'Eieren kommer etter *de*: *el perro de mi vecino* er naboens hund.',
  cantidad: 'Mengde sies med *de*: *un vaso de agua* er et glass vann.',
  al: '*A* og *el* blir til *al*: *voy al mercado*.',
  persona: 'Foran en person som er objekt, står *a*: *veo a mi madre*.',
  sinprep:
    'Spansk trenger ikke «på» eller «etter» her: *espero el autobús* er jeg venter på bussen.',
  posesivo: '*Mi*, *tu* og *su* står foran ordet: *mi casa* er huset mitt.',
  estar:
    'Hvor noe er eller ligger, sies med *estar*: *la estación está a la derecha*.',
  ira: '*Ir a* og et verb er å skulle gjøre noe: *voy a comer* er jeg skal spise.',
  llamarse: 'Å hete er *llamarse*: *se llama* er han eller hun heter.',
} as const

export type Point = keyof typeof POINTS

export interface Sentence {
  line: string
  // Other orders as right
  also?: Array<string>
  no: string
  level: 1 | 2 | 3 | 4
  pic: Pic
  point: Point
}

export const SENTENCES: Array<Sentence> = [
  // --- Three words ---
  {
    line: 'No entiendo>entender nada .',
    no: 'Jeg forstår ingenting.',
    level: 1,
    pic: 'libro',
    point: 'doble',
  },
  {
    line: 'Hoy hace>hacer sol>el_sol .',
    also: ['Hace>hacer sol>el_sol hoy .'],
    no: 'I dag er det sol.',
    level: 1,
    pic: 'sol',
    point: 'hacer',
  },
  {
    line: '¿ Qué hora>la_hora es>ser ?',
    no: 'Hva er klokka?',
    level: 1,
    pic: 'reloj',
    point: 'pregunta',
  },
  {
    line: 'El gato>el_gato duerme>dormir .',
    no: 'Katten sover.',
    level: 1,
    pic: 'gato',
    point: 'articulo',
  },
  {
    line: '¿ Tienes>tener un perro>el_perro ?',
    no: 'Har du en hund?',
    level: 1,
    pic: 'perro',
    point: 'si',
  },
  {
    line: 'Mañana es>ser lunes>el_lunes .',
    no: 'I morgen er det mandag.',
    level: 1,
    pic: 'luna',
    point: 'det',
  },
  {
    line: 'Bebo>beber agua>el_agua fría>frío .',
    no: 'Jeg drikker kaldt vann.',
    level: 1,
    pic: 'mesa',
    point: 'adjetivo',
  },
  {
    line: 'Tengo>tener mucho frío>el_frío .',
    no: 'Jeg fryser veldig.',
    level: 1,
    pic: 'luna',
    point: 'tener',
  },
  {
    line: 'No lo sé>saber .',
    no: 'Jeg vet ikke.',
    level: 1,
    pic: 'libro',
    point: 'pronombre',
  },
  {
    line: 'Te veo>ver mañana .',
    also: ['Mañana te veo>ver .'],
    no: 'Jeg ser deg i morgen.',
    level: 1,
    pic: 'sol',
    point: 'pronombre',
  },
  {
    line: 'Voy>ir al mercado>el_mercado .',
    no: 'Jeg går på markedet.',
    level: 1,
    pic: 'mercado',
    point: 'al',
  },
  {
    line: 'Espero>esperar el autobús>el_autobús .',
    no: 'Jeg venter på bussen.',
    level: 1,
    pic: 'reloj',
    point: 'sinprep',
  },
  {
    line: 'Hoy no trabajo>trabajar .',
    also: ['No trabajo>trabajar hoy .'],
    no: 'I dag jobber jeg ikke.',
    level: 1,
    pic: 'sol',
    point: 'negacion',
  },
  {
    line: 'Nunca como>comer carne>la_carne .',
    no: 'Jeg spiser aldri kjøtt.',
    level: 1,
    pic: 'mesa',
    point: 'nunca',
  },
  {
    line: '¿ De dónde eres>ser ?',
    no: 'Hvor er du fra?',
    level: 1,
    pic: 'iglesia',
    point: 'prep',
  },
  {
    line: 'La cuenta>la_cuenta , por_favor .',
    also: ['Por_favor , la cuenta>la_cuenta .'],
    no: 'Regningen, takk.',
    level: 1,
    pic: 'cafe',
    point: 'articulo',
  },
  {
    line: '¿ Cuántos>cuánto años>el_año tienes>tener ?',
    no: 'Hvor gammel er du?',
    level: 1,
    pic: 'reloj',
    point: 'edad',
  },
  {
    line: '¿ Puedo>poder pagar aquí ?',
    no: 'Kan jeg betale her?',
    level: 1,
    pic: 'mercado',
    point: 'si',
  },

  // --- Four words ---
  {
    line: 'Es>ser una casa>la_casa blanca>blanco .',
    no: 'Det er et hvitt hus.',
    level: 2,
    pic: 'casa',
    point: 'adjetivo',
  },
  {
    line: '¿ Dónde está>estar la estación>la_estación ?',
    no: 'Hvor er stasjonen?',
    level: 2,
    pic: 'tren',
    point: 'pregunta',
  },
  {
    line: 'Tengo>tener un gato>el_gato negro .',
    no: 'Jeg har en svart katt.',
    level: 2,
    pic: 'gato',
    point: 'adjetivo',
  },
  {
    line: 'Me>me_gusta=jeg gusta>me_gusta=liker el café>el_café .',
    no: 'Jeg liker kaffe.',
    level: 2,
    pic: 'cafe',
    point: 'gustar',
  },
  {
    line: 'Hoy como>comer en casa>la_casa .',
    also: ['Como>comer en casa>la_casa hoy .'],
    no: 'I dag spiser jeg hjemme.',
    level: 2,
    pic: 'mesa',
    point: 'tiempo',
  },
  {
    line: '¿ Te gusta>gustar el queso>el_queso ?',
    no: 'Liker du ost?',
    level: 2,
    pic: 'mesa',
    point: 'gustar',
  },
  {
    line: 'Me gustan>gustar los gatos>el_gato .',
    no: 'Jeg liker katter.',
    level: 2,
    pic: 'gato',
    point: 'gustan',
  },
  {
    line: 'No tengo>tener tiempo>el_tiempo hoy .',
    also: ['Hoy no tengo>tener tiempo>el_tiempo .'],
    no: 'Jeg har ikke tid i dag.',
    level: 2,
    pic: 'reloj',
    point: 'negacion',
  },
  {
    line: 'Hoy hace>hacer buen>bueno tiempo>el_tiempo .',
    also: ['Hace>hacer buen>bueno tiempo>el_tiempo hoy .'],
    no: 'I dag er det fint vær.',
    level: 2,
    pic: 'sol',
    point: 'buen',
  },
  {
    line: 'El agua>el_agua está>estar fría>frío .',
    no: 'Vannet er kaldt.',
    level: 2,
    pic: 'mar',
    point: 'agua',
  },
  {
    line: 'Voy>ir a comer ahora .',
    also: ['Ahora voy>ir a comer .'],
    no: 'Jeg skal spise nå.',
    level: 2,
    pic: 'mesa',
    point: 'ira',
  },
  {
    line: '¿ Está>estar lejos el museo>el_museo ?',
    also: ['¿ El museo>el_museo está>estar lejos ?'],
    no: 'Er museet langt unna?',
    level: 2,
    pic: 'iglesia',
    point: 'si',
  },
  {
    line: '¿ Dónde vive>vivir tu hermana>la_hermana ?',
    no: 'Hvor bor søstera di?',
    level: 2,
    pic: 'casa',
    point: 'pregunta',
  },
  {
    line: '¿ Por_qué>por_qué no vienes>venir mañana ?',
    no: 'Hvorfor kommer du ikke i morgen?',
    level: 2,
    pic: 'sol',
    point: 'negacion',
  },
  {
    line: 'Esta>este noche>la_noche no salgo>salir .',
    also: ['No salgo>salir esta>este noche>la_noche .'],
    no: 'I kveld går jeg ikke ut.',
    level: 2,
    pic: 'luna',
    point: 'negacion',
  },
  {
    line: 'La estación>la_estación está>estar a_la_derecha .',
    no: 'Stasjonen ligger til høyre.',
    level: 2,
    pic: 'tren',
    point: 'estar',
  },
  {
    line: 'Los gatos>el_gato duermen>dormir mucho .',
    no: 'Katter sover mye.',
    level: 2,
    pic: 'gato',
    point: 'general',
  },

  // --- Five and six words ---
  {
    line: 'No me>me_gusta=jeg gusta>me_gusta=liker la lluvia>la_lluvia .',
    no: 'Jeg liker ikke regn.',
    level: 3,
    pic: 'lluvia',
    point: 'nome',
  },
  {
    line: 'Mi casa>la_casa es>ser muy pequeña>pequeño .',
    no: 'Huset mitt er veldig lite.',
    level: 3,
    pic: 'casa',
    point: 'posesivo',
  },
  {
    line: 'Quiero>querer un café>el_café con leche>la_leche .',
    no: 'Jeg vil ha en kaffe med melk.',
    level: 3,
    pic: 'cafe',
    point: 'sujeto',
  },
  {
    line: '¿ Cómo se llama>llamarse tu perro>el_perro ?',
    no: 'Hva heter hunden din?',
    level: 3,
    pic: 'perro',
    point: 'llamarse',
  },
  {
    line: 'Mañana voy>ir a la playa>la_playa .',
    also: ['Voy>ir a la playa>la_playa mañana .'],
    no: 'I morgen drar jeg til stranda.',
    level: 3,
    pic: 'mar',
    point: 'tiempo',
  },
  {
    line: 'Hay un gato>el_gato en la cama>la_cama .',
    also: ['En la cama>la_cama hay un gato>el_gato .'],
    no: 'Det ligger en katt i senga.',
    level: 3,
    pic: 'gato',
    point: 'hay',
  },
  {
    line: 'No hay nadie en casa>la_casa .',
    also: ['En casa>la_casa no hay nadie .'],
    no: 'Det er ingen hjemme.',
    level: 3,
    pic: 'casa',
    point: 'doble',
  },
  {
    line: 'El sábado>el_sábado vamos>ir al museo>el_museo .',
    also: [
      'Vamos>ir al museo>el_museo el sábado>el_sábado .',
      'Vamos>ir el sábado>el_sábado al museo>el_museo .',
    ],
    no: 'På lørdag går vi på museet.',
    level: 3,
    pic: 'iglesia',
    point: 'dias',
  },
  {
    line: '¿ A qué hora>la_hora llega>llegar el tren>el_tren ?',
    no: 'Når kommer toget?',
    level: 3,
    pic: 'tren',
    point: 'prep',
  },
  {
    line: 'El tren>el_tren sale>salir a las ocho .',
    no: 'Toget går klokka åtte.',
    level: 3,
    pic: 'reloj',
    point: 'hora',
  },
  {
    line: 'Mi padre>el_padre tiene>tener un coche>el_coche rojo .',
    no: 'Faren min har en rød bil.',
    level: 3,
    pic: 'coche',
    point: 'adjetivo',
  },
  {
    line: 'Por la mañana>la_mañana bebo>beber un café>el_café .',
    also: ['Bebo>beber un café>el_café por la mañana>la_mañana .'],
    no: 'Om morgenen drikker jeg en kaffe.',
    level: 3,
    pic: 'cafe',
    point: 'tiempo',
  },
  {
    line: 'Por la noche>la_noche veo>ver la televisión>la_televisión .',
    also: ['Veo>ver la televisión>la_televisión por la noche>la_noche .'],
    no: 'Om kvelden ser jeg på TV.',
    level: 3,
    pic: 'luna',
    point: 'sinprep',
  },
  {
    line: 'Te espero>esperar en la estación>la_estación .',
    no: 'Jeg venter på deg på stasjonen.',
    level: 3,
    pic: 'tren',
    point: 'pronombre',
  },
  {
    line: 'En verano>el_verano hace>hacer mucho calor>el_calor .',
    also: ['Hace>hacer mucho calor>el_calor en verano>el_verano .'],
    no: 'Om sommeren er det veldig varmt.',
    level: 3,
    pic: 'sol',
    point: 'hacer',
  },
  {
    line: '¿ Tienen>tener una mesa>la_mesa para dos ?',
    no: 'Har dere et bord til to?',
    level: 3,
    pic: 'mesa',
    point: 'si',
  },
  {
    line: '¿ Quieres>querer un vaso>el_vaso de agua>el_agua ?',
    no: 'Vil du ha et glass vann?',
    level: 3,
    pic: 'mesa',
    point: 'cantidad',
  },
  {
    line: 'Los sábados>el_sábado no trabajo>trabajar nunca .',
    also: ['No trabajo>trabajar nunca los sábados>el_sábado .'],
    no: 'Jeg jobber aldri på lørdager.',
    level: 3,
    pic: 'sol',
    point: 'nunca',
  },
  {
    line: 'No son>ser gigantes>el_gigante , son>ser molinos>el_molino .',
    also: ['Son>ser molinos>el_molino , no son>ser gigantes>el_gigante .'],
    no: 'Det er ikke kjemper, det er møller.',
    level: 3,
    pic: 'molino',
    point: 'det',
  },
  {
    line: '^Sancho tiene>tener un burro>el_burro gris .',
    no: 'Sancho har et grått esel.',
    level: 3,
    pic: 'molino',
    point: 'adjetivo',
  },

  // --- Seven and eight words ---
  {
    line: 'Hay una iglesia>la_iglesia blanca>blanco en el pueblo>el_pueblo .',
    also: ['En el pueblo>el_pueblo hay una iglesia>la_iglesia blanca>blanco .'],
    no: 'Det er en hvit kirke i landsbyen.',
    level: 4,
    pic: 'iglesia',
    point: 'adjetivo',
  },
  {
    line: 'El perro>el_perro de mi vecino>el_vecino es>ser enorme .',
    no: 'Naboens hund er kjempestor.',
    level: 4,
    pic: 'perro',
    point: 'de',
  },
  {
    line: 'La luna>la_luna está>estar muy bonita>bonito esta>este noche>la_noche .',
    also: [
      'Esta>este noche>la_noche la luna>la_luna está>estar muy bonita>bonito .',
    ],
    no: 'Månen er veldig fin i kveld.',
    level: 4,
    pic: 'luna',
    point: 'tiempo',
  },
  {
    line: 'No me gustan>gustar nada los lunes>el_lunes .',
    no: 'Jeg liker ikke mandager i det hele tatt.',
    level: 4,
    pic: 'lluvia',
    point: 'doble',
  },
  {
    line: 'Los domingos>el_domingo veo>ver a mi madre>la_madre .',
    also: ['Veo>ver a mi madre>la_madre los domingos>el_domingo .'],
    no: 'På søndager treffer jeg mora mi.',
    level: 4,
    pic: 'casa',
    point: 'persona',
  },
  {
    line: 'Mi abuela>la_abuela vive>vivir en una casa>la_casa azul .',
    no: 'Bestemora mi bor i et blått hus.',
    level: 4,
    pic: 'casa',
    point: 'adjetivo',
  },
  {
    line: 'Mañana vamos>ir a la playa>la_playa con los niños>el_niño .',
    also: [
      'Vamos>ir a la playa>la_playa mañana con los niños>el_niño .',
      'Vamos>ir a la playa>la_playa con los niños>el_niño mañana .',
    ],
    no: 'I morgen drar vi til stranda med barna.',
    level: 4,
    pic: 'mar',
    point: 'tiempo',
  },
  {
    line: 'El café>el_café de este bar>el_bar es>ser muy bueno .',
    no: 'Kaffen på denne baren er veldig god.',
    level: 4,
    pic: 'cafe',
    point: 'de',
  },
  {
    line: 'El hotel>el_hotel está>estar cerca de la playa>la_playa .',
    no: 'Hotellet ligger nær stranda.',
    level: 4,
    pic: 'mar',
    point: 'estar',
  },
  {
    line: 'El caballo>el_caballo de ^Don_Quijote es>ser muy flaco .',
    no: 'Hesten til Don Quijote er veldig mager.',
    level: 4,
    pic: 'molino',
    point: 'de',
  },
  {
    line: 'Nunca bebo>beber vino>el_vino por la noche>la_noche .',
    also: ['Por la noche>la_noche nunca bebo>beber vino>el_vino .'],
    no: 'Jeg drikker aldri vin om kvelden.',
    level: 4,
    pic: 'luna',
    point: 'nunca',
  },
]
