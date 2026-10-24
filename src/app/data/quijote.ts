// Don Quijote, told simply: the start of the novel and the windmills, in
// five short chapters. Each line is mixed text (lib/text.ts): every word in
// Spanish, with the Norwegian over it until the reader knows it.
//
// The markup, token by token, separated by spaces:
//   word              a word in the bank, as written there
//   form>id           a form of a word in the bank: dice>decir
//   …=gloss           the Norwegian for it here: dice>decir=sier
//   …#key             a note on it here, from the text's notes (only in
//                     the library's texts, data/biblioteca.ts)
//   ^Name             a name, shown as it is
//   _                 a space inside a token: el_campo, Don_Quijote
//   , . ; : ! ? ¡ ¿ « » …   punctuation, set against its neighbours
//   —  ~              a dash that opens a speech or a narration, and one
//                     that closes the narration: —dice Sancho—.
// The Spanish and the novel's chapters are retold, not quoted, except the
// first line of the book. The other stories (data/stories.ts) are written
// the same way.

import type { Chapter } from './stories.ts'

// The novel's first line, as the home page shows it
export const EPIGRAPH = {
  es: 'En un lugar de la Mancha, de cuyo nombre no quiero acordarme…',
  line: 'En=i un_lugar>el_lugar=et_sted de=i ^la_Mancha , de=av cuyo=hvis nombre>el_nombre=navn no=ikke quiero>querer=vil_jeg acordarme>acordarse=huske …',
}

