// Bécquer's Leyendas, told simply: four of the legends, in ten short
// chapters. The lines are mixed text, written in the markup described at
// the top of data/quijote.ts. The legends are retold, not quoted, except
// the first line of El monte de las ánimas, which opens the story. The
// words they need that the bank did not have are the lesson «becquer» in
// data/words.ts.

import type { Chapter } from './stories.ts'

export const CHAPTERS: Array<Chapter> = [
  {
    id: 'leyendas-monte',
    title: 'El monte de las ánimas',
    no: 'Sjelenes fjell',
    from: 'El monte de las ánimas',
    lines: [
      '« La_noche_de_difuntos me=meg despertó>despertar=vekket a=på no_sé>saber=jeg_vet_ikke qué=hvilken hora>la_hora=tid el_doble=sjeleringen de=av las_campanas>la_campana=klokkene » , escribe>escribir=skriver ^Bécquer .',
      'Al_oír>oír=da_han_hører las_campanas>la_campana=klokkene , se_acuerda>acordarse=husker_han de=på una_leyenda>la_leyenda=et_sagn de=fra ^Soria .',
      '^Alonso y su=hans prima>la_prima=kusine ^Beatriz vuelven>volver=kommer_tilbake de=fra cazar=jakt en=på el_monte=fjellet , cerca_de>cerca=nær ^Soria .',
      'Es>ser=det_er tarde=sent , hace_frío , y los_árboles>el_árbol=trærne se_mueven>moverse=beveger_seg con=i el_viento=vinden .',
      '— Vamos>ir=la_oss_dra a_casa>la_casa=hjem , ^Beatriz — dice>decir=sier ^Alonso ~ . Esta_noche>la_noche=i_natt es>ser=er la_noche_de_difuntos .',
      '— ¿ Y qué=hva_så ? — pregunta>preguntar=spør ella .',
      '— Este=dette es>ser=er el_monte=fjellet de=til las_ánimas>el_ánima=sjelene — dice>decir=sier él .',
      '— Hace>hacer=for muchos>mucho=mange años>el_año=år_siden , aquí=her lucharon>luchar=kjempet los_templarios>el_templario=tempelridderne y los_caballeros>el_caballero=ridderne de=fra ^Soria .',
      '— Murieron>morir=døde muchos>mucho=mange , y sus>su=deres tumbas>la_tumba=graver están>estar=er en=i la_iglesia=kirken vieja>viejo=gamle del=på monte>el_monte=fjellet .',
      '— Y la_noche_de_difuntos=i_de_dødes_natt , la_campana=klokken de=i la_iglesia=kirken suena>sonar=ringer sola>solo=av_seg_selv .',
      '— Los_muertos>muerto=de_døde se_levantan>levantarse=reiser_seg de=fra sus>su=sine tumbas>la_tumba=graver y luchan>luchar=kjemper otra_vez=igjen entre=mellom los_árboles>el_árbol=trærne .',
      '— ¡ Qué=så miedo>el_miedo=skummelt ! — dice>decir=sier ^Beatriz . Pero no tiene>tener=er_hun miedo>el_miedo=redd .',
      'Los_dos>dos=de_to vuelven>volver=rir_tilbake rápido=fort a ^Soria . Cae>caer=faller la_noche=natten .',
    ],
    questions: [
      {
        q: 'Hvem er Beatriz?',
        a: ['Kusinen til Alonso', 'Søsteren til Alonso', 'En nonne fra Soria'],
      },
      {
        q: 'Hva gjør de døde på fjellet i de dødes natt, ifølge sagnet?',
        a: [
          'De reiser seg fra gravene og kjemper igjen',
          'De synger i kirken',
          'De går ned til byen',
        ],
      },
      {
        q: 'Hva gjør klokken i den gamle kirken den natten?',
        a: ['Den ringer av seg selv', 'Den faller ned', 'Den tier'],
      },
    ],
  },
  {
    id: 'leyendas-banda',
    title: 'La banda azul',
    no: 'Det blå båndet',
    from: 'El monte de las ánimas',
    lines: [
      'En_casa>la_casa=hjemme , la_familia=familien está>estar=sitter cerca_del>cerca=nær fuego>el_fuego=ilden .',
      'En=i la_ciudad=byen suenan>sonar=ringer las_campanas>la_campana=klokkene de=i todas>todo=alle las_iglesias>la_iglesia=kirkene .',
      '^Alonso quiere_a>querer=elsker ^Beatriz , pero ella es>ser=er fría>frío=kald con=mot él=ham .',
      '— ^Beatriz , quiero>querer=jeg_vil darte>dar=gi_deg un_regalo>el_regalo=en_gave — dice>decir=sier ^Alonso .',
      'Le=henne da>dar=gir_han una_joya>la_joya=et_smykke : la_joya=smykket de=på su=sin sombrero>el_sombrero=hatt .',
      '— Gracias — dice>decir=sier ella ~ . Yo también quiero>querer=vil darte>dar=gi_deg algo=noe : mi=mitt banda>la_banda=bånd azul=blå .',
      'Busca>buscar=hun_leter_etter la_banda=båndet , pero no la>lo=det encuentra>encontrar=finner .',
      '— La>lo=det he_perdido>perder=har_jeg_mistet en=på el_monte=fjellet — dice>decir=sier .',
      'Mira_a>mirar=hun_ser_på ^Alonso : — ¿ Tienes>tener=er_du miedo>el_miedo=redd de=for las_ánimas>el_ánima=sjelene ?',
      '^Alonso está>estar=er pálido=blek . Es>ser=det_er la_noche_de_difuntos , y el_monte=fjellet está>estar=er lejos=langt_unna .',
      'Pero un_caballero>el_caballero=en_ridder no tiene>tener=er miedo>el_miedo=redd .',
      'Coge>coger=han_tar su=sin caballo>el_caballo=hest y sale>salir=rir hacia=mot el_monte=fjellet .',
      '^Beatriz lo=ham mira>mirar=ser_etter por=gjennom la_ventana=vinduet . Pronto=snart no ve>ver=ser_hun nada=ingenting : solo=bare la_noche=natten .',
    ],
    questions: [
      {
        q: 'Hva gir Alonso til Beatriz?',
        a: ['Smykket fra hatten sin', 'Et blått bånd', 'Hesten sin'],
      },
      {
        q: 'Hvor har Beatriz mistet det blå båndet?',
        a: ['På fjellet', 'I kirken', 'Ved elven'],
      },
      {
        q: 'Hvorfor rir Alonso ut i natten?',
        a: [
          'For å finne båndet hun har mistet',
          'For å jakte på hjort',
          'For å ringe med kirkeklokken',
        ],
      },
    ],
  },
  {
    id: 'leyendas-difuntos',
    title: 'La noche de difuntos',
    no: 'De dødes natt',
    from: 'El monte de las ánimas',
    lines: [
      '^Beatriz se_acuesta>acostarse=legger_seg , pero no puede>poder=kan_hun dormir=sove .',
      'Las_campanas>la_campana=klokkene suenan>sonar=ringer y suenan>sonar=ringer , y el_viento=vinden hace>hacer=lager ruido>el_ruido=støy en=i la_ventana=vinduet .',
      'Oye>oír=hun_hører pasos>el_paso=skritt en=i la_casa=huset , y puertas>la_puerta=dører que=som se_abren>abrir=åpner_seg .',
      'Una_voz>la_voz=en_stemme la>lo=henne llama>llamar=kaller_på muy=veldig bajo=lavt : « ^Beatriz … ^Beatriz … » .',
      'Pero en=i la_habitación=rommet no hay=er_det nadie=ingen .',
      '^Beatriz cierra>cerrar=lukker los_ojos>el_ojo=øynene . Tiene>tener=hun_er mucho=veldig miedo>el_miedo=redd .',
      'Al_final , se_duerme>dormir=sovner_hun .',
      'Por_la_mañana>la_mañana=om_morgenen , ve>ver=ser_hun algo=noe cerca_de>cerca=nær su=sin cama>la_cama=seng : ¡ la_banda=båndet azul=blå !',
      'Está>estar=det_er rota>romper=revet , mojada>mojado=vått y fría>frío=kaldt .',
      '¿ Quién=hvem la>lo=det ha_puesto>poner=har_lagt aquí=her ? Y ^Alonso no ha_vuelto>volver=har_kommet_tilbake .',
      'Más_tarde>tarde=senere , llegan>llegar=kommer unos>uno=noen hombres>el_hombre=menn del=fra monte>el_monte=fjellet .',
      'Han_encontrado_a>encontrar=de_har_funnet ^Alonso entre=mellom los_árboles>el_árbol=trærne . Está>estar=han_er muerto=død .',
      'El_mismo>mismo=den_samme día>el_día=dagen , ^Beatriz muere>morir=dør de=av miedo>el_miedo=redsel .',
      'Y dicen>decir=de_sier que=at , la_noche_de_difuntos=i_de_dødes_natt , una_mujer>la_mujer=en_kvinne pálida>pálido=blek corre>correr=løper por=over el_monte=fjellet , cerca_de>cerca=nær la_tumba=graven de=til ^Alonso .',
    ],
    questions: [
      {
        q: 'Hva hører Beatriz om natten?',
        a: [
          'Skritt, dører og en stemme som kaller på henne',
          'Musikk fra kirken',
          'Alonso som synger under vinduet',
        ],
      },
      {
        q: 'Hva finner hun ved sengen om morgenen?',
        a: ['Det blå båndet', 'Smykket fra hatten', 'Et brev fra Alonso'],
      },
      {
        q: 'Hva sier folk at man ser på fjellet i de dødes natt?',
        a: [
          'En blek kvinne ved graven til Alonso',
          'Alonso på hesten sin',
          'Lys i alle vinduene i Soria',
        ],
      },
    ],
  },
  {
    id: 'leyendas-ciervo',
    title: 'El ciervo herido',
    no: 'Den sårede hjorten',
    from: 'Los ojos verdes',
    lines: [
      '^Fernando_de_Argensola es>ser=er un_caballero>el_caballero=en_ridder joven=ung , y le_gusta>gustar=han_liker mucho=veldig cazar=å_jakte .',
      'Un_día>el_día=en_dag , en=på el_monte=fjellet , sigue_a>seguir=følger_han un_ciervo>el_ciervo=en_hjort herido=såret .',
      'El_ciervo=hjorten corre>correr=løper hacia=mot una_fuente>la_fuente=en_kilde en=i el_bosque=skogen .',
      '— ¡ No , señor>el_señor=herre ! — dice>decir=sier ^Íñigo , un_cazador>el_cazador=en_jeger viejo=gammel ~ . ¡ A la_fuente=kilden , no=ikke !',
      '— En=i el_agua=vannet vive>vivir=bor un_espíritu>el_espíritu=en_ånd malo=ond .',
      'Pero ^Fernando no lo=ham escucha>escuchar=hører_på , y va>ir=går solo=alene hacia=mot la_fuente=kilden .',
      'Vuelve>volver=han_kommer_tilbake muy=veldig tarde=sent , pálido=blek , y no dice>decir=sier nada=noe .',
      'Ahora=nå ^Fernando no caza>cazar=jakter más=mer .',
      'Todos>todo=hver los_días>el_día=dag va>ir=går_han solo=alene a la_fuente=kilden , y mira>mirar=ser_på el_agua=vannet .',
      '^Íñigo tiene>tener=er miedo>el_miedo=redd por=for él=ham .',
      '— ¿ Qué=hva tiene>tener=feiler_det_Dem , señor>el_señor=herre ? — le=ham pregunta>preguntar=spør .',
      'Al_final , ^Fernando habla>hablar=snakker : — En=i el_agua=vannet de=i la_fuente=kilden vi>ver=så_jeg unos_ojos>el_ojo=noen_øyne …',
      '— Unos_ojos>el_ojo=øyne verdes>verde=grønne — dice>decir=sier ~ . ¡ Y quiero>querer=jeg_vil verlos>ver=se_dem otra_vez=igjen !',
    ],
    questions: [
      {
        q: 'Hva følger Fernando inn i skogen?',
        a: ['En såret hjort', 'En ulv', 'En hvit hest'],
      },
      {
        q: 'Hva sier Íñigo om kilden?',
        a: [
          'At en ond ånd bor i vannet',
          'At vannet er for kaldt',
          'At kilden er tørr',
        ],
      },
      {
        q: 'Hva så Fernando i vannet?',
        a: ['Grønne øyne', 'Sitt eget ansikt', 'En gyllen fisk'],
      },
    ],
  },
  {
    id: 'leyendas-ojos',
    title: 'Los ojos verdes',
    no: 'De grønne øynene',
    from: 'Los ojos verdes',
    lines: [
      'Una_tarde>la_tarde=en_kveld , ^Fernando ve_a>ver=ser una_mujer>la_mujer=en_kvinne en=på las_piedras>la_piedra=steinene de=ved la_fuente=kilden .',
      'Es>ser=hun_er muy=veldig hermosa>hermoso=vakker , con=med el_pelo=håret largo=langt y dorado=gyllent .',
      'Y tiene>tener=hun_har los_ojos>el_ojo=øynene verdes>verde=grønne : los_mismos>mismo=de_samme ojos>el_ojo=øynene del=fra agua>el_agua=vannet .',
      '— ¿ Quién eres>ser=er_du ? — pregunta>preguntar=spør ^Fernando ~ . ¿ Eres>ser=er_du una_mujer>la_mujer=en_kvinne o un_sueño>el_sueño=en_drøm ?',
      '— Vivo>vivir=jeg_bor en=på el_fondo=bunnen de=av esta>este=dette agua>el_agua=vannet — dice>decir=sier ella .',
      '— No soy>ser=er_jeg una_mujer>la_mujer=en_kvinne de=fra este=denne mundo>el_mundo=verden .',
      '— Te=deg quiero>querer=elsker_jeg , ^Fernando — dice>decir=sier ~ . Ven>venir=kom … ven>venir=kom …',
      '^Fernando da>dar=tar un_paso>el_paso=et_skritt hacia=mot ella=henne .',
      '— Ven>venir=kom … — dice>decir=sier la_voz=stemmen , muy=veldig dulce=søt . Y ^Fernando da>dar=tar otro=et_til paso>el_paso=skritt .',
      'Unos>uno=noen brazos>el_brazo=armer fríos>frío=kalde lo=ham cogen>coger=griper .',
      '^Fernando cae>caer=faller al=i agua>el_agua=vannet .',
      'El_agua=vannet se_cierra>cerrar=lukker_seg , y ^Fernando no sale>salir=kommer_opp más=mer .',
      'En=i el_agua=vannet , unos>uno=noen círculos>el_círculo=ringer de=av plata>la_plata=sølv se_hacen>hacer=blir grandes>grande=store , más=enda grandes>grande=større … , y mueren>morir=dør en=ved la_orilla=bredden .',
    ],
    questions: [
      {
        q: 'Hvem ser Fernando ved kilden?',
        a: [
          'En vakker kvinne med grønne øyne',
          'Den gamle jegeren Íñigo',
          'Hjorten fra jakten',
        ],
      },
      {
        q: 'Hvor sier kvinnen at hun bor?',
        a: ['På bunnen av vannet', 'I et slott i Soria', 'I skogen'],
      },
      {
        q: 'Hva skjer med Fernando til slutt?',
        a: [
          'Han faller i vannet og kommer aldri opp',
          'Han gifter seg med henne',
          'Han rir hjem til Íñigo',
        ],
      },
    ],
  },
  {
    id: 'leyendas-manrique',
    title: 'La mujer de blanco',
    no: 'Kvinnen i hvitt',
    from: 'El rayo de luna',
    lines: [
      '^Manrique es>ser=er un_poeta>el_poeta=en_dikter joven=ung de=fra ^Soria .',
      'Le_gusta>gustar=han_liker estar=å_være solo=alene , con=med sus>su=sine libros>el_libro=bøker y sus>su=sine sueños>el_sueño=drømmer .',
      'Sueña>soñar=han_drømmer con=om una_mujer>la_mujer=en_kvinne hermosa>hermoso=vakker y extraña>extraño=merkelig , pero no la>lo=henne encuentra>encontrar=finner .',
      'Es>ser=det_er una_noche>la_noche=en_natt de=om verano>el_verano=sommeren , con=med luna>la_luna=måne llena>lleno=full .',
      '^Manrique está>estar=er en=i la_iglesia=kirken vieja>viejo=gamle de=til los_templarios>el_templario=tempelridderne , cerca_del>cerca=nær río>el_río=elven .',
      'De_pronto , ve>ver=ser_han algo=noe blanco=hvitt entre=mellom los_árboles>el_árbol=trærne : ¿ el_vestido=kjolen de=til una_mujer>la_mujer=en_kvinne ?',
      '— ¡ Es>ser=det_er ella=henne ! — piensa>pensar=tenker_han ~ . ¡ La_mujer=kvinnen de=fra mis>mi=mine sueños>el_sueño=drømmer !',
      'Corre>correr=han_løper hacia=mot ella=henne , pero allí=der no hay=er_det nadie=noen .',
      'Entonces=så la>lo=henne ve>ver=ser_han otra_vez=igjen , más=lenger lejos=unna , y la>lo=henne sigue>seguir=følger .',
      'La>lo=henne busca>buscar=leter_han_etter por=i todas>todo=alle las_calles>la_calle=gatene de=i ^Soria .',
      'Al_final , ve>ver=ser_han luz>la_luz=lys en=i la_ventana=vinduet de=til una_casa>la_casa=et_hus grande=stort .',
      '— Allí=der vive>vivir=bor ella — piensa>pensar=tenker . Y espera>esperar=han_venter toda>todo=hele la_noche=natten .',
      'Por_la_mañana>la_mañana=om_morgenen , pregunta>preguntar=spør_han : — ¿ Quién vive>vivir=bor en=i esta>este=dette casa>la_casa=huset ?',
      '— ^Don_Alonso_de_Valdecuellos , el_cazador=jegeren del=til rey>el_rey=kongen . Vive>vivir=han_bor solo=alene , sin=uten mujer>la_mujer=kone .',
    ],
    questions: [
      {
        q: 'Hva liker Manrique best?',
        a: [
          'Å være alene med bøkene og drømmene sine',
          'Fester og dans',
          'Å jakte med kongen',
        ],
      },
      {
        q: 'Hva ser han ved den gamle kirken?',
        a: ['Noe hvitt mellom trærne', 'En såret hjort', 'En blek ridder'],
      },
      {
        q: 'Hvem bor i huset med lys i vinduet?',
        a: [
          'Kongens jeger, som bor alene',
          'Kvinnen han drømmer om',
          'Moren til Manrique',
        ],
      },
    ],
  },
  {
    id: 'leyendas-rayo',
    title: 'El rayo de luna',
    no: 'Månestrålen',
    from: 'El rayo de luna',
    lines: [
      '^Manrique busca_a>buscar=leter_etter la_mujer=kvinnen de=i blanco=hvitt por=i toda>todo=hele ^Soria .',
      'No come>comer=han_spiser , no duerme>dormir=sover : solo=bare piensa>pensar=tenker en=på ella=henne .',
      'Una_noche>la_noche=en_natt , cerca_del>cerca=nær río>el_río=elven , ve>ver=ser_han otra_vez=igjen algo=noe blanco=hvitt entre=mellom los_árboles>el_árbol=trærne .',
      '— ¡ Es>ser=det_er ella=henne ! — piensa>pensar=tenker_han , y corre>correr=løper .',
      'Llega>llegar=han_kommer_fram , mira>mirar=ser … y no hay=er_det nadie=noen .',
      'Solo=bare hay=er_det un_rayo>el_rayo=en_stråle de=fra luna>la_luna=månen entre=mellom las_ramas>la_rama=grenene .',
      'Las_ramas>la_rama=grenene se_mueven>moverse=beveger_seg con=i el_viento=vinden , y la_luz=lyset blanca>blanco=hvite se_mueve>moverse=beveger_seg con=med ellas>ellos=dem .',
      'La_mujer=kvinnen de=fra sus>su=hans sueños>el_sueño=drømmer es>ser=er un_rayo>el_rayo=en_stråle de=fra luna>la_luna=månen .',
      '^Manrique no se_mueve>moverse=rører_seg . No dice>decir=sier nada=noe .',
      'Y nunca=aldri más=mer busca>buscar=leter_han_etter nada=noe .',
      'Todos>todo=alle le=med_ham hablan>hablar=snakker de=om amor>el_amor=kjærlighet y de=om gloria>la_gloria=ære , pero él dice>decir=sier :',
      '— Todo=alt es>ser=er un_rayo>el_rayo=en_stråle de=fra luna>la_luna=månen .',
      'Todos>todo=alle dicen>decir=sier que=at ^Manrique está>estar=er loco=gal .',
      'Pero ^Bécquer cree>creer=tror que=at no=ikke : cree>creer=tror que=at ahora=nå ^Manrique ve>ver=ser claro=klart .',
    ],
    questions: [
      {
        q: 'Hva er det hvite Manrique ser mellom trærne?',
        a: ['En månestråle', 'Kjolen til en kvinne', 'En hvit hest'],
      },
      {
        q: 'Hva svarer han når folk snakker om kjærlighet og ære?',
        a: [
          'At alt er en månestråle',
          'At han skal gifte seg',
          'At han vil bli ridder',
        ],
      },
      {
        q: 'Hva tror Bécquer om Manrique til slutt?',
        a: [
          'At han nå ser klart',
          'At han er gal',
          'At han finner kvinnen igjen',
        ],
      },
    ],
  },
  {
    id: 'leyendas-nochebuena',
    title: 'La Nochebuena',
    no: 'Julaften',
    from: 'Maese Pérez el organista',
    lines: [
      '^Sevilla , hace>hacer=for muchos>mucho=mange años>el_año=år_siden . Es>ser=det_er Nochebuena>la_Nochebuena=julaften .',
      'Toda>todo=hele la_ciudad=byen va>ir=går a la_misa_del_gallo=midnattsmessen en=i el_convento=klosteret de=til ^Santa_Inés .',
      'Todos>todo=alle quieren>querer=vil oír_a>oír=høre ^maese_Pérez , el_organista=organisten .',
      '^Maese_Pérez es>ser=er viejo=gammel y ciego=blind , pero nadie=ingen toca>tocar=spiller el_órgano=orgel como=slik_som él=han .',
      'Vive>vivir=han_bor con=med su=sin hija>la_hija=datter , y son>ser=de_er pobres>pobre=fattige .',
      'Este=dette año>el_año=året , ^maese_Pérez está>estar=er muy=veldig enfermo=syk .',
      'El_organista=organisten de=fra ^San_Román es>ser=er un_hombre>el_hombre=en_mann malo=slem , que=som habla>hablar=snakker mal=stygt de=om todos>todo=alle .',
      '— Esta_noche>la_noche=i_natt toco>tocar=spiller yo=jeg — dice>decir=sier , muy=veldig contento=fornøyd .',
      'La_iglesia=kirken está>estar=er llena>lleno=full . Llega>llegar=det_blir la_medianoche=midnatt .',
      'De_pronto , se_abre>abrir=åpnes la_puerta=døren .',
      'Unos>uno=noen hombres>el_hombre=menn llevan_a>llevar=bærer ^maese_Pérez en=i una_silla>la_silla=en_stol .',
      'Está>estar=han_er muy=veldig pálido=blek , pero dice>decir=sier : — Es>ser=det_er mi=mitt órgano>el_órgano=orgel . Esta_noche>la_noche=i_natt toco>tocar=spiller yo=jeg .',
      '— Creo>creer=jeg_tror que=at es>ser=det_er mi=min última>último=siste Nochebuena>la_Nochebuena=julaften .',
      'El_organista=organisten de=fra ^San_Román no dice>decir=sier nada=noe , y se_va>ir=går .',
    ],
    questions: [
      {
        q: 'Hvorfor kommer hele byen til midnattsmessen?',
        a: [
          'For å høre maese Pérez spille orgel',
          'For å se en ny prest',
          'For å synge julesanger på torget',
        ],
      },
      {
        q: 'Hvordan er maese Pérez dette året?',
        a: ['Gammel, blind og syk', 'Ung og rik', 'Sint og misunnelig'],
      },
      {
        q: 'Hvordan kommer han til kirken?',
        a: [
          'Noen menn bærer ham i en stol',
          'Han rir på et esel',
          'Han går alene',
        ],
      },
    ],
  },
  {
    id: 'leyendas-misa',
    title: 'La misa del gallo',
    no: 'Midnattsmessen',
    from: 'Maese Pérez el organista',
    lines: [
      'Empieza>empezar=begynner la_misa=messen . ^Maese_Pérez pone>poner=legger las_manos>la_mano=hendene en=på el_órgano=orgelet .',
      'Y el_órgano=orgelet suena>sonar=lyder como=som nunca=aldri_før .',
      'Es>ser=det_er una_música>la_música=musikk dulce=søt y triste=trist , una_música>la_música=musikk del=fra cielo>el_cielo=himmelen .',
      'En=i la_iglesia=kirken nadie=ingen habla>hablar=snakker . Muchos>mucho=mange lloran>llorar=gråter .',
      'Su=hans hija>la_hija=datter lo=ham mira>mirar=ser_på y tiene>tener=er miedo>el_miedo=redd : su=hennes padre>el_padre=far está>estar=er muy=veldig pálido=blek .',
      'La_música=musikken sube>subir=stiger y sube>subir=stiger , más=mer y más=mer hermosa>hermoso=vakker …',
      'De_pronto : silencio>el_silencio=stillhet .',
      'Se_oye>oír=det_høres un_grito>el_grito=et_skrik . Es>ser=det_er la_hija=datteren de=til ^maese_Pérez .',
      'Todos>todo=alle corren>correr=løper hacia=mot el_órgano=orgelet .',
      '^Maese_Pérez está>estar=sitter allí=der , con=med las_manos>la_mano=hendene en=på el_órgano=orgelet .',
      'Pero no se_mueve>moverse=rører_seg : está>estar=han_er muerto=død .',
      'Ha_muerto>morir=han_har_dødd con=med su=sin música>la_música=musikk , como=slik_som él quería>querer=ville .',
      'Y las_campanas>la_campana=klokkene de=i ^Sevilla suenan>sonar=ringer por=for él=ham .',
    ],
    questions: [
      {
        q: 'Hvordan lyder orgelet denne natten?',
        a: ['Som aldri før, søtt og trist', 'Falskt og stygt', 'Altfor høyt'],
      },
      {
        q: 'Hva skjer når musikken plutselig stanser?',
        a: [
          'Datteren skriker, og maese Pérez er død',
          'Alle klapper og ler',
          'Organisten fra San Román tar over',
        ],
      },
      {
        q: 'Hvordan dør maese Pérez?',
        a: [
          'Ved orgelet, med musikken sin',
          'I sengen sin hjemme',
          'På vei til kirken',
        ],
      },
    ],
  },
  {
    id: 'leyendas-organo',
    title: 'El órgano',
    no: 'Orgelet',
    from: 'Maese Pérez el organista',
    lines: [
      'Un_año>el_año=et_år más_tarde>tarde=senere , es>ser=er_det Nochebuena>la_Nochebuena=julaften otra_vez=igjen .',
      'Este=dette año>el_año=året toca>tocar=spiller el_organista=organisten de=fra ^San_Román .',
      'Muchos>mucho=mange van>ir=går a la_misa=messen para=for_å hacer=lage ruido>el_ruido=bråk y reírse=le de=av él=ham .',
      'Pero el_órgano=orgelet suena>sonar=lyder como=som en=i los_años>el_año=årene de=til ^maese_Pérez , y nadie=ingen hace>hacer=lager ruido>el_ruido=bråk .',
      '— No_es>ser=det_er_ikke su=hans música>la_música=musikk — dicen>decir=sier todos>todo=alle muy=veldig bajo=lavt ~ . Es>ser=det_er la_música=musikken de=til ^maese_Pérez .',
      'Llega>llegar=det_kommer otra>otro=en_ny Nochebuena>la_Nochebuena=julaften .',
      'La_hija=datteren de=til ^maese_Pérez vive>vivir=bor ahora=nå en=i el_convento=klosteret : va_a>ir=hun_skal ser=bli monja>la_monja=nonne .',
      'Esta_noche>la_noche=i_natt , ella va_a>ir=skal tocar=spille el_órgano=orgelet , pero tiene>tener=hun_er miedo>el_miedo=redd .',
      '— Ayer=i_går por_la_noche>la_noche=kveld vi_a>ver=så_jeg mi=min padre>el_padre=far en=ved el_órgano=orgelet — dice>decir=sier ~ . Tocaba>tocar=han_spilte una_música>la_música=en_musikk muy=veldig triste=trist .',
      'Llega>llegar=det_blir la_medianoche=midnatt , y empieza>empezar=begynner la_misa=messen .',
      'Ella toca>tocar=spiller , pero no está>estar=er sola>solo=alene : otras>otro=andre manos>la_mano=hender tocan>tocar=spiller con=med ella=henne .',
      'Llena>lleno=full de=av miedo>el_miedo=frykt , se_levanta>levantarse=reiser_hun_seg .',
      'Pero el_órgano=orgelet suena>sonar=spiller solo=av_seg_selv , más=mer hermoso=vakkert que=enn nunca=noen_gang .',
      '— ¡ Es>ser=det_er mi=min padre>el_padre=far ! — dice>decir=sier la_hija=datteren , y llora>llorar=gråter ~ . ¡ Es>ser=det_er mi=min padre>el_padre=far , que=som toca>tocar=spiller !',
    ],
    questions: [
      {
        q: 'Hva skjer når organisten fra San Román spiller?',
        a: [
          'Orgelet lyder som i maese Pérez’ tid',
          'Folk ler og lager bråk hele messen',
          'Orgelet går i stykker',
        ],
      },
      {
        q: 'Hva så datteren kvelden før?',
        a: ['Faren sin ved orgelet', 'Et lys i vinduet', 'En hvit hjort'],
      },
      {
        q: 'Hva gjør orgelet når datteren reiser seg?',
        a: [
          'Det spiller videre av seg selv',
          'Det blir stille',
          'Det faller sammen',
        ],
      },
    ],
  },
]
