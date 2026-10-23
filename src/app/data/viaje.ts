// El viaje: Solveig from Bergen and Carmen from Madrid, friends by letter
// for fifty years, travel together for the first time, by train and bus
// from the Puerta del Sol to Cadaqués, a place in each chapter. Written in
// the markup described in data/quijote.ts; the words it needs beyond the
// other lessons are its own lesson, 'viaje', in data/words.ts. The trip is
// made up, the places and what is said of them are true.

import type { Chapter } from './stories.ts'

export const CHAPTERS: Array<Chapter> = [
  {
    id: 'viaje-madrid',
    title: 'Kilómetro cero',
    no: 'Madrid: kilometer null',
    lines: [
      'En=på ^la_Puerta_del_Sol , en=i ^Madrid , está>estar=er ^el_Kilómetro_Cero : aquí=her empiezan>empezar=begynner los_caminos>el_camino=veiene de=i ^España .',
      '^Carmen espera>esperar=venter aquí=her a=på su=sin amiga>la_amiga=venninne ^Solveig , de=fra ^Noruega .',
      'Son>ser=de_er amigas>la_amiga=venninner por=per carta>la_carta=brev : ¡ cincuenta años>el_año=år de=med cartas>la_carta=brev ! Pero este=dette es>ser=er el_primer>primero=den_første viaje>el_viaje=reisen de=for las_dos>dos=de_to .',
      '^Solveig llega>llegar=kommer con=med una_maleta>la_maleta=en_koffert grande=stor y un_paraguas>el_paraguas=en_paraply .',
      '— ¡ ^Sol ! — dice>decir=sier ^Carmen ~ . ¡ Mi=min ^Sol , en=på ^la_Puerta_del_Sol !',
      'Para=for ^Carmen , el_nombre=navnet ^Solveig es>ser=er difícil=vanskelig . Ella=hun la>lo=henne llama>llamar=kaller ^Sol .',
      '— ¿ Un_paraguas>el_paraguas=en_paraply ? — pregunta>preguntar=spør ^Carmen ~ . ¡ En=om verano>el_verano=sommeren , en=i ^Madrid , hace_sol=skinner_sola !',
      '— En=i ^Bergen siempre=alltid llueve>llover=regner — dice>decir=sier ^Solveig ~ . Por_si_acaso=for_sikkerhets_skyld .',
      'Primero>primero=først , el_desayuno=frokosten : un_chocolate_con_churros=en_sjokolade_med_churros en=på una_churrería>la_churrería=en_churrosbod muy=veldig vieja>viejo=gammel .',
      'El_chocolate=sjokoladen es>ser=er espeso=tykk y caliente=varm . ^Carmen moja>mojar=dypper un_churro>el_churro=en_churros en=i la_taza=koppen .',
      '^Solveig también=også . Cierra>cerrar=hun_lukker los_ojos>el_ojo=øynene : ¡qué_rico!=så_godt!',
      '^Carmen abre>abrir=åpner un_mapa>el_mapa=et_kart en=på la_mesa=bordet : ^Córdoba , ^Sevilla , ^Granada … y al_final=til_slutt , ^Cadaqués , un_pueblo>el_pueblo=en_landsby blanco=hvit en=på la_costa=kysten .',
      '— ¿A_qué_hora_sale_el_tren?>¿a_qué_hora_sale_el_tren?=Når_går_toget? — pregunta>preguntar=spør ^Solveig .',
      '— Mañana=i_morgen , a_las_diez=klokka_ti — dice>decir=sier ^Carmen , y se_ríe>reírse=ler ~ . Tú vas_a>ir=kommer_til_å estar=være allí=der a_las_nueve>nueve=klokka_ni .',
    ],
    questions: [
      {
        q: 'Hvor venter Carmen på Solveig?',
        a: [
          'På Puerta del Sol, ved kilometer null',
          'På togstasjonen',
          'På flyplassen',
        ],
      },
      {
        q: 'Hvorfor har Solveig med seg paraply?',
        a: [
          'I Bergen regner det alltid',
          'Den er en gave til Carmen',
          'Det regner i Madrid',
        ],
      },
      {
        q: 'Hva spiser de til frokost?',
        a: ['Churros med sjokolade', 'Brød med tomat', 'Potetomelett'],
      },
    ],
  },
  {
    id: 'viaje-cordoba',
    title: 'Un bosque de piedra',
    no: 'Córdoba: en skog av stein',
    lines: [
      'A_las_nueve>nueve=klokka_ni , ^Solveig está>estar=er en=på el_andén=perrongen . ^Carmen llega>llegar=kommer en=i el_último>último=siste minuto>el_minuto=minutt .',
      'El_tren=toget es>ser=er muy=veldig rápido=raskt : en=på dos horas>la_hora=timer , están>estar=de_er en=i ^Córdoba .',
      'En=i ^Córdoba hace_calor=er_det_varmt . Las_casas>la_casa=husene son>ser=er blancas>blanco=hvite , con=med flores>la_flor=blomster en=på las_paredes>la_pared=veggene .',
      'Primero>primero=først , el_patio=gården de=til la_mezquita=moskeen , con=med naranjos>el_naranjo=appelsintrær y una_fuente>la_fuente=en_fontene .',
      'Entran>entrar=de_går_inn : columnas>la_columna=søyler y más=flere columnas>la_columna=søyler , y arcos>el_arco=buer rojos>rojo=røde y blancos>blanco=hvite .',
      '— Es>ser=det_er como=som un_bosque>el_bosque=en_skog — dice>decir=sier ^Solveig ~ . Un_bosque>el_bosque=en_skog de=av piedra>la_piedra=stein .',
      'Y de_pronto=plutselig , ^Solveig ve>ver=ser … ¡ una_catedral>la_catedral=en_katedral !',
      '— Es>ser=den_er una_mezquita>la_mezquita=en_moské del=fra siglo>el_siglo=århundre ocho=åtte — dice>decir=sier ^Carmen ~ . Más_tarde>tarde=senere , la>lo=den convierten>convertir=gjør_de_om en=til catedral>la_catedral=katedral .',
      'A_las_dos>dos=klokka_to , comen>comer=spiser_de salmorejo>el_salmorejo=salmorejo en=i un_patio>el_patio=en_gård , a_la_sombra=i_skyggen .',
      '— ¿ Sopa>la_sopa=suppe fría>frío=kald ? — pregunta>preguntar=spør ^Solveig .',
      '— Es>ser=det_er como=som el_gazpacho=gazpacho , pero más=mer espeso=tykt — dice>decir=sier ^Carmen ~ . Y es>ser=det_er de=fra aquí=her , de=fra ^Córdoba .',
      'Por_la_tarde>la_tarde=om_ettermiddagen , ^Carmen duerme>dormir=sover la_siesta=middag . ^Solveig no=ikke : ella=hun lee>leer=leser un_libro>el_libro=ei_bok .',
      'Pero a_las_cuatro>cuatro=klokka_fire … ¡ ^Solveig también=også duerme>dormir=sover !',
    ],
    questions: [
      {
        q: 'Når kommer Carmen til toget?',
        a: ['I siste minutt', 'En time før', 'Klokka ni, som Solveig'],
      },
      {
        q: 'Hva sier Solveig at moskeen er som?',
        a: ['En skog av stein', 'Et slott', 'Et hav'],
      },
      {
        q: 'Hva er salmorejo?',
        a: [
          'En kald tomatsuppe, tykkere enn gazpacho',
          'En varm fiskesuppe',
          'En kake med appelsin',
        ],
      },
    ],
  },
  {
    id: 'viaje-sevilla',
    title: 'Flamenco en Triana',
    no: 'Sevilla: flamenco i Triana',
    lines: [
      'En=i ^Sevilla hay=er_det una_ola_de_calor>la_ola_de_calor=en_hetebølge . A_las_cinco>cinco=klokka_fem de=om la_tarde=ettermiddagen , en=i la_calle=gata no=ikke hay=er_det nadie=noen .',
      '^Solveig abre>abrir=åpner su=sin paraguas>el_paraguas=paraply negro=svart : ¡ para=mot el_sol=sola !',
      '^Carmen se_ríe>reírse=ler y le=til_henne compra>comprar=kjøper un_abanico>el_abanico=ei_vifte rojo=rød .',
      '— En=i ^Bergen , hoy=i_dag , hace>hacer=er_det doce=tolv grados>el_grado=grader — dice>decir=sier ^Solveig ~ . Y llueve>llover=det_regner .',
      'A_las_nueve>nueve=klokka_ni de=om la_noche=kvelden , ^Solveig quiere>querer=vil cenar=spise_kveldsmat .',
      '— ¿ A_las_nueve>nueve=klokka_ni ? ¡ Es>ser=det_er muy=veldig temprano=tidlig ! — dice>decir=sier ^Carmen ~ . Aquí=her cenamos>cenar=spiser_vi_kveldsmat a_las_diez=klokka_ti .',
      'Por_la_noche>la_noche=om_kvelden , van>ir=går_de a=til ^Triana por=over el_puente=brua .',
      '^Triana es>ser=er famosa>famoso=berømt por=for el_flamenco=flamencoen . En=på un_bar>el_bar=en_bar pequeño=liten , un_hombre>el_hombre=en_mann toca>tocar=spiller la_guitarra=gitar .',
      'Una_mujer>la_mujer=en_kvinne canta>cantar=synger : es>ser=det_er el_cante=flamencosangen , triste=trist y hermoso=vakker .',
      'Otra>otro=en_annen mujer>la_mujer=kvinne baila>bailar=danser . Sus>su=hennes pies>el_pie=føtter hablan>hablar=snakker con=med la_guitarra=gitaren .',
      'Todos>todo=alle tocan>tocar=klapper palmas>las_palmas=takten . ^Solveig también=også … pero un_poco>poco=litt tarde=sent .',
      '— ¡Olé!>¡olé!=bravo! — dicen>decir=sier las_dos>dos=de_to .',
      'Vuelven>volver=de_går_tilbake al=til hotel>el_hotel=hotellet de=i madrugada>la_madrugada=småtimene . En=i ^Bergen , ^Solveig nunca=aldri trasnocha>trasnochar=er_oppe_sent … ¡ pero esto=dette es>ser=er ^Sevilla !',
    ],
    questions: [
      {
        q: 'Hva bruker Solveig paraplyen til i Sevilla?',
        a: ['Mot sola', 'Mot regnet', 'Til å danse med'],
      },
      {
        q: 'Når spiser man kveldsmat i Sevilla, ifølge Carmen?',
        a: ['Klokka ti', 'Klokka seks', 'Klokka ni'],
      },
      {
        q: 'Hva gjør Solveig når alle klapper takten?',
        a: ['Hun klapper også, litt for sent', 'Hun synger', 'Hun sovner'],
      },
    ],
  },
  {
    id: 'viaje-granada',
    title: 'Una caña, una tapa',
    no: 'Granada: en øl, en tapa',
    lines: [
      'En=i ^Granada , por_la_tarde>la_tarde=om_kvelden , van>ir=går_de a=på un_bar>el_bar=en_bar .',
      '— ¿Qué_os_pongo?>¿qué_te_pongo?=Hva_skal_det_være? — pregunta>preguntar=spør el_camarero=servitøren .',
      '— ¿Nos_pones_dos_cañas?>¿me_pones_una_caña?=Kan_vi_få_to_små_øl? — pide>pedir=bestiller ^Carmen .',
      'El_camarero=servitøren pone>poner=setter las_cañas>la_caña=ølene en=på la_barra=bardisken … y dos platos>el_plato=tallerkener de=med albóndigas>las_albóndigas=kjøttboller .',
      '— Pero no=ikke pedimos>pedir=bestilte_vi albóndigas>las_albóndigas=kjøttboller — dice>decir=sier ^Solveig .',
      '— En=i ^Granada , con=med la_bebida=drikken , la_tapa=småretten es>ser=er gratis — dice>decir=sier ^Carmen .',
      'Con=med otra>otro=en_ny ronda>la_ronda=runde llegan>llegar=kommer croquetas>las_croquetas=kroketter . Con=med otra>otro=en_ny , patatas_bravas>las_patatas_bravas .',
      '— ¡ Esto=dette es>ser=er la_cena=kveldsmaten ! — dice>decir=sier ^Solveig , muy=veldig contenta>contento=fornøyd .',
      '^Carmen paga>pagar=betaler la_cuenta=regningen y da>dar=gir una=et pequeña>pequeño=lite propina>la_propina=tips .',
      'Más_tarde>tarde=senere , suben>subir=går_de_opp por=gjennom ^el_Albaicín , el_viejo>viejo=den_gamle barrio>el_barrio=bydelen árabe=arabiske .',
      'En=på el_mirador=utsiktspunktet de=ved ^San_Nicolás , ven>ver=ser_de la_Alhambra>la_Alhambra=Alhambra , roja>rojo=rød con=i el_sol=sola de=om la_tarde=kvelden .',
      '— En=på árabe=arabisk , ^Alhambra es>ser=er « la_roja>rojo=den_røde » — dice>decir=sier ^Carmen .',
      'Más=lenger lejos=unna , las_montañas>la_montaña=fjellene de=i ^Sierra_Nevada : nevada>nevar=snødekt , como=som la_nieve=snøen .',
      'Un_hombre>el_hombre=en_mann toca>tocar=spiller la_guitarra=gitar . Todos>todo=alle miran>mirar=ser_på la_Alhambra>la_Alhambra=Alhambra , y nadie=ingen habla>hablar=snakker .',
    ],
    questions: [
      {
        q: 'Hvorfor får de kjøttboller som de ikke har bestilt?',
        a: [
          'I Granada følger det en tapa gratis med drikken',
          'Servitøren tar feil',
          'Carmen har bestilt dem på forhånd',
        ],
      },
      {
        q: 'Hva betyr Alhambra på arabisk, ifølge Carmen?',
        a: ['Den røde', 'Det store slottet', 'Fjellet'],
      },
      {
        q: 'Hvor ser de Alhambra fra?',
        a: ['Fra et utsiktspunkt i Albaicín', 'Fra toget', 'Fra hotellrommet'],
      },
    ],
  },
  {
    id: 'viaje-murcia',
    title: 'La hoja no se come',
    no: 'Murcia: bladet spiser man ikke',
    lines: [
      'De=fra ^Granada a=til ^Murcia van>ir=reiser_de en=med autobús>el_autobús=buss , por=gjennom montañas>la_montaña=fjell secas>seco=tørre .',
      'Pero cerca_de>cerca=nær ^Murcia todo=alt es>ser=er verde=grønt : es>ser=det_er la_huerta=jordbrukslandet .',
      'Por_la_mañana>la_mañana=om_morgenen van>ir=går_de al=til mercado>el_mercado=markedet . Hay=det_er limones>el_limón=sitroner , melocotones>el_melocotón=ferskener y albaricoques>el_albaricoque=aprikoser de_temporada=i_sesong .',
      'En=i la_frutería=fruktbutikken hay=er_det cola>la_cola=kø , y ^Carmen pregunta>preguntar=spør : « ¿Quién_es_el_último?>¿quién_es_el_último?=Hvem_er_sist? » .',
      '— Yo=jeg — dice>decir=sier una_señora>la_señora=en_dame mayor=eldre .',
      'Ahora=nå ^Carmen sabe>saber=vet cuándo=når es>ser=det_er su=hennes turno>el_turno=tur .',
      '— Medio=en_halv kilo>el_kilo=kilo de=med albaricoques>el_albaricoque=aprikoser , por_favor=takk — dice>decir=sier ^Solveig .',
      'Paga>pagar=hun_betaler un=en euro>el_euro=euro con=og cincuenta=femti . ¡ Qué=så barato=billig !',
      'Más_tarde>tarde=senere , en=på un_bar>el_bar=en_bar , ^Carmen pide>pedir=bestiller paparajotes>el_paparajote=paparajotes .',
      'Son>ser=det_er hojas>la_hoja=blader de=fra limonero>el_limonero=sitrontre con=med masa>la_masa=deig , fritas>frito=fritert , con=med azúcar>el_azúcar=sukker y canela>la_canela=kanel .',
      '^Solveig come>comer=spiser uno=en … con=med la_hoja=bladet .',
      '— ¡ No=nei , no=nei ! — dice>decir=sier ^Carmen ~ . ¡ La_hoja=bladet no=ikke se_come>comer=spiser_man !',
      'En=ved otra>otro=et_annet mesa>la_mesa=bord , la_señora=damen del=fra mercado>el_mercado=markedet se_ríe>reírse=ler : « Todos>todo=alle los_turistas>el_turista=turistene comen>comer=spiser la_hoja=bladet » .',
      '^Solveig escribe>escribir=skriver en=på su=sin móvil>el_móvil=mobil : « Paparajote>el_paparajote=paparajote : la_hoja=bladet , no=nei » .',
    ],
    questions: [
      {
        q: 'Hva spør Carmen om i køen?',
        a: ['Hvem som er sist', 'Hva aprikosene koster', 'Hvor bussen går'],
      },
      {
        q: 'Hva gjør Solveig galt med paparajoten?',
        a: [
          'Hun spiser bladet',
          'Hun glemmer sukkeret',
          'Hun spiser den med kniv og gaffel',
        ],
      },
      {
        q: 'Hvem ler ved et annet bord?',
        a: ['Damen fra markedet', 'Servitøren', 'Carmens kusine'],
      },
    ],
  },
  {
    id: 'viaje-alicante',
    title: 'La noche de las hogueras',
    no: 'Alicante: bålnatten',
    lines: [
      'En=i ^Alicante , la_Explanada>la_Explanada=Explanada tiene>tener=har palmeras>la_palmera=palmer y un_suelo>el_suelo=et_gulv de=av olas>la_ola=bølger de=i colores>el_color=farger .',
      'Cerca=nær hay=er_det una_montaña>la_montaña=et_fjell , y en=på la_montaña=fjellet , el_castillo_de_Santa_Bárbara>el_castillo_de_Santa_Bárbara=borgen_Santa_Bárbara .',
      '^Solveig se_baña>bañarse=bader en=i el_mar=havet . Para=for ella=henne , de=fra ^Bergen , el_agua=vannet está>estar=er caliente=varmt .',
      '^Carmen no=ikke se_baña>bañarse=bader : para=for ella=henne , el_agua=vannet está>estar=er muy=veldig fría>frío=kaldt .',
      'Comen>comer=de_spiser arroz_a_banda>el_arroz_a_banda en=på un_chiringuito>el_chiringuito=en_strandbar , y por_la_tarde>la_tarde=om_ettermiddagen toman_el_sol>tomar_el_sol=soler_de_seg .',
      '^Solveig se_pone>poner=smører_seg_med crema_solar>la_crema_solar=solkrem . ^Carmen no=ikke : ella=hun está>estar=er morena>moreno=solbrun .',
      'Es>ser=det_er la_fiesta=festen de=for ^San_Juan : la_fiesta=festen de=med las_hogueras>la_hoguera=bålene .',
      'En=i las_calles>la_calle=gatene hay=er_det hogueras>la_hoguera=bål enormes>enorme=enorme , de=av cartón>el_cartón=papp y de=i colores>el_color=farger .',
      'A_las_doce>doce=klokka_tolv de=om la_noche=natta , del=fra castillo>el_castillo=borgen sale>salir=stiger una_palmera>la_palmera=en_palme de=av fuego>el_fuego=ild .',
      'Y entonces=så queman>quemar=brenner_de las_hogueras>la_hoguera=bålene . ¡ Qué=for_en fuego>el_fuego=ild ! ¡Qué_ruido!>¡qué_ruido!=For_et_bråk!',
      'De_pronto=plutselig , los_bomberos>el_bombero=brannmennene echan>echar=spruter agua>el_agua=vann a=på todos>todo=alle .',
      '^Solveig abre>abrir=åpner su=sin paraguas>el_paraguas=paraply : ¡ por_si_acaso=for_sikkerhets_skyld !',
      '^Carmen está>estar=er mojada>mojado=våt de=fra la_cabeza=hodet a=til los_pies>el_pie=føttene … y se_ríe>reírse=ler .',
    ],
    questions: [
      {
        q: 'Hva synes Solveig om vannet i havet?',
        a: ['At det er varmt', 'At det er for kaldt', 'At det er skittent'],
      },
      {
        q: 'Hva skjer klokka tolv om natta?',
        a: [
          'Det skytes opp en palme av ild fra borgen, og bålene brennes',
          'Alle går og legger seg',
          'Det begynner å regne',
        ],
      },
      {
        q: 'Hvorfor åpner Solveig paraplyen?',
        a: [
          'Brannmennene spruter vann på alle',
          'Det begynner å regne',
          'Sola er for sterk',
        ],
      },
    ],
  },
  {
    id: 'viaje-valencia',
    title: 'Paella de domingo',
    no: 'Valencia: søndagspaella',
    lines: [
      'En=i ^Valencia vive>vivir=bor ^Amparo , la_prima=kusinen de=til ^Carmen , con=med su=sin marido>el_marido=mann , ^Vicent .',
      'El_domingo=på_søndag comen>comer=spiser_de en=i su=deres casa>la_casa=hus , en=i la_huerta=jordbrukslandet .',
      '^Vicent hace>hacer=lager la_paella=paellaen en=i la_paellera=pannen , con=med leña>la_leña=ved de=fra naranjo>el_naranjo=appelsintre .',
      'Echa>echar=han_har_i pollo>el_pollo=kylling , conejo>el_conejo=kanin , judías_verdes>las_judías_verdes=grønne_bønner , tomate>el_tomate=tomat , agua>el_agua=vann , azafrán>el_azafrán=safran y arroz>el_arroz=ris .',
      '— ¿ Y el_chorizo=chorizoen ? — pregunta>preguntar=spør ^Solveig .',
      'Nadie=ingen dice>decir=sier nada=noe . Todos>todo=alle la>lo=henne miran>mirar=ser_på .',
      '— ¿ Chorizo>el_chorizo=chorizo ? ¿ En=i la_paella=paellaen ? ¡ Nunca=aldri ! — dice>decir=sier ^Vicent .',
      '^Carmen se_ríe>reírse=ler . ^Vicent , no=ikke .',
      '^Vicent no=ikke remueve>remover=rører_i el_arroz=risen . Espera>esperar=han_venter .',
      'Al_final=til_slutt , el_arroz=risen que=som toca>tocar=ligger_mot la_paellera=pannen está>estar=er un_poco>poco=litt quemado>quemar=brent y crujiente=sprø : es>ser=det_er el_socarrat .',
      '— ¡ Es>ser=det_er lo=det más=mest rico=deilige ! — dice>decir=sier ^Amparo .',
      'Todos>todo=alle comen>comer=spiser de=fra la_paellera=pannen , con=med cucharas>la_cuchara=skjeer .',
      'Más_tarde>tarde=senere , la_sobremesa=praten_ved_bordet : café>el_café=kaffe , horchata>la_horchata fría>frío=kald … y hablan>hablar=de_snakker , y hablan>hablar=snakker .',
      'A_las_seis>seis=klokka_seks de=om la_tarde=ettermiddagen , nadie=ingen se_levanta>levantarse=reiser_seg de=fra la_mesa=bordet .',
    ],
    questions: [
      {
        q: 'Hvem lager paellaen?',
        a: ['Vicent, mannen til Amparo', 'Carmen', 'En kokk på en restaurant'],
      },
      {
        q: 'Hva spør Solveig om, som ingen liker?',
        a: [
          'Om det skal chorizo i paellaen',
          'Om det skal fisk i paellaen',
          'Om hun får røre i risen',
        ],
      },
      {
        q: 'Hva er socarrat?',
        a: [
          'Den sprø risen i bunnen av pannen',
          'En kald drikk av jordmandel',
          'En slags grønn bønne',
        ],
      },
    ],
  },
  {
    id: 'viaje-barcelona',
    title: 'Bon dia',
    no: 'Barcelona: god morgen',
    lines: [
      'En=på el_tren=toget a=til ^Barcelona , por=gjennom la_ventana=vinduet , ven>ver=ser_de el_mar=havet .',
      'En=på un_bar>el_bar=en_bar , el_camarero=servitøren dice>decir=sier « bon_dia=god_morgen » , y ^Solveig también=også : « ¡ Bon_dia>bon_dia=god_morgen ! » .',
      '— ¿Hablas_catalán?>¿hablas_catalán?=Snakker_du_katalansk? — pregunta>preguntar=spør él=han .',
      '— Un_poco>poco=litt : « bon_dia=god_morgen » , y nada=ingenting más=mer .',
      'En=i ^Barcelona hay=er_det dos idiomas>el_idioma=språk : la_ciudad=byen es>ser=er bilingüe=tospråklig .',
      'De=til desayuno>el_desayuno=frokost , pan_con_tomate>el_pan_con_tomate=brød_med_tomat y un_cortado>el_cortado .',
      'Por_la_mañana>la_mañana=om_formiddagen van>ir=går_de a=til la_Sagrada_Familia>la_Sagrada_Familia=Sagrada_Familia , la_iglesia=kirken del=til arquitecto>el_arquitecto=arkitekten ^Gaudí .',
      'Tiene>tener=den_er más=mer de=enn cien=hundre años>el_año=år_gammel , y no=ikke está>estar=er terminada>terminar=ferdig .',
      'En=i la_iglesia=kirken , las_columnas>la_columna=søylene son>ser=er como=som árboles>el_árbol=trær .',
      '— Como=som en=i ^Córdoba — dice>decir=sier ^Solveig ~ . ¡ Otro>otro=en_annen bosque>el_bosque=skog de=av piedra>la_piedra=stein !',
      'Por=gjennom las_ventanas>la_ventana=vinduene de=i colores>el_color=farger llega>llegar=kommer la_luz=lyset : verde=grønt y azul=blått , rojo=rødt y amarillo=gult .',
      '— ¿ Y cuándo=når la>lo=den terminan>terminar=blir_de_ferdige_med ? — pregunta>preguntar=spør ^Solveig .',
      '— Pronto=snart — dice>decir=sier ^Carmen , y se_ríe>reírse=ler ~ . Siempre=alltid dicen>decir=sier_de « pronto=snart » .',
      'Por_la_tarde>la_tarde=om_ettermiddagen andan>andar=går_de por=langs la_Rambla>la_Rambla=Rambla . Mañana=i_morgen , el_último>último=den_siste viaje>el_viaje=reisen : a=til ^Cadaqués .',
    ],
    questions: [
      {
        q: 'Hvor mye katalansk kan Solveig?',
        a: ['Bare «bon dia»', 'Mye, hun har lært det hjemme', 'Ikke ett ord'],
      },
      {
        q: 'Hva er søylene i Sagrada Familia som?',
        a: ['Trær', 'Bølger', 'Mennesker'],
      },
      {
        q: 'Når blir kirken ferdig, ifølge Carmen?',
        a: ['«Snart», som de alltid sier', 'Neste år', 'Den er ferdig'],
      },
    ],
  },
  {
    id: 'viaje-cadaques',
    title: 'El pueblo blanco',
    no: 'Cadaqués: den hvite landsbyen',
    lines: [
      'A=til ^Cadaqués no=ikke llega>llegar=går el_tren=toget : van>ir=de_reiser en=med autobús>el_autobús=buss .',
      'El_autobús=bussen sube>subir=går_opp y baja>bajar=ned por=over la_montaña=fjellet . ^Carmen cierra>cerrar=lukker los_ojos>el_ojo=øynene .',
      'Y entonces=så ven>ver=ser_de el_mar=havet y un_pueblo>el_pueblo=en_landsby blanco=hvit : es>ser=det_er ^Cadaqués .',
      'Las_casas>la_casa=husene son>ser=er blancas>blanco=hvite , las_calles>la_calle=gatene son>ser=er de=av piedra>la_piedra=stein , y todo=alt sube>subir=går_opp hacia=mot la_iglesia=kirken .',
      'En=på la_playa=stranden , los_pescadores>el_pescador=fiskerne tienen>tener=har sus>su=sine barcos>el_barco=båter , azules>azul=blå y blancos>blanco=hvite .',
      'Cerca=like_ved , en=i ^Portlligat , está>estar=er la_casa=huset de=til ^Salvador_Dalí : una_casa>la_casa=et_hus blanca>blanco=hvitt con=med huevos>el_huevo=egg enormes>enorme=enorme .',
      '— ^Dalí vivía>vivir=bodde allí=der — dice>decir=sier ^Carmen ~ . Pintaba>pintar=han_malte este=dette mar>el_mar=havet y estas>este=disse rocas>la_roca=klippene .',
      'Por_la_noche>la_noche=om_kvelden llega>llegar=kommer la_tramontana=tramontanaen , el_viento=vinden del=fra norte>el_norte=nord .',
      'Aquí=her dicen>decir=sier_de que=at la_tramontana=tramontanaen vuelve>volver=gjør loco=gale a_todo_el_mundo>el_mundo=alle .',
      '— ¡ Pobre=stakkars ^Dalí ! — dice>decir=sier ^Carmen .',
      'De_pronto=plutselig , el_viento=vinden coge>coger=griper el_paraguas=paraplyen de=til ^Solveig … y se_lo_lleva>llevar=tar_den_med al=ut_på mar>el_mar=havet .',
      '— ¡ Adiós=ha_det , paraguas>el_paraguas=paraply ! — dice>decir=sier ^Solveig , y se_ríe>reírse=ler .',
    ],
    questions: [
      {
        q: 'Hvordan kommer de til Cadaqués?',
        a: ['Med buss over fjellet', 'Med tog', 'Med båt'],
      },
      {
        q: 'Hva er det med Dalís hus i Portlligat?',
        a: [
          'Det er hvitt, med enorme egg',
          'Det er rødt, med et tårn',
          'Det står på en øy',
        ],
      },
      {
        q: 'Hva skjer med paraplyen til Solveig?',
        a: [
          'Vinden tar den med ut på havet',
          'Hun gir den til Carmen',
          'Den blir igjen på bussen',
        ],
      },
    ],
  },
  {
    id: 'viaje-creus',
    title: 'Donde sale el sol',
    no: 'Cap de Creus: der sola står opp',
    lines: [
      'Hoy=i_dag ^Carmen madruga>madrugar=står_opp_tidlig : se_levanta>levantarse=hun_står_opp a_las_cinco>cinco=klokka_fem . ¡ ^Carmen , que=som siempre=alltid llega>llegar=kommer tarde=sent !',
      'Van>ir=de_drar en=med taxi>el_taxi=taxi al=til ^Cap_de_Creus . Aquí=her , ^España termina>terminar=slutter en=i el_mar=havet .',
      'Dicen>decir=de_sier que=at aquí=her , en=i ^España , el_sol=sola sale>salir=står_opp primero>primero=først .',
      'Hay=det_er un_faro>el_faro=et_fyr , rocas>la_roca=klipper raras>raro=rare , y hace_frío=det_er_kaldt .',
      'Las_dos>dos=de_to amigas>la_amiga=venninnene esperan>esperar=venter , y no=ikke hablan>hablar=snakker .',
      'Y entonces=da , el_sol=sola sale>salir=stiger del=opp_av mar>el_mar=havet : rojo=rød y dorado=gyllen .',
      '— El_viaje=reisen empieza>empezar=begynner en=på ^la_Puerta_del_Sol — dice>decir=sier ^Carmen ~ y termina>terminar=slutter aquí=her , donde>dónde=der sale>salir=står_opp el_sol=sola .',
      '— Y todo_el_viaje>el_viaje=hele_reisen , con=med mi=min ^Sol — dice>decir=sier , y coge>coger=tar la_mano=hånden de=til su=sin amiga>la_amiga=venninne .',
      '^Solveig no=ikke tiene>tener=har paraguas>el_paraguas=paraply . No=ikke lo=den necesita>necesitar=trenger .',
      '— El_año_que_viene>el_año=neste_år , ¿ vienes>venir=kommer_du a=til ^Bergen ? — pregunta>preguntar=spør ^Solveig .',
      '— Vale=ok — dice>decir=sier ^Carmen ~ . Pero yo=jeg llevo>llevar=tar_med el_paraguas=paraplyen .',
    ],
    questions: [
      {
        q: 'Hvorfor er det rart at Carmen står opp så tidlig?',
        a: [
          'Hun kommer alltid for sent',
          'Hun sover aldri',
          'Hun er redd for mørket',
        ],
      },
      {
        q: 'Hva sier man om Cap de Creus?',
        a: [
          'At sola står opp der først i Spania',
          'At det aldri blåser der',
          'At Dalí ble født der',
        ],
      },
      {
        q: 'Hva svarer Carmen når Solveig spør om hun kommer til Bergen?',
        a: [
          'Ja, men hun tar med paraplyen',
          'Nei, det er for kaldt',
          'At hun ikke vet',
        ],
      },
    ],
  },
]
