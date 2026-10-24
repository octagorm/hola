// The audiobooks: a podcast of fifteen to twenty minutes, written for one
// reader's words (those known and being practised, and a few new), to
// listen to without the screen or to follow on it (games/lydbok.tsx). Two
// hosts tell a story in Spain's Spanish together: Marta, from Madrid, who
// has lived long in Oslo, and Ingrid, a Norwegian learning Spanish. They
// talk in both languages, as Tian's hosts do, giving the new words before
// a scene and picking out phrases after it; the scenes are read slowly by
// the narrator, the story's people in the cast's voices (data/voices.ts).
//
// The story's lines are written in the markup of the stories
// (data/quijote.ts), so that the text on the page is mixed text and every
// word is in the bank.
// scripts/lydbok.py puts each book's recordings together, with pauses,
// into one file (public/lydbok/), and notes in data/lydbok-times.json when
// each line begins, for the page to follow.

import { plain } from '../lib/text.ts'
import { LINE_VOICE } from './voices.ts'

// A part of a chapter: the hosts' talk, free text in Norwegian and Spanish
// as they speak it; or a line of the story, in the stories' markup, read by
// the narrator (no who) or one of the cast
export type Part =
  { host: 'Marta' | 'Ingrid'; text: string } | { line: string; who?: string }

export interface BookChapter {
  title: string
  no: string
  parts: Array<Part>
}

export interface Audiobook {
  // Its page: /#lydbok/<id>
  id: string
  es: string
  no: string
  // On its page, in Norwegian
  about: string
  // Whose words it was written from, and when: «ordene alle starter med»
  for: string
  // The day it went out, its date in the podcast feed (lib/podcast.ts)
  date: string
  chapters: Array<BookChapter>
}

// The pauses in an audiobook, in seconds: after a host's line, after a
// line of the story, and between chapters
export const PAUSE = { host: 0.5, line: 0.9, chapter: 2.2 }

// What a part says, as the recording has it
export const spokenText = (p: Part) => ('host' in p ? p.text : plain(p.line))

// Who says a part
export const voiceOf = (p: Part) =>
  'host' in p ? p.host : (p.who ?? LINE_VOICE)

// Una semana en Altea: who speaks in the story, by the voice they speak
// in. Berit is the teacher's voice, so that what she says is clear enough
// to say after her.
const ALTEA: Record<string, string> = {
  Berit: 'Profesora',
  Maribel: 'Remei',
  Vicente: 'Julián',
  Conductor: 'Manolo',
  Pepa: 'Rosa',
  Señora: 'Lucía',
  Amparo: 'Montse',
  Señor: 'Narcís',
  Elena: 'Laia',
}

// A chapter's parts written as in a play: a row that begins with a host's
// name and a colon ('Marta: …') is the host's talk; one that begins with a
// name of the cast ('Berit: — Hola .') a line of the story in that voice;
// any other row a line of the narrator's
function scene(cast: Record<string, string>, rows: Array<string>): Array<Part> {
  return rows.map((row): Part => {
    const m = /^(\p{Lu}\p{Ll}+): (.+)$/u.exec(row)
    if (m && (m[1] === 'Marta' || m[1] === 'Ingrid'))
      return { host: m[1], text: m[2] }
    if (m && cast[m[1]]) return { line: m[2], who: cast[m[1]] }
    return { line: row }
  })
}