export const CHAPTERS: Array<Chapter> = [
  {
    id: 'hidalgo',
    title: 'Un hidalgo de la Mancha',
    no: 'En adelsmann fra La Mancha',
    from: 'kapittel 1',
    lines: [
      'En=i un_lugar>el_lugar=et_sted de=i ^la_Mancha vive>vivir=bor un_hidalgo>el_hidalgo=en_lavadelsmann .',
      'Tiene>tener=har cincuenta años>el_año=år .',
      'Es>ser=er muy delgado=tynn y tiene>tener=har un_caballo>el_caballo=en_hest flaco=mager .',
      'Por=om la_noche=natta y por=om el_día=dagen , el_hidalgo=adelsmannen lee>leer=leser libros>el_libro=bøker .',
      'Lee>leer=leser libros>el_libro=bøker de=om caballeros>el_caballero=riddere : de=om gigantes>el_gigante=kjemper , de=om castillos>el_castillo=slott y de=om batallas>la_batalla=slag .',
      'Lee>leer=leser tanto que=at no duerme>dormir=sover .',
      'Un_día>el_día=en_dag , el_hidalgo=adelsmannen pierde>perder=mister la_cabeza=hodet .',
      '— ¡ Voy_a>ir=jeg_skal ser=være caballero>el_caballero=ridder ! — dice>decir=sier .',
      '— Voy_a>ir=jeg_skal buscar aventuras>la_aventura=eventyr por=rundt_i el_mundo=verden .',
      'Su=hans nombre>el_nombre=navn nuevo=nye es>ser=er ^Don_Quijote_de_la_Mancha .',
    ],
    questions: [
      {
        q: 'Hva leser adelsmannen?',
        a: ['Bøker om riddere', 'Brev fra familien', 'Aviser fra Madrid'],
      },
      {
        q: 'Hvorfor mister han hodet?',
        a: [
          'Han leser så mye at han ikke sover',
          'Hesten hans dør',
          'Han blir forelsket',
        ],
      },
      { q: 'Hva vil han bli?', a: ['Ridder', 'Konge', 'Prest'] },
    ],
  },
  {
    id: 'dulcinea',
    title: 'Rocinante y Dulcinea',
    no: 'Rocinante og Dulcinea',
    from: 'kapittel 1 og 2',
    lines: [
      '^Don_Quijote busca>buscar=leter_etter la_armadura=rustningen vieja>viejo=gamle de=til su=sin familia>la_familia=familie .',
      'Con=med cartón>el_cartón=papp , hace>hacer=lager un_yelmo>el_yelmo=en_hjelm .',
      'Su=hans caballo>el_caballo=hest es>ser=er flaco=mager y viejo=gammel , pero para=for él=ham es>ser=er magnífico=storartet .',
      'Y su=hans caballo>el_caballo=hest tiene>tener=får un_nombre>el_nombre=et_navn nuevo=nytt : ^Rocinante .',
      'Un_caballero>el_caballero=en_ridder necesita>necesitar=trenger también una_dama>la_dama=en_dame .',
      'Cerca_de>cerca=nær su=hans pueblo>el_pueblo=landsby vive>vivir=bor una_mujer>la_mujer=en_kvinne del=fra campo>el_campo=landet .',
      'Se_llama>llamarse=hun_heter ^Aldonza , pero ^Don_Quijote la>lo=henne llama>llamar=kaller ^Dulcinea_del_Toboso .',
      'Ella no sabe>saber=vet nada .',
      'Una_mañana>la_mañana=en_morgen de=om verano>el_verano=sommeren , ^Don_Quijote sale>salir=drar de=fra casa>la_casa=hjemmet .',
      'Nadie lo=ham ve>ver=ser .',
    ],
    questions: [
      {
        q: 'Hva lager Don Quijote av papp?',
        a: ['En hjelm', 'Et skjold', 'Et sverd'],
      },
      { q: 'Hva heter hesten?', a: ['Rocinante', 'Dulcinea', 'Sancho'] },
      {
        q: 'Hvem er Dulcinea egentlig?',
        a: ['Aldonza, en kvinne fra landet', 'En dronning', 'Søsteren hans'],
      },
    ],
  },
  {
    id: 'venta',
    title: 'La venta',
    no: 'Vertshuset',
    from: 'kapittel 2 og 3',
    lines: [
      '^Don_Quijote va>ir=drar por=gjennom el_campo=landskapet todo_el_día>el_día=hele_dagen .',
      'Por_la_tarde>la_tarde=om_kvelden , tiene>tener=har mucha>mucho=mye hambre>el_hambre=sult y ve>ver=ser una_venta>la_venta=et_vertshus .',
      'Pero él no ve>ver=ser una_venta>la_venta=et_vertshus : ve>ver=ser un_castillo>el_castillo=et_slott enorme=enormt .',
      'El_ventero=vertshusverten es>ser=er un_hombre>el_hombre=en_mann gordo=tykk y simpático=hyggelig .',
      '^Don_Quijote le=til_ham dice>decir=sier : — Señor>el_señor=herre del=av castillo>el_castillo=slottet , quiero>querer=jeg_vil ser=bli caballero>el_caballero=ridder .',
      'El_ventero=vertshusverten piensa>pensar=tenker : « Este=denne hombre>el_hombre=mannen está>estar=er loco=gal » .',
      'Por_la_noche>la_noche=om_natta , ^Don_Quijote no duerme>dormir=sover : mira>mirar=ser_på su=sin armadura>la_armadura=rustning .',
      'Al_final>al_final=til_slutt , el_ventero=vertshusverten lo=ham hace>hacer=gjør caballero>el_caballero=ridder con una_espada>la_espada=et_sverd .',
      '— ¡ Ahora soy>ser=er_jeg caballero>el_caballero=ridder ! — dice>decir=sier ^Don_Quijote , muy contento=fornøyd .',
      'Y vuelve>volver=drar_tilbake a su=sin pueblo>el_pueblo=landsby para=for_å buscar=finne un_escudero>el_escudero=en_væpner .',
    ],
    questions: [
      {
        q: 'Hva ser Don Quijote når han ser vertshuset?',
        a: ['Et slott', 'En kirke', 'Et marked'],
      },
      {
        q: 'Hva tenker vertshusverten om ham?',
        a: ['At han er gal', 'At han er en konge', 'At han er rik'],
      },
      {
        q: 'Hva gjør Don Quijote om natta?',
        a: ['Han ser på rustningen sin', 'Han sover', 'Han spiser'],
      },
    ],
  },
  {
    id: 'sancho',
    title: 'Sancho Panza',
    no: 'Sancho Panza',
    from: 'kapittel 7',
    lines: [
      'En=i su=hans pueblo>el_pueblo=landsby vive>vivir=bor ^Sancho_Panza , un_vecino>el_vecino=en_nabo bajo=lav y gordo=tykk .',
      '^Sancho es>ser=er pobre=fattig , pero es>ser=er un_hombre>el_hombre=en_mann bueno=god .',
      '^Don_Quijote le=til_ham dice>decir=sier : — ^Sancho , ¿ quieres>querer=vil_du ser=være mi escudero>el_escudero=væpner ?',
      '— Un_día>el_día=en_dag vas_a>ir=skal_du tener=ha una_ínsula>la_ínsula=en_øy .',
      '^Sancho no sabe>saber=vet muy bien=godt qué es>ser=er una_ínsula>la_ínsula=en_øy , pero quiere>querer=vil_ha una>uno=en .',
      'Una_noche>la_noche=en_natt , los_dos>dos=de_to salen>salir=drar del=fra pueblo>el_pueblo=landsbyen .',
      '^Don_Quijote va>ir=drar en=på ^Rocinante , y ^Sancho va>ir=drar en=på su=sitt burro>el_burro=esel .',
      '^Sancho lleva>llevar=har_med comida>la_comida=mat y vino>el_vino=vin .',
      '— ¿ Dónde está>estar=er mi ínsula>la_ínsula=øy , señor>el_señor=herre ? — pregunta>preguntar=spør ^Sancho .',
      '— Pronto=snart , ^Sancho , pronto=snart — dice>decir=sier ^Don_Quijote .',
    ],
    questions: [
      {
        q: 'Hva lover Don Quijote Sancho?',
        a: ['En øy', 'En hest', 'Et slott'],
      },
      {
        q: 'Hva rir Sancho på?',
        a: ['Et esel', 'En hest', 'Ingenting, han går'],
      },
      {
        q: 'Hva har Sancho med seg?',
        a: ['Mat og vin', 'Bøker', 'Et sverd'],
      },
    ],
  },
  {
    id: 'molinos',
    title: 'Los molinos de viento',
    no: 'Vindmøllene',
    from: 'kapittel 8',
    lines: [
      '^Don_Quijote y ^Sancho van>ir=drar por=gjennom el_campo=landskapet .',
      'De_pronto>de_pronto=plutselig , ^Don_Quijote ve>ver=ser treinta molinos_de_viento>el_molino_de_viento=vindmøller .',
      '— ¡ Mira>mirar=se , ^Sancho ! Allí hay=er_det treinta gigantes>el_gigante=kjemper enormes>enorme=enorme .',
      '— ¿ Qué=hvilke gigantes>el_gigante=kjemper ? — dice>decir=sier ^Sancho ~ . Son>ser=det_er molinos>el_molino=møller , señor>el_señor=herre .',
      '— Tú no sabes>saber=vet nada de=om aventuras>la_aventura=eventyr — dice>decir=sier ^Don_Quijote .',
      '^Don_Quijote corre>correr=løper con su=sin lanza>la_lanza=lanse hacia el_primer_molino>el_molino=den_første_mølla .',
      'Entonces=da viene>venir=kommer un_poco_de>poco=litt viento>el_viento=vind , y los_brazos>el_brazo=armene del=på molino>el_molino=mølla se_mueven>moverse=beveger_seg .',
      'La_lanza=lansen se_rompe>romper=brekker , y ^Don_Quijote cae>caer=faller al=til suelo>el_suelo=bakken con ^Rocinante .',
      '— ¡ Son>ser=det_er molinos>el_molino=møller , señor>el_señor=herre ! — dice>decir=sier ^Sancho .',
      '— Un_mago>el_mago=en_trollmann convierte>convertir=forvandler los_gigantes>el_gigante=kjempene en=til molinos>el_molino=møller — dice>decir=sier ^Don_Quijote ~ . Pero yo voy_a>ir=skal ganar=vinne .',
    ],
    questions: [
      {
        q: 'Hva tror Don Quijote at vindmøllene er?',
        a: ['Kjemper', 'Slott', 'Riddere'],
      },
      {
        q: 'Hva skjer med lansen?',
        a: ['Den brekker', 'Den forsvinner', 'Sancho tar den'],
      },
      {
        q: 'Hvem sier Don Quijote har forvandlet kjempene?',
        a: ['En trollmann', 'Sancho', 'Vinden'],
      },
    ],
  },
]
