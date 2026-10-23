// El caso del reloj perdido: a mystery in Cadaqués, heard before it is
// read (games/story.tsx, the story's `listen`). Inspector Garrido, on
// holiday from Madrid, questions a witness in each chapter, and what each
// one gives away goes into his notebook (`clue`); in the last chapter the
// reader names who took the watch (`accuse`). The words it needs that the
// bank did not have are the lesson «caso» in data/words.ts.
//
// The lines are written as data/quijote.ts describes, as in a play: a line
// one of the cast says begins with the speaker's name and a colon
// ('Narcís: — ¡ …'), and is said in that voice (data/voices.ts); the rest
// are the narrator's. Each line's text is its own, since a recording is
// found by its text alone.

import type { Chapter } from './stories.ts'

// The lines of a chapter, and who says each
function play(rows: Array<string>): Pick<Chapter, 'lines' | 'who'> {
  const lines: Array<string> = []
  const who: Array<string | undefined> = []
  for (const row of rows) {
    const m = /^(\p{Lu}\p{Ll}+): (.+)$/u.exec(row)
    lines.push(m ? m[2] : row)
    who.push(m ? m[1] : undefined)
  }
  return { lines, who }
}

export const CHAPTERS: Array<Chapter> = [
  {
    id: 'caso-puerto',
    title: 'El reloj de oro',
    no: 'Havnen: gulluret',
    ...play([
      'Es>ser=det_er lunes>el_lunes=mandag en=i ^Cadaqués , y hace_viento=det_blåser : es>ser=det_er la_tramontana=tramontanaen .',
      'El_inspector=inspektør ^Garrido , de=fra ^Madrid , está>estar=er aquí=her de_vacaciones>las_vacaciones=på_ferie . Pero hoy=i_dag tiene>tener=har_han un_caso>el_caso=en_sak .',
      'En=ved el_puerto=havnen hay=er_det una_casa>la_casa=et_hus blanca>blanco=hvitt con=med una_puerta>la_puerta=en_dør azul=blå : es>ser=det_er la_casa=huset de=til ^Narcís , un_viejo>viejo=en_gammel pescador>el_pescador=fisker .',
      'Narcís: — ¡ Inspector>el_inspector=inspektør , mi=min reloj>el_reloj=klokke de=av oro>el_oro=gull ha_desaparecido>desaparecer=har_forsvunnet !',
      'Narcís: — Es>ser=det_er un_reloj_de_bolsillo>el_reloj_de_bolsillo=et_lommeur . Fue>ser=det_var el_premio=premien de=i una_carrera>la_carrera=et_kappløp de=med barcos>el_barco=båter , hace>hacer=for sesenta=seksti años>el_año=år_siden .',
      'Narcís: — Pero no_anda>andar=den_går_ikke . Se_paró>pararse=den_stanset a_las_cuatro_y_cuarto , el_día=den_dagen que=da murió>morir=døde mi=min ^Teresa .',
      'Narcís: — Desde=siden entonces , nunca=aldri le_doy_cuerda>dar_cuerda=trekker_jeg_den_opp .',
      'Garrido: — ¿ Dónde=hvor estaba>estar=var el_reloj=klokken ?',
      'Narcís: — Aquí=her , en=på la_mesa=bordet , cerca_de>cerca=ved la_ventana=vinduet . A_las_nueve>nueve=klokka_ni cerré>cerrar=låste_jeg la_puerta=døra con=med llave>la_llave=nøkkel y fui>ir=gikk_jeg al=til bar>el_bar=baren de=på la_playa=stranden .',
      'Narcís: — Volví>volver=jeg_kom_tilbake a_las_once>once=klokka_elleve . La_puerta=døra y la_ventana=vinduet estaban>estar=var cerradas>cerrado=lukket … ¡ pero el_reloj=klokken no=ikke estaba>estar=var_der !',
      'Garrido: — ¿ Quién=hvem tiene>tener=har llave>la_llave=nøkkel de=til esta>este=dette casa>la_casa=huset ?',
      'Narcís: — Solo=bare yo=jeg . ¡ Y todo_el_pueblo>el_pueblo=hele_landsbyen sabe>saber=vet que=at un_señor>el_señor=en_herre de=fra ^Barcelona quiere>querer=vil comprar=kjøpe mi=min reloj>el_reloj=klokke !',
      'El_inspector=inspektøren mira>mirar=ser_på la_mesa=bordet con=med su=sitt lupa>la_lupa=forstørrelsesglass . No_hay>hay=det_er nada=ingenting .',
      'Y escribe>escribir=han_skriver en=i su=sin libreta>la_libreta=notatbok : « Puerta>la_puerta=dør cerrada>cerrado=låst , ventana>la_ventana=vindu cerrada>cerrado=lukket … ¿ y el_reloj=klokken ? » .',
    ]),
    clue: 'Klokken forsvant fra bordet mellom ni og elleve, mens Narcís var på strandbaren. Døra var låst, og Narcís sier at bare han har nøkkel.',
    questions: [
      {
        q: 'Hvorfor går ikke klokken?',
        a: [
          'Den stanset den dagen kona hans døde',
          'Katten har ødelagt den',
          'Den har ligget i sjøen',
        ],
      },
      {
        q: 'Hvor lå klokken?',
        a: ['På bordet ved vinduet', 'I lomma til Narcís', 'I båten hans'],
      },
      {
        q: 'Hvem har nøkkel til huset, sier Narcís?',
        a: ['Bare han selv', 'Hele landsbyen', 'Herren fra Barcelona'],
      },
    ],
  },
  {
    id: 'caso-chiringuito',
    title: 'Un café en la playa',
    no: 'Strandbaren: Montse ser alt',
    ...play([
      'El_chiringuito=strandbaren de=til ^Montse está>estar=ligger en=på la_playa=stranden . Hoy=i_dag , con=med la_tramontana=tramontanaen , no_hay>hay=er_det_ingen turistas>el_turista=turister .',
      'Garrido: — Buenas_tardes=god_ettermiddag . ¿ ^Narcís estuvo>estar=var aquí=her esta_mañana>la_mañana=i_morges ?',
      'Montse: — Sí=ja , inspector>el_inspector=inspektør , como=som todos_los_días>el_día=hver_dag : de=fra nueve=ni a=til once=elleve , con=med su=sin café>el_café=kaffe y su=sin periódico>el_periódico=avis .',
      'Montse: — No=ikke se_movió>moverse=rørte_han_seg de=fra la_silla=stolen . ¡ Lo=ham vi>ver=så_jeg todo_el_tiempo>el_tiempo=hele_tiden !',
      'Garrido: — ¿ Y el_señor=herren de=fra ^Barcelona ?',
      'Montse: — ¡ El_señor=herr ^Puig ! Ayer=i_går por_la_tarde>la_tarde=ettermiddag estuvo>estar=var_han aquí=her , con=med ^Narcís .',
      'Montse: — Quería>querer=han_ville comprar=kjøpe el_reloj=klokken por=for tres=tre mil=tusen euros>el_euro=euro . ¡ Tres=tre mil=tusen !',
      'Montse: — ^Narcís dijo>decir=sa que_no>no=nei , y el_señor=herr ^Puig se_puso>poner=ble muy=veldig rojo=rød .',
      'Montse: — Dijo>decir=han_sa muy=veldig alto=høyt : « ¡ Un_día>el_día=en_dag , su=din reloj>el_reloj=klokke va_a>ir=skal ser=bli mío>mi=min ! » .',
      'Montse: — ¿ Quiere>querer=vil_du saber=vite más=mer ? Pregunte_a>preguntar=spør ^Remei , la_vecina>el_vecino=naboen de=til ^Narcís .',
      'Montse: — Todas_las_mañanas>la_mañana=hver_morgen está>estar=sitter_hun en=på las_escaleras>la_escalera=trappa de=til la_iglesia=kirken , con=med su=sin gato>el_gato=katt . ¡ Y lo_ve>ver=hun_ser todo=alt !',
      'Montse: — Esta_mañana>la_mañana=i_morges también=også . Desde=fra aquí=her se_ve>ver=ser_man la_iglesia=kirken : ¡ mire>mirar=se , allí=der está>estar=er_hun !',
      'Allí=der , en=på las_escaleras>la_escalera=trappa , una_señora>la_señora=en_dame mayor=eldre mira>mirar=ser hacia=mot el_bar=baren .',
      'El_inspector=inspektøren escribe>escribir=skriver en=i su=sin libreta>la_libreta=notatbok : « El_señor=herr ^Puig quería>querer=ville_ha el_reloj=klokken . ^Remei lo_ve>ver=ser todo=alt » .',
    ]),
    clue: 'Montse så Narcís på strandbaren hele tiden. Herr Puig ville kjøpe klokken i går, og ble sint da Narcís sa nei. Remei sitter på kirketrappa hver morgen, også i dag.',
    questions: [
      {
        q: 'Hvor var Narcís fra ni til elleve?',
        a: ['På strandbaren, hele tiden', 'Hjemme', 'Ute med båten'],
      },
      {
        q: 'Hva ville herr Puig i går?',
        a: [
          'Kjøpe klokken for tre tusen euro',
          'Selge en båt til Narcís',
          'Spise lunsj med Montse',
        ],
      },
      {
        q: 'Hvor sitter Remei hver morgen?',
        a: ['På kirketrappa, med katten sin', 'På markedet', 'På stranden'],
      },
    ],
  },
  {
    id: 'caso-iglesia',
    title: 'La vecina y el gato',
    no: 'Kirketrappa: naboen og katten',
    ...play([
      'Desde=fra la_iglesia=kirken se_ve>ver=ser_man todo_el_pueblo>el_pueblo=hele_landsbyen , y el_mar=havet .',
      'En=på las_escaleras>la_escalera=trappa está>estar=sitter ^Remei , la_vecina>el_vecino=naboen de=til ^Narcís . Cerca_de>cerca=ved_siden_av ella=henne duerme>dormir=sover un_gato>el_gato=en_katt gordo=tykk , blanco=hvit y naranja>la_naranja=oransje .',
      'Remei: — ¡ Inspector>el_inspector=inspektør ! Usted=du busca>buscar=leter_etter el_reloj=klokken de=til ^Narcís , ¿ verdad>la_verdad=ikke_sant ? ¡ Fue>ser=det_var mi=min gato>el_gato=katt !',
      'Remei: — Se_llama>llamarse=han_heter ^Dalí , por=på_grunn_av los_bigotes>el_bigote=barten . ¡ Y se_lleva>llevar=han_tar_med_seg todo_lo_que>todo=alt_som brilla>brillar=glitrer !',
      'Garrido: — Pero la_puerta=døra y la_ventana=vinduet estaban>estar=var cerradas>cerrado=lukket .',
      'Remei: — ¡ Ay>¡ay!=å , inspector>el_inspector=inspektør ! Un_gato>el_gato=en_katt entra>entrar=kommer_inn por=gjennom la_chimenea=pipa .',
      'El_gato=katten abre>abrir=åpner un_ojo>el_ojo=et_øye , mira>mirar=ser al=på inspector>el_inspector=inspektøren y duerme>dormir=sover otra_vez=igjen .',
      'Remei: — Bueno=vel … esta_mañana>la_mañana=i_morges dormía>dormir=sov_han aquí=her , al=i sol>el_sol=sola , como=som siempre=alltid . ¡ Pero este=denne gato>el_gato=katten es>ser=er un_mago>el_mago=en_trollmann !',
      'Garrido: — ¿ Y usted=du vio>ver=så algo=noe raro=rart esta_mañana>la_mañana=i_morges ?',
      'Remei: — ¡ Sí=ja ! A_las_nueve_y_media , una_persona>la_persona=en_person abrió>abrir=åpnet la_puerta=døra de=til ^Narcís con=med llave>la_llave=nøkkel .',
      'Remei: — Llevaba>llevar=personen_hadde_på_seg un_pañuelo>el_pañuelo=et_tørkle azul=blått en=på la_cabeza=hodet , por=på_grunn_av el_viento=vinden . No=ikke vi>ver=så_jeg la_cara=ansiktet .',
      'Remei: — ¿ Llave>la_llave=nøkkel ? Yo=jeg también=også tengo>tener=har una=en , para=for_å regar=vanne sus>su=hans flores>la_flor=blomster . ¡ ^Narcís nunca=aldri se_acuerda>acordarse=husker_det !',
      'Remei: — Y ^Jordi , el_relojero=urmakeren , quiere_a>querer=elsker ^Laia , la_nieta=barnebarnet de=til ^Narcís . ¡ Lo=det sabe>saber=vet todo_el_pueblo>el_pueblo=hele_landsbyen !',
      'El_inspector=inspektøren escribe>escribir=skriver en=i su=sin libreta>la_libreta=notatbok : « Pista>la_pista=spor : un_pañuelo>el_pañuelo=et_tørkle azul=blått … y una_llave>la_llave=en_nøkkel » .',
    ]),
    clue: 'Halv ti låste noen med blått tørkle opp døra til Narcís. Remei har også nøkkel, men katten hennes sov ved siden av henne. Sladder: urmakeren Jordi er forelsket i Laia, barnebarnet til Narcís.',
    questions: [
      {
        q: 'Hvem tror Remei tok klokken?',
        a: ['Katten hennes, Dalí', 'Herr Puig', 'Narcís selv'],
      },
      {
        q: 'Hva så Remei klokka halv ti?',
        a: [
          'Noen med blått tørkle som låste opp døra til Narcís',
          'Katten som klatret ned pipa',
          'Herr Puig som banket på døra',
        ],
      },
      {
        q: 'Hvorfor har Remei nøkkel til huset?',
        a: [
          'Hun vanner blomstene til Narcís',
          'Hun er søsteren hans',
          'Hun fant den på gata',
        ],
      },
    ],
  },
  {
    id: 'caso-mercado',
    title: 'Pescado de ayer',
    no: 'Markedet: gårsdagens fisk',
    ...play([
      'Los_lunes>el_lunes=om_mandagen hay=er_det mercado>el_mercado=marked en=i ^Cadaqués .',
      '^Quim , el_otro>otro=den_andre viejo=gamle pescador>el_pescador=fiskeren del=i pueblo>el_pueblo=landsbyen , tiene>tener=har un_puesto>el_puesto=en_bod de=med pescado>el_pescado=fisk .',
      'Quim: — ¿ Pescado>el_pescado=fisk fresco=fersk ? Hoy=i_dag no=ikke , señor>el_señor=min_herre . Solo_hay>hay=det_er_bare pescado>el_pescado=fisk de=fra ayer=i_går .',
      'Quim: — Con=med esta>este=denne tramontana>la_tramontana=tramontanaen , hoy=i_dag nadie=ingen salió>salir=dro_ut al=på mar>el_mar=havet . En=i ^Cadaqués y en=i ^Portlligat , ¡ nadie=ingen !',
      'Garrido: — ¿ Y usted=du , dónde=hvor estaba>estar=var_du esta_mañana>la_mañana=i_morges ?',
      'Quim: — Aquí=her , en=i mi=min puesto>el_puesto=bod , desde=fra las_ocho>ocho=klokka_åtte . ¡ Todo_el_mercado>el_mercado=hele_markedet me=meg vio>ver=så !',
      'Garrido: — ¿ Conoce>conocer=kjenner usted=du el_reloj=klokken de=til ^Narcís ?',
      'Quim: — ¡ Claro=selvsagt ! Hace>hacer=for sesenta=seksti años>el_año=år_siden , ^Narcís y yo=jeg hicimos>hacer=hadde una_carrera>la_carrera=et_kappløp de=med barcos>el_barco=båter .',
      'Quim: — Él=han llegó>llegar=kom primero=først … ¡ porque=fordi salió>salir=han_startet primero=først ! ¡ El_premio=premien es>ser=er mío>mi=min !',
      'Quim: — Pero yo=jeg no=ikke robo>robar=stjeler relojes>el_reloj=klokker , inspector>el_inspector=inspektør . Y no=ikke tengo>tener=har_jeg llave>la_llave=nøkkel de=til su=hans casa>la_casa=hus .',
      '^Quim mira>mirar=ser_på el_mar=havet y se_ríe>reírse=ler .',
      'Quim: — Con=med la_tramontana=tramontanaen , todos>todo=alle estamos>estar=er_vi un_poco>poco=litt locos>loco=gale .',
      'El_inspector=inspektøren escribe>escribir=skriver en=i su=sin libreta>la_libreta=notatbok : « Hoy=i_dag nadie=ingen salió>salir=dro_ut al=på mar>el_mar=havet » .',
    ]),
    clue: 'Ingen dro ut på havet i dag på grunn av tramontanaen, verken fra Cadaqués eller fra Portlligat. Quim sto i boden sin på markedet fra klokka åtte, og han har ikke nøkkel.',
    questions: [
      {
        q: 'Hvorfor har Quim bare fisk fra i går?',
        a: [
          'Ingen dro ut på havet i dag, på grunn av tramontanaen',
          'Han har solgt all den ferske',
          'Båten hans er i stykker',
        ],
      },
      {
        q: 'Hvor var Quim i formiddag?',
        a: [
          'I boden sin på markedet, fra klokka åtte',
          'På strandbaren med Narcís',
          'Ute med båten',
        ],
      },
      {
        q: 'Hvorfor mener Quim at premien er hans?',
        a: [
          'Narcís startet før ham i kappløpet',
          'Han kjøpte den av Narcís',
          'Faren hans vant den',
        ],
      },
    ],
  },
  {
    id: 'caso-hotel',
    title: 'Un desayuno muy largo',
    no: 'Hotellet: en veldig lang frokost',
    ...play([
      'El_señor=herr ^Puig , de=fra ^Barcelona , está>estar=sitter en=på la_terraza=terrassen del=på hotel>el_hotel=hotellet . En=på su=hans mesa>la_mesa=bord hay=er_det muchos>mucho=mange platos>el_plato=tallerkener .',
      'Puig: — Inspector>el_inspector=inspektør , yo=jeg tengo>tener=har una_colección>la_colección=en_samling de=av relojes>el_reloj=klokker , es>ser=det_er verdad>la_verdad=sant . ¡ Pero no=ikke soy>ser=er_jeg un_ladrón>el_ladrón=en_tyv !',
      'Puig: — Ayer=i_går perdí>perder=mistet_jeg la_cabeza=hodet con=med ^Narcís . ¡ Es>ser=det_er la_tramontana=tramontanaen !',
      'Puig: — Pero esta_mañana>la_mañana=i_morges no=ikke salí>salir=gikk_jeg_ut del=av hotel>el_hotel=hotellet .',
      'Puig: — Estoy>estar=jeg_har_sittet en=på esta>este=denne terraza>la_terraza=terrassen desde=siden las_nueve>nueve=klokka_ni : desayuno>el_desayuno=frokost , aperitivo>el_aperitivo=aperitiff , almuerzo>el_almuerzo=lunsj …',
      'Un_camarero>el_camarero=en_servitør del=på hotel>el_hotel=hotellet dice>decir=sier que=at es>ser=det_er verdad>la_verdad=sant : el_señor=herr ^Puig no=ikke salió>salir=gikk_ut en=i toda_la_mañana>la_mañana=hele_formiddagen .',
      'Garrido: — ¿ Y vio>ver=så_du algo=noe desde=fra la_terraza=terrassen ?',
      'Puig: — Sí=ja . A_las_nueve_y_media , más=mer o=eller menos=mindre , una_mujer>la_mujer=en_kvinne joven=ung subía>subir=gikk_opp muy=veldig rápido=fort desde=fra el_puerto=havnen .',
      'Puig: — Llevaba>llevar=hun_hadde un_pañuelo>el_pañuelo=et_tørkle azul=blått . Y en=i la_mano=hånden tenía>tener=hadde_hun algo=noe que=som brillaba>brillar=glitret … ¡ como=som el_oro=gull !',
      'Garrido: — ¿ Y hacia_dónde>dónde=hvor iba>ir=gikk_hun ?',
      'Puig: — Hacia=mot las_calles>la_calle=gatene del=i pueblo>el_pueblo=landsbyen . Allí=der está>estar=ligger la_relojería=urmakerbutikken de=til ^Jordi . ¡ La>lo=den conozco>conocer=kjenner_jeg bien=godt !',
      'El_inspector=inspektøren escribe>escribir=skriver en=i su=sin libreta>la_libreta=notatbok : « Una_mujer>la_mujer=en_kvinne joven=ung , un_pañuelo>el_pañuelo=et_tørkle azul=blått … y algo=noe de=av oro>el_oro=gull » .',
    ]),
    clue: 'Herr Puig var på hotellet hele formiddagen. Halv ti så han en ung kvinne med blått tørkle skynde seg opp fra havnen, med noe som glitret som gull, mot urmakeren.',
    questions: [
      {
        q: 'Hvorfor kan ikke herr Puig ha tatt klokken?',
        a: [
          'Han var på hotellet hele formiddagen',
          'Han var i Barcelona',
          'Han liker ikke gull',
        ],
      },
      {
        q: 'Hvem så herr Puig fra terrassen?',
        a: [
          'En ung kvinne med blått tørkle',
          'Katten til Remei',
          'Quim med en fisk',
        ],
      },
      {
        q: 'Hva hadde hun i hånden?',
        a: ['Noe som glitret, som gull', 'En paraply', 'En pose med brød'],
      },
    ],
  },
  {
    id: 'caso-relojeria',
    title: 'La relojería',
    no: 'Urmakeren: et løfte',
    ...play([
      'La_relojería=urmakerbutikken de=til ^Jordi es>ser=er pequeña>pequeño=liten y oscura>oscuro=mørk .',
      '^Tic , ^tac , ^tic , ^tac : en=på las_paredes>la_pared=veggene hay=er_det muchos>mucho=mange relojes>el_reloj=klokker .',
      'Garrido: — Buenas_tardes=god_ettermiddag , ^Jordi . Busco>buscar=jeg_leter_etter un_reloj_de_bolsillo>el_reloj_de_bolsillo=et_lommeur de=av oro>el_oro=gull .',
      'Jordi: — Esta_mañana>la_mañana=i_morges , a_las_diez , una_persona>la_persona=en_person me=meg dio>dar=ga un_reloj>el_reloj=ei_klokke de=av oro>el_oro=gull para=for_å arreglar=reparere .',
      'Jordi: — Estaba>estar=den_var parado>pararse=stanset a_las_cuatro_y_cuarto . Lo=den arreglé>arreglar=reparerte_jeg , y ya=nå anda>andar=går_den muy=veldig bien=bra .',
      'Garrido: — ¿ Quién=hvem le_dio>dar=ga_deg el_reloj=klokken ?',
      'Jordi: — No=ikke lo=det puedo>poder=kan_jeg decir=si , inspector>el_inspector=inspektør . Lo=det prometí>prometer=lovet_jeg . ¡ Es>ser=det_er una_sorpresa>la_sorpresa=en_overraskelse !',
      'Garrido: — ¿ Y dónde=hvor está>estar=er el_reloj=klokken ahora=nå ?',
      'Jordi: — A_las_doce>doce=klokka_tolv , la_persona=personen vino>venir=kom otra_vez=igjen y se_lo_llevó>llevar=tok_den_med_seg .',
      '^Jordi se_pone>poner=blir rojo=rød y mira>mirar=ser_på una_foto>la_foto=et_bilde en=på la_pared=veggen .',
      'En=på la_foto=bildet están>estar=er ^Jordi y una_mujer>la_mujer=en_kvinne joven=ung , en=på la_fiesta=festen del=i pueblo>el_pueblo=landsbyen . Ella=hun lleva>llevar=har_på_seg un_pañuelo>el_pañuelo=et_tørkle azul=blått .',
      'Garrido: — ¿ Y quién=hvem es>ser=er la_mujer=kvinnen de=på la_foto=bildet ?',
      'Jordi: — Es>ser=det_er … una_amiga>la_amiga=en_venninne . ¡ No=ikke le_puedo>poder=kan_jeg decir=si más=mer !',
      'El_inspector=inspektøren escribe>escribir=skriver en=i su=sin libreta>la_libreta=notatbok : « El_reloj=klokken anda>andar=går otra_vez=igjen … y es>ser=det_er una_sorpresa>la_sorpresa=en_overraskelse » .',
    ]),
    clue: 'Klokka ti fikk urmakeren Jordi et gullur som sto på kvart over fire. Han reparerte det, og klokka tolv ble det hentet. Han har lovet å tie, men han rødmer foran et bilde av en ung kvinne med blått tørkle.',
    questions: [
      {
        q: 'Hva gjorde Jordi med klokken?',
        a: [
          'Han reparerte den, så den går igjen',
          'Han solgte den til herr Puig',
          'Han ga den til Remei',
        ],
      },
      {
        q: 'Hvorfor vil ikke Jordi si hvem som kom med den?',
        a: [
          'Han har lovet det – det er en overraskelse',
          'Han husker det ikke',
          'Han er redd for Quim',
        ],
      },
      {
        q: 'Hvem er på bildet på veggen?',
        a: [
          'Jordi og en ung kvinne med blått tørkle',
          'Narcís og kona hans',
          'Katten Dalí',
        ],
      },
    ],
  },
  {
    id: 'caso-portlligat',
    title: 'La nieta',
    no: 'Stien til Portlligat: barnebarnet',
    ...play([
      'El_camino=stien de=til ^Portlligat sube>subir=går_opp entre=mellom las_rocas>la_roca=klippene , cerca_del>cerca=nær mar>el_mar=havet .',
      'Allí=der está>estar=ligger la_casa=huset del=til pintor>el_pintor=maleren ^Dalí , con=med huevos>el_huevo=egg enormes>enorme=enorme en=på el_tejado=taket .',
      'En=på el_camino=stien está>estar=er ^Laia , la_nieta=barnebarnet de=til ^Narcís . Lleva>llevar=hun_har_på_seg un_pañuelo>el_pañuelo=et_tørkle azul=blått .',
      'El_gato=katten de=til ^Remei la_sigue>seguir=følger_henne .',
      'Laia: — ¡ Hola=hei , inspector>el_inspector=inspektør ! Este=denne gato>el_gato=katten siempre=alltid me_sigue>seguir=følger_meg : le_doy>dar=jeg_gir_den pescado>el_pescado=fisk .',
      'Garrido: — ^Laia , ¿ dónde=hvor estaba>estar=var usted=du esta_mañana>la_mañana=i_morges ?',
      'Laia: — Yo=jeg … estaba>estar=var en=på el_mar=havet , con=med mi=min barco>el_barco=båt . Salí>salir=jeg_dro_ut muy=veldig temprano=tidlig .',
      'Laia: — Volví>volver=jeg_kom_tilbake a_las_doce>doce=klokka_tolv . No=ikke sé>saber=vet_jeg nada=noe del=om reloj>el_reloj=klokken del=til abuelo>el_abuelo=bestefar .',
      '^Laia no=ikke mira>mirar=ser al=på inspector>el_inspector=inspektøren . Mira>mirar=hun_ser_på el_mar=havet .',
      'Garrido: — ¿ Usted=du tiene>tener=har llave>la_llave=nøkkel de=til la_casa=huset de=til su=din abuelo>el_abuelo=bestefar ?',
      'Laia: — Claro=selvsagt , soy>ser=jeg_er su=hans nieta>la_nieta=barnebarn . Pero ¿ por_qué=hvorfor lo_pregunta>preguntar=spør_du_om_det ?',
      'Laia: — Mañana=i_morgen es>ser=er el_cumpleaños=bursdagen del=til abuelo>el_abuelo=bestefar : ¡ ochenta=åtti años>el_año=år ! Hay=det_blir una_fiesta>la_fiesta=en_fest en=på la_playa=stranden .',
      'Y ^Laia corre>correr=løper hacia=mot el_pueblo=landsbyen , con=med el_gato=katten .',
      'El_inspector=inspektøren escribe>escribir=skriver en=i su=sin libreta>la_libreta=notatbok : « ^Laia dice>decir=sier que=at salió>salir=hun_dro_ut al=på mar>el_mar=havet … ¿ con=med esta>este=denne tramontana>la_tramontana=tramontanaen ? » .',
    ]),
    clue: 'Laia, barnebarnet til Narcís, har nøkkel til huset og går med blått tørkle. Hun sier at hun var ute med båten i morges. I morgen fyller Narcís åtti år.',
    questions: [
      {
        q: 'Hva sier Laia at hun gjorde i morges?',
        a: [
          'Hun var ute på havet med båten sin',
          'Hun var på markedet',
          'Hun sov lenge',
        ],
      },
      {
        q: 'Hvorfor følger katten Laia?',
        a: [
          'Hun gir den fisk',
          'Det er hennes egen katt',
          'Den liker det blå tørkleet',
        ],
      },
      {
        q: 'Hva skjer i morgen?',
        a: [
          'Narcís fyller åtti år, og det blir fest på stranden',
          'Laia reiser til Barcelona',
          'Det er marked igjen',
        ],
      },
    ],
  },
  {
    id: 'caso-playa',
    title: 'Caso cerrado',
    no: 'Stranden: hvem tok klokken?',
    ...play([
      'Por_la_tarde>la_tarde=om_kvelden , la_tramontana=tramontanaen se_va>ir=gir_seg . Todos>todo=alle están>estar=er en=på el_chiringuito=strandbaren de=til ^Montse .',
      '^Narcís , ^Remei con=med su=sin gato>el_gato=katt , ^Quim , el_señor=herr ^Puig , ^Jordi y ^Laia miran>mirar=ser al=på inspector>el_inspector=inspektøren .',
      'Garrido: — Esta_mañana>la_mañana=i_morges , una_persona>la_persona=en_person con=med un_pañuelo>el_pañuelo=et_tørkle azul=blått abrió>abrir=låste_opp la_puerta=døra de=til ^Narcís con=med llave>la_llave=nøkkel .',
      'Garrido: — Ya=nå sé>saber=vet_jeg quién=hvem_som se_llevó>llevar=tok el_reloj=klokken .',
      'Garrido: — ^Remei tiene>tener=har llave>la_llave=nøkkel , pero estaba>estar=hun_var en=ved la_iglesia=kirken . El_señor=herr ^Puig estaba>estar=var en=på el_hotel=hotellet , y ^Quim , en=på el_mercado=markedet .',
      'Garrido: — Y usted=du , ^Laia , dice>decir=sier que=at salió>salir=du_dro_ut al=på mar>el_mar=havet . ¡ Pero hoy=i_dag nadie=ingen salió>salir=dro_ut al=på mar>el_mar=havet !',
      '^Laia se_pone>poner=blir roja>rojo=rød … y se_ríe>reírse=ler .',
      'Laia: — Sí=ja , fui>ser=det_var yo=meg . Llevé>llevar=jeg_tok el_reloj=klokken a=til ^Jordi , para=til tu=din cumpleaños>el_cumpleaños=bursdag , abuelo>el_abuelo=bestefar .',
      'Laia: — Estaba>estar=den_var parado>pararse=stanset desde_que>desde=siden la_abuela=bestemor murió>morir=døde . ¡ Ahora=nå anda>andar=går_den otra_vez=igjen !',
      '^Laia da>dar=gir el_reloj=klokken al=til abuelo>el_abuelo=bestefar . ^Narcís lo_escucha>escuchar=lytter_til_den , y llora>llorar=gråter un_poco>poco=litt .',
      'Narcís: — Gracias=takk , ^Laia . ¡ Ya=nå era>ser=var_det hora>la_hora=på_tide !',
      'Remei: — ¿ Lo_ve>ver=ser_du_det , inspector>el_inspector=inspektør ? ¡ Yo=jeg siempre=alltid dije>decir=sa que=at mi=min gato>el_gato=katt era>ser=var inocente=uskyldig !',
      'Quim: — Bueno=vel … pero la_carrera=kappløpet de=med barcos>el_barco=båter la_gané>ganar=vant yo=jeg .',
      'Y el_inspector=inspektøren cierra>cerrar=lukker su=sin libreta>la_libreta=notatbok : caso>el_caso=saken cerrado=er_løst .',
    ]),
    accuse: {
      after: 4,
      q: 'Hvem tok klokken?',
      culprit: 'Laia',
      suspects: [
        {
          name: 'Remei',
          no: 'naboen',
          hint: 'Remei har nøkkel, men hun satt på kirketrappa hele morgenen, og Montse så henne der fra strandbaren.',
          from: 2,
        },
        {
          name: 'Dalí',
          no: 'katten',
          hint: 'Døra var låst, og katten sov i sola ved siden av Remei hele morgenen.',
          from: 3,
        },
        {
          name: 'Quim',
          no: 'den andre fiskeren',
          hint: 'Quim har ikke nøkkel, og han sto i boden sin på markedet fra klokka åtte.',
          from: 4,
        },
        {
          name: 'Puig',
          no: 'samleren fra Barcelona',
          hint: 'Herr Puig gikk ikke ut av hotellet i hele formiddag. Servitøren så ham på terrassen.',
          from: 5,
        },
        {
          name: 'Jordi',
          no: 'urmakeren',
          hint: 'Den som låste opp døra, gikk med blått tørkle, og herr Puig så at det var en ung kvinne. Jordi fikk klokken av henne klokka ti.',
          from: 5,
        },
        { name: 'Laia', no: 'barnebarnet' },
      ],
    },
    clue: 'Saken er løst: Laia tok klokken til Jordi, så den skulle gå igjen til bestefarens åttiårsdag.',
    questions: [
      {
        q: 'Hvorfor tok Laia klokken?',
        a: [
          'For at den skulle gå igjen til bestefarens bursdag',
          'For å selge den til herr Puig',
          'Hun ville ha den selv',
        ],
      },
      {
        q: 'Hva gjør Narcís når han får klokken?',
        a: [
          'Han lytter til den og gråter litt',
          'Han ler og danser',
          'Han gir den til Quim',
        ],
      },
      {
        q: 'Hva sier Quim helt til slutt?',
        a: [
          'At det var han som vant båtkappløpet',
          'At han vil kjøpe klokken',
          'At katten er skyldig',
        ],
      },
    ],
  },
]