export const AUDIOBOOKS: Array<Audiobook> = [
  {
    id: 'altea',
    es: 'Una semana en Altea',
    no: 'En uke i Altea',
    about:
      'Marta og Ingrid følger Berit fra Hamar, som bor en uke alene i en liten leilighet i Altea, en hvit by ved havet sør i Spania. Hun tar bussen, handler på markedet, drikker kaffe på baren, finner apoteket og blir kjent med naboen, og Marta og Ingrid plukker ut setningene du kan bruke selv.',
    for: 'ordene alle starter med i Hola, oktober 2026',
    date: '2026-10-24',
    chapters: [
      {
        title: 'Un piso en Altea',
        no: 'En leilighet i Altea',
        parts: scene(ALTEA, [
          'Marta: ¡Hola! Velkommen til en liten lydbok fra Hola. Jeg heter Marta. Jeg er fra Madrid, men jeg har bodd i Oslo i mange år.',
          'Ingrid: Og jeg er Ingrid. Jeg lærer spansk, akkurat som deg, så jeg spør om det du kanskje lurer på.',
          'Marta: I dag følger vi Berit fra Hamar. Hun skal bo en uke i Altea, en hvit by ved havet, ikke langt fra Alicante.',
          'Ingrid: Helt alene? Det er modig.',
          'Marta: Sola, alene. Først skal hun ta bussen. Hør etter la parada, holdeplassen, la tarjeta, kortet, og el euro, euro.',
          'Marta: Claro betyr selvfølgelig, og det hører du hele tiden i Spania. Til slutt: el piso er en leilighet, og segundo betyr andre. Vamos.',
          '^Berit es>ser=er una_señora>la_señora=en_dame de=fra ^Hamar , en=i ^Noruega .',
          'Hoy=i_dag llega>llegar=kommer_hun a=til ^España , sola>solo=alene , para=for una_semana>la_semana=ei_uke .',
          'Su=hennes marido>el_marido=mann , ^Per , está>estar=er en_casa>la_casa=hjemme con=med el_gato=katten .',
          'En=i ^Alicante , ^Berit va>ir=går a=til la_estación=stasjonen de=for autobuses>el_autobús=busser .',
          'Berit: — Buenos_días=god_morgen . ¿ Este=denne autobús>el_autobús=bussen va>ir=går a=til ^Altea ?',
          'Conductor: — Sí=ja , señora>la_señora=frue . ¿ Un_billete>el_billete=en_billett ?',
          'Berit: — Sí=ja , un_billete>el_billete=en_billett , por_favor=takk . ¿ Cuánto=hvor_mye es>ser=blir_det ?',
          'Conductor: — Cinco=fem euros>el_euro=euro .',
          'Berit: — ¿ Puedo>poder=kan_jeg pagar=betale con=med tarjeta>la_tarjeta=kort ?',
          'Conductor: — Claro=selvfølgelig .',
          'El_autobús=bussen sale>salir=går . Por=gjennom la_ventana=vinduet , ^Berit ve>ver=ser el_mar=havet , azul=blått y grande=stort .',
          '^Berit está>estar=er cansada>cansado=trøtt , y duerme>dormir=sover un_poco>poco=litt .',
          'Conductor: — ¡ Señora>la_señora=frue ! ¡ Señora>la_señora=frue ! ¡ Esto=dette es>ser=er ^Altea !',
          'En=på la_parada=holdeplassen espera>esperar=venter un_señor>el_señor=en_herre mayor=eldre . Es>ser=det_er ^Vicente , y esta>este=denne semana>la_semana=uka , su=hans piso>el_piso=leilighet es>ser=er para=til ^Berit .',
          'Vicente: — Buenas_tardes=god_ettermiddag . ¿ Es>ser=er usted=De ^Berit ? Yo=jeg soy>ser=er ^Vicente .',
          'Berit: — Sí=ja , soy>ser=jeg_er ^Berit . Mucho_gusto=hyggelig_å_treffe_Dem .',
          'Vicente: — Aquí=her está>estar=er la_cocina=kjøkkenet , y aquí=her , el_baño=badet .',
          '^Berit abre>abrir=åpner la_ventana=vinduet , y allí=der está>estar=er el_mar=havet .',
          'Berit: — ¡ Qué=så bonito=fint !',
          'Vicente: — Y esta>este=her es>ser=er la_llave=nøkkelen . Su=Deres piso>el_piso=leilighet es>ser=er el_segundo>segundo=andre ^B .',
          'Berit: — Muchas_gracias=tusen_takk , ^Vicente .',
          'Ingrid: Det første Berit sier på bussen, kan jeg bruke selv: ¿Este autobús va a Altea?',
          'Marta: Ja, og du kan bytte ut navnet: ¿Este autobús va a Alicante? Si quieres, dilo tú: ¿Este autobús va a Altea?',
        ]),
      },
      {
        title: 'La puerta A',
        no: 'Feil dør',
        parts: scene(ALTEA, [
          'Marta: Berit har vært på stranden, og nå er hun trøtt. Hør etter subir, å gå opp, og al, til den: al segundo piso, til andre etasje.',
          'Ingrid: Og naboen, hva heter det?',
          'Marta: El vecino, og en kvinne er la vecina. Du hører også la verdad, sannheten, og ¿verdad?, som betyr ikke sant?',
          'Marta: Og så tre ord til: reírse er å le, el español er spansk, og despacio er sakte.',
          'A_las_ocho>ocho=klokka_åtte , ^Berit vuelve>volver=kommer_tilbake a_casa>la_casa=hjem . Sube>subir=hun_går_opp al=til segundo>segundo=andre piso>el_piso=etasje .',
          'Allí=der hay>hay=er_det dos=to puertas>la_puerta=dører : la=den ^A y la=den ^B .',
          '^Berit está>estar=er muy=veldig cansada>cansado=trøtt . Va>ir=hun_går a=til la_puerta=døra ^A , pero la_llave=nøkkelen no=ikke abre>abrir=åpner .',
          'Una_señora>la_señora=en_dame abre>abrir=åpner la_puerta=døra , con=med un_perro>el_perro=en_hund enorme=diger .',
          'Maribel: — ¿ Sí=ja ? ¿ Qué=hva quiere>querer=vil_De ?',
          'Berit: — Perdón=unnskyld … pero este=dette es>ser=er mi=min piso>el_piso=leilighet , ¿ no=ikke_sant ?',
          'Maribel: — ¡ No=nei , mujer>la_mujer=kjære_deg ! Este=dette es>ser=er el_segundo>segundo=andre ^A . Usted=De vive>vivir=bor en=i el_segundo>segundo=andre ^B .',
          'Maribel: — Usted=De es>ser=er la_señora>la_señora=damen de=fra ^Noruega , ¿ verdad>la_verdad=ikke_sant ?',
          '¡ Es>ser=det_er verdad>la_verdad=sant ! Es>ser=det_er la_puerta=døra ^A . ^Berit está>estar=blir muy=veldig roja>rojo=rød .',
          'Berit: — ¡ Lo_siento=beklager , señora>la_señora=frue ! ¡ Lo_siento=beklager mucho=så_mye !',
          'La_señora=damen se_ríe>reírse=ler .',
          'Maribel: — ¡ No=det es>ser=er nada=ingenting ! Yo=jeg soy>ser=er ^Maribel , su=Deres vecina>el_vecino=nabo . Y este=dette es>ser=er ^Coco .',
          'Maribel: — ¿ Habla>hablar=snakker_De español>el_español=spansk ?',
          'Berit: — Un_poco>poco=litt . ¿ Puede>poder=kan_De hablar=snakke más=mer despacio=sakte , por_favor=er_De_snill ?',
          'Maribel: — Claro=selvfølgelig . Y háblame>hablar=si de_tú>tú=du_til_meg , por_favor=er_du_snill . ¡ Somos>ser=vi_er vecinas>el_vecino=naboer !',
          'Maribel: — Mañana=i_morgen es>ser=er martes>el_martes=tirsdag , y los_martes>el_martes=om_tirsdagen hay>hay=er_det mercado>el_mercado=marked en=i ^Altea . ¿ Vamos>ir=skal_vi_gå las_dos>dos=sammen ?',
          'Berit: — ¡ Sí=ja ! ¿ A_qué_hora>la_hora=når ?',
          'Maribel: — A_las_diez>diez=klokka_ti . ¡ Hasta_mañana=vi_ses_i_morgen , vecina>el_vecino=nabo !',
          'Marta: Lo siento betyr beklager. Og når du ikke forstår: ¿Puede hablar más despacio, por favor? Si quieres, dilo tú.',
          'Ingrid: ¿Puede hablar más despacio, por favor?',
          'Marta: Perfecto. Og hørte du háblame de tú? Maribel vil at de skal si du til hverandre. Med naboer går det fort i Spania.',
        ]),
      },
      {
        title: '¿Quién es el último?',
        no: 'På markedet',
        parts: scene(ALTEA, [
          'Marta: I Altea er det marked hver tirsdag. Hør etter la gente, folk, el kilo, kilo, og medio, halv: medio kilo.',
          'Ingrid: Hvordan står man i kø på et marked uten kølapper?',
          'Marta: Det får du høre. Og selgeren spør: ¿Qué le pongo?, hva skal det være? Og etterpå: ¿Algo más?, noe mer? La bolsa er en pose.',
          'El_martes=tirsdag , ^Berit y ^Maribel van>ir=går al=til mercado>el_mercado=markedet . ^Coco va>ir=går también=også .',
          'En=på el_mercado=markedet hay>hay=er_det de_todo>todo=alt_mulig : pan>el_pan=brød , queso>el_queso=ost , pescado>el_pescado=fisk , tomates>el_tomate=tomater , naranjas>la_naranja=appelsiner …',
          'Los_tomates>el_tomate=tomatene más=mest bonitos>bonito=fine son>ser=er de=til ^Pepa , pero allí=der hay>hay=er_det mucha>mucho=mye gente>la_gente=folk .',
          'Maribel: — Aquí=her , primero>primero=først , siempre=alltid : « ¿Quién_es_el_último?>¿quién_es_el_último?=Hvem_er_sist_i_køen? » .',
          'Berit: — ¿Quién_es_el_último?>¿quién_es_el_último?=Hvem_er_sist_i_køen?',
          'Señor: — Yo=jeg , señora>la_señora=frue .',
          'Llega>llegar=kommer una_mujer>la_mujer=ei_kvinne joven=ung , con=med un_niño>el_niño=et_barn .',
          'Señora: — ¿Quién_es_el_último?>¿quién_es_el_último?=Hvem_er_sist_i_køen?',
          'Berit: — ¡ Yo=jeg !',
          'Pepa: — ¡ Buenos_días=god_morgen , ^Maribel ! Buenos_días=god_morgen , señora>la_señora=frue . ¿ Qué=hva le_pongo>poner=skal_det_være ?',
          'Berit: — Un_kilo>el_kilo=en_kilo de=med tomates>el_tomate=tomater , por_favor=takk . Y medio=en_halv kilo>el_kilo=kilo de=med naranjas>la_naranja=appelsiner , para=til zumo>el_zumo=juice .',
          'Pepa: — ¿Algo_más?>¿algo_más?=Noe_mer?',
          'Berit: — No=nei , nada=ingenting más=mer , gracias=takk . ¿ Cuánto=hvor_mye es>ser=blir_det ?',
          'Pepa: — Son>ser=det_blir tres=tre euros>el_euro=euro con=og cincuenta=femti . ¿ Quiere>querer=vil_De_ha bolsa>la_bolsa=pose ?',
          'Berit: — No=nei , gracias=takk . Tengo>tener=jeg_har una=en .',
          'La_calle=gata sube>subir=går_oppover , y ^Berit está>estar=er cansada>cansado=sliten . ^Maribel , no=ikke : ¡ ella=hun sube>subir=går_opp muy=veldig rápido=fort !',
          'Ingrid: Så når jeg skal stille meg i kø, sier jeg: ¿Quién es el primero?',
          'Marta: Nesten, Ingrid! Du spør ikke hvem som er først, men hvem som er sist: ¿Quién es el último?',
          'Marta: Og når det er din tur: un kilo de tomates, por favor. Dilo tú.',
          'Marta: Bien. I morgen går Berit alene på bar, og der lærer hun kanskje den viktigste setningen i Spania.',
        ]),
      },
      {
        title: 'Un café con leche',
        no: 'Kaffe på baren',
        parts: scene(ALTEA, [
          'Marta: I Spania er en bar også en kafé. Der drikker man kaffe om morgenen. Hør etter la terraza, uteserveringen, la taza, en kopp, og la tostada, en skive ristet brød.',
          'Ingrid: Og el móvil er mobilen, regner jeg med.',
          'Marta: Riktig. Llamar betyr å ringe, og llover betyr å regne: llueve, det regner. Og del betyr om den: del gato, om katten.',
          'El_miércoles=onsdag , ^Berit va>ir=går sola>solo=alene al=til bar>el_bar=baren de=til ^Amparo , en=på la_plaza=torget .',
          'Hay>hay=det_er mesas>la_mesa=bord en=på la_terraza=uteserveringen , al=i sol>el_sol=sola .',
          'Amparo: — ¡ Buenos_días=god_morgen ! ¿ Qué=hva le_pongo>poner=skal_det_være ?',
          'Berit: — Buenos_días=god_morgen . ¿ Me_pone>poner=kan_jeg_få un=en café>el_café=kaffe con=med leche>la_leche=melk , por_favor=takk ?',
          'Amparo: — ¿ En=i taza>la_taza=kopp o=eller en=i vaso>el_vaso=glass ?',
          '^Amparo habla>hablar=snakker muy=veldig rápido=fort , y ^Berit no=ikke entiende>entender=forstår .',
          'Berit: — Perdón=unnskyld . ¿ Puede>poder=kan_De hablar=snakke más=mer despacio=sakte , por_favor=er_De_snill ?',
          'Amparo: — ¡ Claro=selvfølgelig ! ¿ En=i … taza>la_taza=kopp … o=eller en=i … vaso>el_vaso=glass ?',
          'Berit: — En=i taza>la_taza=kopp , por_favor=takk . Y una=en tostada>la_tostada=skive_ristet_brød con=med tomate>el_tomate=tomat y aceite>el_aceite=olje .',
          '^Per llama>llamar=ringer al=til móvil>el_móvil=mobilen de=til ^Berit . En=i ^Hamar llueve>llover=regner_det , y hace>hacer=er_det mucho=veldig frío>el_frío=kaldt .',
          '^Berit habla>hablar=snakker de=om la_lluvia=regnet y del=om gato>el_gato=katten … pero no=ikke habla>hablar=snakker del=om sol>el_sol=sola .',
          'Berit: — La_cuenta=regningen , por_favor=takk .',
          'Amparo: — Son>ser=det_blir tres=tre euros>el_euro=euro con=og cincuenta=femti .',
          'Berit: — Aquí_tiene>tener=vær_så_god .',
          'Amparo: — Muchas_gracias=tusen_takk . Usted=De es>ser=er la_vecina>el_vecino=naboen nueva>nuevo=nye de=til ^Maribel , ¿ verdad>la_verdad=ikke_sant ?',
          'Berit: — ¡ Sí=ja ! ¿ Cómo=hvordan lo_sabe>saber=vet_De_det ?',
          'Amparo: — ¡ Aquí=her , todo_el_pueblo>el_pueblo=hele_byen lo_sabe>saber=vet_det !',
          'Ingrid: Neste gang sier jeg: ¿Me pones un café con leche?',
          'Marta: Berit sier ¿me pone?, med usted. Det er litt høfligere, og alltid riktig.',
          'Ingrid: Og hvorfor spør hun om kopp eller glass?',
          'Marta: Mange spanjoler drikker kaffen i et lite glass, en vaso. Si quieres, dilo tú: ¿Me pone un café con leche, por favor?',
        ]),
      },
      {
        title: '¿Hay una farmacia cerca?',
        no: 'Hvor er apoteket?',
        parts: scene(ALTEA, [
          'Ingrid: Berit vil opp til kirken i Altea, og den ligger høyt oppe.',
          'Marta: Ja, kirken er hvit og har blå kupler, og gatene opp dit er bratte. Hør etter el sombrero, en hatt, og la ampolla, et gnagsår.',
          'Ingrid: Det høres ut som noe man trenger la farmacia til.',
          'Marta: Apoteket, ja. Du hører også la esquina, hjørnet, og la cruz, korset, for apotekene i Spania har et grønt kors. Og tanto betyr så mye, og la crema solar er solkrem.',
          'El_jueves=torsdag , ^Berit sube>subir=går_opp a=til la_iglesia=kirken de=i ^Altea . Es>ser=den_er blanca>blanco=hvit y azul=blå .',
          'Hace>hacer=det_er mucho=mye sol>el_sol=sol , y ^Berit no=ikke tiene>tener=har sombrero>el_sombrero=hatt .',
          'Por_la_tarde>la_tarde=om_ettermiddagen , ^Berit tiene>tener=har la_cara=ansiktet muy=veldig roja>rojo=rødt … ¡ y una_ampolla>la_ampolla=et_gnagsår en=på el_pie=foten !',
          'Necesita>necesitar=hun_trenger una_farmacia>la_farmacia=et_apotek . Pero , ¿ dónde=hvor está>estar=er la_farmacia=apoteket ?',
          'En=på la_plaza=torget , en=på un_banco>el_banco=en_benk , está>estar=sitter el_señor=herren del=fra mercado>el_mercado=markedet .',
          'Berit: — Perdón=unnskyld , señor>el_señor=herr . ¿ Hay>hay=er_det una_farmacia>la_farmacia=et_apotek cerca=i_nærheten ?',
          'Señor: — Sí=ja , señora>la_señora=frue . Todo_recto=rett_fram , y en=på la_esquina=hjørnet , a_la_derecha=til_høyre . Tiene>tener=det_har una_cruz>la_cruz=et_kors verde=grønt .',
          'Señor: — Y … ¡ un_sombrero>el_sombrero=en_hatt , señora>la_señora=frue ! ¡ Con=med este=denne sol>el_sol=sola !',
          '^Berit va>ir=går todo_recto=rett_fram . En=på la_esquina=hjørnet , a_la_derecha=til_høyre , hay>hay=er_det una_cruz>la_cruz=et_kors verde=grønt : ¡ la_farmacia=apoteket !',
          'Elena: — Buenas_tardes=god_ettermiddag . ¿ Qué=hva necesita>necesitar=trenger_De ?',
          'Berit: — Buenas_tardes=god_ettermiddag . Tengo>tener=jeg_har una_ampolla>la_ampolla=et_gnagsår en=på el_pie=foten .',
          'Elena: — Para=til la_ampolla=gnagsåret , esto=dette . ¿ Y la_cara=ansiktet ? ¡ Está>estar=det_er muy=veldig roja>rojo=rødt !',
          'Berit: — Sí=ja … En=i ^Noruega no=ikke hay>hay=er_det tanto=så_mye sol>el_sol=sol .',
          'Elena: — Necesita>necesitar=De_trenger crema_solar>la_crema_solar=solkrem . ¡ Y un_sombrero>el_sombrero=en_hatt !',
          '^Berit se_ríe>reírse=ler : ¡ en=i ^Altea , todos>todo=alle hablan>hablar=snakker de=om sombreros>el_sombrero=hatter !',
          'Y en=i una_tienda>la_tienda=en_butikk de=på la_plaza=torget , ^Berit compra>comprar=kjøper … ¡ dos=to sombreros>el_sombrero=hatter ! Uno=en para=til ella=henne , y uno=en para=til ^Per .',
          'Ingrid: Den vil jeg huske: ¿Hay una farmacia cerca?',
          'Marta: Den kan du bruke om alt mulig: ¿Hay un banco cerca? ¿Hay un bar cerca? Si quieres, dilo tú: ¿Hay una farmacia cerca?',
        ]),
      },
      {
        title: '¿A qué hora?',
        no: 'Når er middagen?',
        parts: scene(ALTEA, [
          'Marta: Nå kommer to ord som er veldig viktige i Spania: cenar, å spise middag om kvelden, og la cena, kveldsmåltidet.',
          'Ingrid: La sena.',
          'Marta: Nesten! Legg tunga mellom tennene, som en engelsk th: la cena. Cenar. Slik sier man det i Madrid.',
          'Ingrid: La cena. Cenar.',
          'Marta: Muy bien. Du hører også el regalo, en gave, ya, allerede, og ¡ay!, som betyr å.',
          'El_viernes=fredag , ^Maribel llama>llamar=banker a=på la_puerta=døra ^B .',
          'Maribel: — ¡ Hola=hei , ^Berit ! ¿ Quieres>querer=vil_du cenar=spise_middag en=i mi=mitt casa>la_casa=hus mañana=i_morgen ?',
          'Berit: — ¡ Sí=ja , muchas_gracias=tusen_takk ! ¿ A_qué_hora>la_hora=når ?',
          'Maribel: — ¡ A_la_hora>la_hora=når_det_er_tid de=for cenar=middag , claro=selvfølgelig !',
          'En=i ^Noruega , ^Berit come>comer=spiser_middag a_las_cinco>cinco=klokka_fem . ¿ Y en=i ^España ? ¿ A_las_seis>seis=klokka_seks ? ¿ A_las_siete>siete=klokka_sju ?',
          'El_sábado=lørdag , ^Berit compra>comprar=kjøper una_botella>la_botella=ei_flaske de=med vino>el_vino=vin de=fra ^Alicante : es>ser=det_er un_regalo>el_regalo=en_gave para=til ^Maribel .',
          'A_las_siete>siete=klokka_sju , ^Berit llama>llamar=banker a=på la_puerta=døra ^A .',
          'Abre>abrir=åpner ^Maribel , con=med ^Coco . En=på la_mesa=bordet no=ikke hay>hay=er_det platos>el_plato=tallerkener , y en=på la_cocina=kjøkkenet no=ikke hay>hay=er_det comida>la_comida=mat .',
          'Berit: — ¡ Hola=hei , ^Maribel ! Un_regalo>el_regalo=en_gave .',
          'Maribel: — ¡ ^Berit ! ¿ Ya=allerede ? ¡ Son>ser=klokka_er las_siete>siete=sju !',
          'Berit: — ¿ No=ikke es>ser=er la_hora=tiden de=for cenar=middag ?',
          '^Maribel se_ríe>reírse=ler mucho=mye .',
          'Maribel: — ¡ Ay>¡ay!=å , ^Berit ! En=i ^España cenamos>cenar=spiser_vi_middag a_las_diez>diez=klokka_ti … ¡ o=eller más_tarde>tarde=senere !',
          'Berit: — ¿ A_las_diez>diez=klokka_ti ? ¡ En=i ^Noruega , a_las_diez>diez=klokka_ti , yo=jeg ya=allerede duermo>dormir=sover !',
          'Las_dos>dos=de_to se_ríen>reírse=ler .',
          'Maribel: — Ahora=nå , vamos_a>ir=skal_vi tomar=ta algo=noe al=på bar>el_bar=baren de=til ^Amparo . Y a_las_diez>diez=klokka_ti , ¡ la_cena=middagen !',
          'Ingrid: Og vamos a tomar algo?',
          'Marta: Det betyr skal vi ta noe, et glass eller en kaffe. Den setningen er gull verdt. Si quieres, dilo tú: ¿Vamos a tomar algo?',
        ]),
      },
      {
        title: 'La cena es a las diez',
        no: 'Middag klokka ti',
        parts: scene(ALTEA, [
          'Marta: Det er lørdag kveld, og gatene er fulle av folk. Hør etter nadie, ingen, og la cebolla, løk.',
          'Marta: Du aner ikke hvor mye spanjoler krangler om løk i tortillaen! Og decir betyr å si: no dice nada, hun sier ingenting.',
          'Marta: Når Amparo snakker til dem begge, sier hun ¿qué tomáis?, hva vil dere ha. Det er vosotros, slik man sier dere i Spania.',
          'Las_dos>dos=de_to van>ir=går al=til bar>el_bar=baren de=til ^Amparo , con=med ^Coco .',
          'En=på la_terraza=uteserveringen hay>hay=er_det mucha>mucho=mye gente>la_gente=folk : familias>la_familia=familier , abuelos>el_abuelo=besteforeldre , niños>el_niño=barn y perros>el_perro=hunder .',
          'Amparo: — ¡ Hola=hei , vecinas>el_vecino=naboer ! ¿ Qué=hva tomáis>tomar=vil_dere_ha ?',
          'Maribel: — Dos=to vinos>el_vino=glass blancos>blanco=hvitvin , y unas>una=noen aceitunas>la_aceituna=oliven , por_favor=takk .',
          'A_las_nueve>nueve=klokka_ni , en=i la_calle=gata hay>hay=er_det mucha>mucho=mye gente>la_gente=folk … ¡ y nadie=ingen cena>cenar=spiser_middag !',
          'A_las_diez>diez=klokka_ti , en=i casa>la_casa=huset de=til ^Maribel , hay>hay=er_det una_tortilla>la_tortilla=en_omelett de=med patatas>la_patata=poteter , una_ensalada>la_ensalada=en_salat , pan>el_pan=brød y queso>el_queso=ost .',
          'Berit: — ¿ La_tortilla=omeletten tiene>tener=har cebolla>la_cebolla=løk ?',
          'Maribel: — ¡ Claro=selvfølgelig ! En=i esta>este=dette casa>la_casa=huset , la_tortilla=omeletten es>ser=er con=med cebolla>la_cebolla=løk .',
          'Berit: — ¡ Qué=så rica>rico=god está>estar=er la_tortilla=omeletten !',
          'Maribel: — Es>ser=det_er la_tortilla=omeletten de=til mi=min madre>la_madre=mor . ¿ Y el_piso=leiligheten ? ¿ Todo=alt bien=bra ?',
          'Berit: — Muy=veldig bien=bra . Y ^Vicente es>ser=er muy=veldig simpático=hyggelig .',
          '^Maribel se_ríe>reírse=ler , y no=ikke dice>decir=sier nada=noe .',
          'A_las_doce>doce=klokka_tolv , ^Berit vuelve>volver=går_tilbake a=til su=sin puerta>la_puerta=dør : la=den ^B , ¡ claro=selvfølgelig !',
          'Ingrid: Og ¡Qué rica está la tortilla! er fint å si til den som har laget maten.',
          'Marta: Det beste du kan si. Si quieres, dilo tú: ¡Qué rica está la tortilla!',
        ]),
      },
      {
        title: 'Hasta pronto',
        no: 'Vi ses snart',
        parts: scene(ALTEA, [
          'Ingrid: Siste dag allerede. Det gikk fort.',
          'Marta: Muy rápido. Berit skal hjem, og hun sier ha det til alle. Hør etter pronto, snart, og ¡hasta pronto!, vi ses snart.',
          'Marta: Og el conductor er sjåføren, mismo betyr samme, og pensar er å tenke.',
          'El_domingo=søndag por_la_mañana>la_mañana=om_morgenen , ^Berit hace>hacer=pakker la_maleta=kofferten : crema_solar>la_crema_solar=solkrem , queso>el_queso=ost para=til ^Per … y dos=to sombreros>el_sombrero=hatter .',
          'Y ^Berit toma>tomar=drikker su=sin último>último=siste café>el_café=kaffe en=på el_bar=baren de=til ^Amparo .',
          'Amparo: — Hoy=i_dag , el_café=kaffen es>ser=er un_regalo>el_regalo=en_gave . ¡ Hasta_pronto>pronto=vi_ses_snart , señora>la_señora=frue !',
          'Berit: — ¡ Muchas_gracias=tusen_takk , ^Amparo ! ¡ Hasta_pronto>pronto=vi_ses_snart !',
          'Llega>llegar=kommer ^Vicente .',
          'Vicente: — ¿ La_llave=nøkkelen , por_favor=takk ?',
          'Berit: — Aquí_tiene>tener=vær_så_god .',
          'Vicente: — ¿Qué_tal?>¿qué_tal?=Hvordan_gikk_det? ¿ Y el_piso=leiligheten ?',
          'Berit: — ¡ Muy=veldig bien=bra ! El_piso=leiligheten es>ser=er muy=veldig bonito=fin , y la_vecina>el_vecino=naboen , ¡ muy=veldig simpática>simpático=hyggelig !',
          'Vicente: — ¿ ^Maribel ? ¡ Claro=selvfølgelig ! ¡ Es>ser=hun_er mi=min hermana>la_hermana=søster !',
          'Berit: — ¡ Su=Deres hermana>la_hermana=søster ! Ahora=nå entiendo>entender=forstår_jeg : ¡ en=i ^Altea , todo_el_pueblo>el_pueblo=hele_byen lo_sabe>saber=vet todo=alt !',
          'A_las_doce>doce=klokka_tolv , ^Maribel y ^Coco van>ir=går con=med ^Berit a=til la_parada=holdeplassen .',
          'Maribel: — ^Berit , ¿ vuelves>volver=kommer_du_tilbake el_año=året que=som viene>venir=kommer ?',
          'Berit: — ¡ Sí=ja ! Y con=med ^Per … y con=med su=hans sombrero>el_sombrero=hatt .',
          'Maribel: — ¡ Hasta_pronto>pronto=vi_ses_snart , vecina>el_vecino=nabo !',
          'Llega>llegar=kommer el_autobús=bussen , y el_conductor=sjåføren es>ser=er el_mismo>mismo=den_samme del=som_på lunes>el_lunes=mandag .',
          'Conductor: — ¡ Hola=hei , señora>la_señora=frue ! ¿ A=til ^Alicante ?',
          'Berit: — Sí=ja , un_billete>el_billete=en_billett , por_favor=takk . ¿ Puedo>poder=kan_jeg pagar=betale con=med tarjeta>la_tarjeta=kort ?',
          'Conductor: — Claro=selvfølgelig .',
          'En=på el_autobús=bussen , ^Berit piensa>pensar=tenker en=på la_semana=uka : el_mercado=markedet , el_bar=baren de=til ^Amparo , la_farmacia=apoteket … y la_cena=middagen a_las_diez>diez=klokka_ti .',
          'Y piensa>pensar=hun_tenker : « Una=ei semana>la_semana=uke en=i ^España … ¡ y ya=allerede hablo>hablar=snakker_jeg español>el_español=spansk ! » .',
          '^Per llama>llamar=ringer al=til móvil>el_móvil=mobilen . ^Berit habla>hablar=snakker y habla>hablar=snakker …',
          '^Per dice>decir=sier : « ¿ Qué=hva ? » . ¡ No=ikke entiende>entender=forstår nada=noe ! ¡ ^Berit habla>hablar=snakker en=på español>el_español=spansk !',
          'En=i ^Hamar , ^Per espera>esperar=venter con=med el_gato=katten . Y llueve>llover=det_regner , claro=selvfølgelig .',
          'Ingrid: Stakkars Per. Nå må han lære spansk han også.',
          'Marta: Med hatt! Ta med deg to setninger fra i dag: ¡Hasta pronto!, vi ses snart, og ¿Vuelves el año que viene?, kommer du tilbake neste år?',
          'Marta: Gracias por escuchar. ¡Hasta pronto!',
          'Ingrid: ¡Hasta pronto!',
        ]),
      },
    ],
  },
]
