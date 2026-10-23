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
  {
    id: 'tapeo',
    es: 'En el bar de tapas',
    no: 'På tapasbaren',
    words: `
      la barra | bardisk
      la terraza | uteservering, terrasse
      la carta | meny, brev
      la caña | liten fatøl
      el refresco | brus
      la bebida | drikk
      la ración | porsjon
      la media ración | halv porsjon
      la servilleta | serviett
      la ronda | runde
      la propina | tips
      pedir | bestille, be om | v
      poner | sette, legge | v
      probar | smake, prøve | v
      picar | småspise, stikke | v
      compartir | dele | v
      invitar | spandere, invitere | v
      cobrar | ta betalt | v
      ¿qué te pongo? | hva skal det være? | expr
      ¿me pones una caña? | kan jeg få en liten øl? | expr
      para llevar | til å ta med | expr
      ¡que aproveche! | god appetitt! | expr
      la cuenta, por favor | kan jeg få regningen? | expr
    `,
  },
  {
    id: 'compras',
    es: 'El mercado y la tienda',
    no: 'Markedet og butikken',
    words: `
      el puesto | bod, stilling
      la frutería | fruktbutikk
      la carnicería | slakterbutikk
      la pescadería | fiskebutikk
      la panadería | bakeri
      el supermercado | supermarked
      la fruta | frukt
      la verdura | grønnsaker
      el kilo | kilo
      el gramo | gram
      medio | halv | adj
      la docena | dusin
      la bolsa | pose
      el precio | pris
      el euro | euro
      la oferta | tilbud
      la caja | kasse, eske
      la tarjeta | bankkort, kort
      el efectivo | kontanter
      el cambio | vekslepenger, endring
      costar | koste | v
      pesar | veie | v
      barato | billig | adj
      caro | dyr | adj
      fresco | fersk, kjølig | adj
      maduro | moden | adj
      ¿quién es el último? | hvem er sist i køen? | expr
      ¿cuánto cuesta? | hva koster det? | expr
      ¿algo más? | noe mer? | expr
      hacer la compra | handle mat | expr
    `,
  },
  {
    id: 'transporte',
    es: 'Tren, autobús y taxi',
    no: 'Tog, buss og taxi',
    words: `
      el metro | T-bane, meter
      el taxi | taxi, drosje
      el taxista | taxisjåfør
      el aeropuerto | flyplass
      la parada | holdeplass, stopp
      la línea | linje
      el andén | perrong
      la vía | spor, vei
      el vagón | vogn
      el asiento | sete, plass
      la taquilla | billettluke
      el horario | rutetabell, åpningstider
      la salida | avgang, utgang
      la llegada | ankomst
      el retraso | forsinkelse
      el conductor | sjåfør
      la dirección | adresse, retning
      coger | ta (bussen), gripe | v
      subir | gå opp, gå på | v
      bajar | gå ned, gå av | v
      cambiar | bytte, endre | v
      libre | ledig, fri | adj
      directo | direkte | adj
      próximo | neste | adj
      ida y vuelta | tur-retur | expr
      solo ida | bare én vei | expr
      ¿a qué hora sale el tren? | når går toget? | expr
    `,
  },
  {
    id: 'parientes',
    es: 'Parientes y fiestas',
    no: 'Slekt og familiefester',
    words: `
      el nieto | barnebarn (gutt)
      la nieta | barnebarn (jente)
      los nietos | barnebarn
      el sobrino | nevø
      la sobrina | niese
      el suegro | svigerfar
      la suegra | svigermor
      el yerno | svigersønn
      la nuera | svigerdatter
      el cuñado | svoger
      la cuñada | svigerinne
      la esposa | kone
      la pareja | partner, par
      el novio | kjæreste (mann), brudgom
      la novia | kjæreste (kvinne), brud
      el padrino | gudfar
      la madrina | gudmor
      la boda | bryllup
      el bautizo | dåp
      el cumpleaños | bursdag
      la fiesta | fest
      el regalo | gave
      la Nochebuena | julaften
      la Navidad | jul
      la Nochevieja | nyttårsaften
      celebrar | feire | v
      casarse | gifte seg | v
      cuidar | passe på, ta vare på | v
      ¡felicidades! | gratulerer! | expr
      ¡feliz cumpleaños! | gratulerer med dagen! | expr
    `,
  },
  {
    id: 'clima',
    es: '¿Qué tiempo hace?',
    no: 'Været og årstidene',
    words: `
      el clima | klima
      el pronóstico | værvarsel
      la temperatura | temperatur
      el grado | grad
      hace buen tiempo | det er fint vær | expr
      hace sol | sola skinner | expr
      hace calor | det er varmt | expr
      hace frío | det er kaldt | expr
      hace viento | det blåser | expr
      soleado | solrik | adj
      nublado | overskyet | adj
      llover | regne | v
      nevar | snø | v
      la llovizna | yr
      la tormenta | tordenvær, storm
      el trueno | torden
      el relámpago | lyn
      el arcoíris | regnbue
      el paraguas | paraply
      mojado | våt | adj
      seco | tørr | adj
      húmedo | fuktig | adj
      templado | mild, lunken | adj
      la niebla | tåke
      el granizo | hagl
      la helada | frost
      la ola de calor | hetebølge
    `,
  },
  {
    id: 'horarios',
    es: 'Horarios españoles',
    no: 'Spanske tider',
    words: `
      madrugar | stå opp tidlig | v
      despertarse | våkne | v
      levantarse | stå opp | v
      el desayuno | frokost
      desayunar | spise frokost | v
      el café con leche | kaffe med melk
      el cortado | kaffe med en skvett melk
      la tostada | ristet brød
      el almuerzo | formiddagsmat, lunsj
      el bocadillo | baguettesmørbrød
      el aperitivo | aperitiff
      el mediodía | midt på dagen
      el menú del día | dagens meny
      la sobremesa | prat ved bordet etter maten
      la siesta | middagslur
      la merienda | ettermiddagsmat
      la cena | kveldsmat, middag
      cenar | spise kveldsmat | v
      trasnochar | være oppe sent | v
      la madrugada | småtimene
      acostarse | legge seg | v
      abierto | åpen | adj
      cerrado | stengt | adj
      el fin de semana | helg
      el festivo | helligdag
      las vacaciones | ferie
      ¿qué hora es? | hva er klokka? | expr
      son las dos | klokka er to | expr
      a las diez | klokka ti | expr
    `,
  },
  {
    id: 'tramites',
    es: 'Trámites y colas',
    no: 'Byråkrati og køer',
    words: `
      la cola | kø
      el turno | tur, skift
      la ventanilla | luke, lite vindu
      la cita previa | timeavtale
      la oficina | kontor
      el ayuntamiento | rådhus, kommune
      el funcionario | offentlig ansatt
      el trámite | formalitet
      el papeleo | papirarbeid
      el documento | dokument
      el formulario | skjema
      el apellido | etternavn
      la fecha | dato
      el móvil | mobil
      el NIE | ID-nummer for utlendinger
      la fotocopia | kopi
      la firma | underskrift
      el sello | stempel, frimerke
      el justificante | bekreftelse, kvittering
      el plazo | frist
      rellenar | fylle ut | v
      firmar | skrive under | v
      solicitar | søke om | v
      atender | betjene, ta imot | v
      tardar | ta tid | v
      ¿me puede ayudar? | kan De hjelpe meg? | expr
      no funciona | det virker ikke | expr
      vuelva usted mañana | kom tilbake i morgen | expr
    `,
  },
  {
    id: 'tapas',
    es: 'Tapas y pintxos',
    no: 'Tapas og pintxos',
    words: `
      el pintxo | baskisk smårett
      el montadito | lite smørbrød
      el palillo | tannpirker
      la cazuela | leirgryte
      las croquetas | kroketter
      las patatas bravas | poteter med sterk saus
      las patatas fritas | pommes frites, potetgull
      la ensaladilla rusa | potetsalat med majones
      las albóndigas | kjøttboller
      los pimientos de Padrón | små grønne paprikaer
      las gambas al ajillo | hvitløksreker
      los calamares | blekksprutringer, akkar
      los boquerones | ferske ansjoser
      el alioli | hvitløksmajones
      la salsa | saus, salsa (musikk)
      picante | sterk (om mat) | adj
      frito | fritert | adj
      casero | hjemmelaget | adj
      a la plancha | stekt på plate | expr
      ¿pica? | er det sterkt? | expr
      ¿qué me recomienda? | hva anbefaler De? | expr
    `,
  },
  {
    id: 'paella',
    es: 'La paella y los arroces',
    no: 'Paella og risretter',
    words: `
      la paella | paella
      la paellera | paellapanne
      la leña | ved
      el caldo | kraft, buljong
      el azafrán | safran
      el pimentón | paprikapulver
      el romero | rosmarin
      el conejo | kanin
      las judías verdes | grønne bønner
      el socarrat | sprøstekt ris i bunnen
      el marisco | skalldyr, sjømat
      la gamba | reke
      el langostino | kongereke
      el mejillón | blåskjell
      la almeja | musling
      la sepia | sepiablekksprut
      el arroz negro | ris med blekksprutblekk
      el arroz con leche | søt risgrøt
      cocinar | lage mat | v
      echar | ha i, helle, kaste | v
      añadir | tilsette | v
      hervir | koke | v
      remover | røre (om) | v
      a fuego lento | på svak varme | expr
      en su punto | akkurat passe | expr
    `,
  },
  {
    id: 'tortilla',
    es: 'La tortilla de patatas',
    no: 'Tortilla de patatas',
    words: `
      la tortilla de patatas | potetomelett
      la cebolla | løk
      el aceite de oliva | olivenolje
      la sartén | stekepanne
      el bol | bolle
      la receta | oppskrift, resept
      pelar | skrelle | v
      cortar | skjære, kutte | v
      la rodaja | skive
      fino | fin, tynn | adj
      freír | steke (i olje) | v
      pochar | steke langsomt | v
      escurrir | la renne av, sile | v
      la yema | eggeplomme
      la clara | eggehvite
      batir | piske | v
      mezclar | blande | v
      una pizca de sal | en klype salt | expr
      darle la vuelta | snu den | expr
      crudo | rå | adj
      cuajado | stivnet | adj
      jugoso | saftig | adj
      ¿con cebolla o sin cebolla? | med eller uten løk? | expr
    `,
  },
  {
    id: 'churros',
    es: 'Churros con chocolate',
    no: 'Churros med sjokolade',
    words: `
      el churro | churros
      la porra | tykk churros, kølle
      la churrería | churrosbod
      la masa | deig
      la harina | mel
      crujiente | sprø | adj
      espolvorear | strø over | v
      el chocolate | sjokolade
      el chocolate a la taza | tykk drikkesjokolade
      la taza | kopp
      espeso | tykk (om væske) | adj
      mojar | dyppe, gjøre våt | v
      dulce | søt | adj
      un chocolate con churros | en sjokolade med churros | expr
      ¡qué rico! | så godt! | expr
      el bizcocho | sukkerbrød
      la magdalena | muffins
      la galleta | kjeks
      el flan | karamellpudding
      el helado | iskrem
      las torrijas | arme riddere
      el roscón de Reyes | kakekrans til trettende dag jul
    `,
  },
  {
    id: 'embutidos',
    es: 'Jamón, queso y embutidos',
    no: 'Skinke, ost og pølser',
    words: `
      el embutido | spekepølse, pølsevarer
      el jamón serrano | spekeskinke
      el jamón ibérico | skinke av iberisk gris
      el cerdo | gris
      la bellota | eikenøtt
      la dehesa | beitemark med eiker
      la pata | bein (på dyr)
      el jamonero | skinkestativ
      la loncha | tynn skive
      a cuchillo | skåret med kniv | expr
      el chorizo | paprikapølse
      el salchichón | pepperspekepølse
      el lomo | svinekam
      la morcilla | blodpølse
      la sobrasada | smørbar pølse fra Mallorca
      el fuet | tynn spekepølse
      la salchicha | pølse
      el queso manchego | sauost fra La Mancha
      la oveja | sau
      la cabra | geit
      la vaca | ku
      la tabla | fjøl, anretningsfat
      la grasa | fett
      curado | lagret, spekt | adj
      tierno | mør, myk | adj
      ahumado | røkt | adj
      salado | salt (om smak) | adj
      un poco más | litt mer | expr
    `,
  },
  {
    id: 'bebidas',
    es: 'Vino, vermut, sidra y horchata',
    no: 'Vin, vermut, sider og horchata',
    words: `
      el vino tinto | rødvin
      el vino blanco | hvitvin
      el vino rosado | rosévin
      ¿tinto o blanco? | rødvin eller hvitvin? | expr
      la copa | vinglass, drink
      la uva | drue
      la viña | vinmark
      la cosecha | innhøsting, årgang
      la bodega | vinkjeller
      el sacacorchos | korketrekker
      el cava | spansk musserende vin
      el jerez | sherry
      el vermut | vermut
      el hielo | is, isbiter
      el tinto de verano | rødvin med brus
      la sangría | sangria
      la sidra | sider
      escanciar | skjenke | v
      la horchata | jordmandeldrikk
      la chufa | jordmandel
      el mosto | druesaft
      sin alcohol | alkoholfri | expr
      brindar | skåle | v
      ¡salud! | skål! | expr
      servir | servere | v
      borracho | full, beruset | adj
      la resaca | bakrus
    `,
  },
  {
    id: 'latino',
    es: 'Comida latinoamericana',
    no: 'Latinamerikansk mat',
    words: `
      el maíz | mais
      la tortilla de maíz | maistortilla
      el taco | taco
      el frijol | bønne
      el aguacate | avokado
      el guacamole | avokadodipp
      el chile | chili
      sin picante | ikke sterk | expr
      el cilantro | koriander
      la lima | lime
      exprimir | presse | v
      el ceviche | limemarinert rå fisk
      la empanada | fylt pai
      la arepa | maiskake
      la papa | potet (i Latin-Amerika)
      la yuca | kassava
      el plátano macho | kokebanan
      enrollar | rulle sammen | v
      el asado | grillfest, stek
      el mate | mate (urtete)
      el dulce de leche | melkekaramell
      el cacao | kakao
      la piña | ananas
      el maracuyá | pasjonsfrukt
      para chuparse los dedos | til å slikke seg om munnen etter | expr
    `,
  },
  {
    id: 'cataluna',
    es: 'Barcelona y Cataluña',
    no: 'Barcelona og Catalonia',
    words: `
      el catalán | katalansk
      el idioma | språk
      bilingüe | tospråklig | adj
      bon dia | god morgen (på katalansk) | expr
      ¿hablas catalán? | snakker du katalansk? | expr
      la Rambla | promenadegaten i Barcelona
      el barrio | bydel, nabolag
      gótico | gotisk | adj
      el edificio | bygning
      la fachada | fasade
      la torre | tårn
      el arquitecto | arkitekt
      construir | bygge | v
      el modernismo | katalansk jugendstil
      la Sagrada Familia | Gaudís kirke
      el Park Güell | Gaudís park
      la Pedrera | Gaudís bygård (Casa Milà)
      el trencadís | skårmosaikk
      los castells | menneskepyramider
      la sardana | katalansk ringdans
      el día de Sant Jordi | Sant Jordi-dagen (roser og bøker)
      la rosa | rose
      la bandera | flagg
      el pan con tomate | brød med tomat
      la crema catalana | katalansk crème brûlée
      el fútbol | fotball
    `,
  },
  {
    id: 'andalucia',
    es: 'Andalucía',
    no: 'Andalucía',
    words: `
      el sur | sør
      la sierra | fjellkjede, sag
      el olivo | oliventre
      la Alhambra | maurisk borg i Granada
      la mezquita | moské
      árabe | arabisk | adj
      el siglo | århundre
      el arco | bue
      el patio | indre gård
      la fuente | fontene, kilde
      el azulejo | glasert flis
      a la sombra | i skyggen | expr
      el abanico | vifte
      el flamenco | flamenco, flamingo
      la guitarra | gitar
      el cante | flamencosang
      el baile | dans
      las palmas | håndklapp
      ¡olé! | bravo! | int
      ¿bailamos? | skal vi danse? | expr
      la cueva | hule
      la feria | folkefest, messe
      la Semana Santa | påskeuka
      la procesión | prosesjon
      el gazpacho | kald tomatsuppe
      el salmorejo | tykk kald tomatsuppe
      la sardina | sardin
      el espeto | sardinspyd
      ojalá | forhåpentligvis, gid | int
    `,
  },
  {
    id: 'galicia',
    es: 'Galicia y el Camino de Santiago',
    no: 'Galicia og Caminoen til Santiago',
    words: `
      el peregrino | pilegrim
      ¡buen camino! | god tur! | expr
      la credencial | pilegrimspass
      sellar | stemple | v
      el albergue | herberge
      la concha | skjell
      la vieira | kamskjell
      la flecha amarilla | gul pil (veimerke)
      caminar | vandre, gå | v
      la etapa | etappe
      el kilómetro | kilometer
      ¿cuántos kilómetros quedan? | hvor mange kilometer er det igjen? | expr
      la mochila | ryggsekk
      el bastón | stav, stokk
      la ampolla | gnagsår, vannblemme
      la catedral | katedral, domkirke
      el apóstol | apostel
      el botafumeiro | stort røkelseskar
      el norte | nord
      la costa | kyst
      el faro | fyrtårn
      el hórreo | stabbur
      la gaita | sekkepipe
      el pulpo | blekksprut
      la tarta de Santiago | mandelkake fra Santiago
      la morriña | hjemlengsel, vemod
    `,
  },
  {
    id: 'euskadi',
    es: 'El País Vasco',
    no: 'Baskerland',
    words: `
      el euskera | baskisk språk
      vasco | baskisk | adj
      kaixo | hei (på baskisk) | int
      agur | ha det (på baskisk) | int
      eskerrik asko | tusen takk (på baskisk) | expr
      ir de pintxos | gå på pintxosrunde | expr
      la gilda | spyd med oliven og ansjos
      el txakoli | baskisk hvitvin
      la sidrería | siderhus
      el bacalao | klippfisk, torsk
      la merluza | lysing
      la chuleta | kotelett
      el caserío | baskisk gård
      la boina | alpelue
      la pelota | ball
      el frontón | pelotabane
      la ría | elvemunning
      la bahía | bukt
      el barco | båt, skip
      el pescador | fisker
      el sirimiri | fint yr
      el Guggenheim | kunstmuseet i Bilbao
      el arte | kunst
      la escultura | skulptur
    `,
  },
  {
    id: 'valencia',
    es: 'Valencia: paella y Fallas',
    no: 'Valencia: paella og Fallas',
    words: `
      la huerta | vannet jordbruksland
      la acequia | vanningskanal
      la barraca | hus med stråtak, brakke
      el arrozal | rismark
      el naranjo | appelsintre
      el azahar | appelsinblomst
      la fideuá | nudelpaella
      las Fallas | Fallas-festen i mars
      la falla | figurgruppe som brennes
      el ninot | figur i en falla
      la fallera | kvinne i fallasdrakt
      el traje | drakt, dress
      la ofrenda | blomsteroffer, offergave
      el clavel | nellik
      la mascletá | smellshow med kinaputter
      el petardo | kinaputt
      la pólvora | krutt
      el ruido | bråk, støy
      ¡qué ruido! | for et bråk! | expr
      los fuegos artificiales | fyrverkeri
      la Cremá | brenningen av fallas
      quemar | brenne | v
      el humo | røyk
      el buñuelo | frityrbolle
      la calabaza | gresskar
      me encanta | jeg elsker det | expr
    `,
  },
  {
    id: 'murcia',
    es: 'Murcia',
    no: 'Murcia',
    words: `
      el limón | sitron
      el limonero | sitrontre
      el paparajote | frityrstekt sitronblad
      la canela | kanel
      el pimiento | paprika
      la ñora | tørket rund paprika
      el calabacín | squash
      el zarangollo | squash og løk med egg
      el pastel de carne | kjøttpai
      la alcachofa | artisjokk
      la lechuga | salathode
      el melocotón | fersken
      el albaricoque | aprikos
      de temporada | i sesong | expr
      regar | vanne | v
      la sequía | tørke
      ¡qué calor! | så varmt! | expr
      la noria | pariserhjul, vannhjul
      la seda | silke
      el Mar Menor | saltvannslagune i Murcia
      el caldero | gryte, risrett fra Mar Menor
    `,
  },
  {
    id: 'alicante',
    es: 'Alicante',
    no: 'Alicante',
    words: `
      el paseo marítimo | strandpromenade
      la Explanada | promenaden med bølgemønster
      el puerto | havn
      el castillo de Santa Bárbara | borgen over Alicante
      la Costa Blanca | den hvite kysten
      la palmera | palme
      ¿vamos a la playa? | skal vi gå til stranden? | expr
      la arena | sand
      la ola | bølge
      nadar | svømme | v
      bañarse | bade | v
      tomar el sol | sole seg | expr
      la toalla | håndkle
      la sombrilla | parasoll
      la hamaca | solseng, hengekøye
      la crema solar | solkrem
      moreno | solbrun, mørkhåret | adj
      el chiringuito | strandbar
      el turista | turist
      el apartamento | ferieleilighet
      el piso | leilighet, etasje
      alquilar | leie | v
      el arroz a banda | ris kokt i fiskekraft
      el turrón | mandelnougat
      la almendra | mandel
      el almendro | mandeltre
      la miel | honning
      la hoguera | bål
      la noche de San Juan | sankthansaften
    `,
  },
  {
    id: 'romanos',
    es: 'Los romanos',
    no: 'Romerne',
    words: `
      romano | romersk | adj
      el imperio | keiserrike, imperium
      el emperador | keiser
      la capital | hovedstad
      el soldado | soldat
      conquistar | erobre | v
      la guerra | krig
      el acueducto | akvedukt
      la muralla | bymur
      la calzada | romersk vei, kjørebane
      el foro | forum, torg
      el templo | tempel
      el teatro | teater
      el anfiteatro | amfiteater
      el gladiador | gladiator
      la estatua | statue
      el mármol | marmor
      la moneda | mynt
      las ruinas | ruiner
      antiguo | antikk, gammel, tidligere | adj
      el latín | latin
      la lengua | tunge, språk
      el español | spansk (språket)
      el castellano | kastiljansk, spansk
      la palabra | ord
      el origen | opprinnelse, opphav
      viene del latín | det kommer fra latin | expr
      hace dos mil años | for to tusen år siden | expr
    `,
  },
  {
    id: 'alandalus',
    es: 'Al-Ándalus',
    no: 'Al-Andalus',
    words: `
      musulmán | muslimsk, muslim | adj
      cristiano | kristen | adj
      judío | jødisk, jøde | adj
      el califa | kalif
      la cultura | kultur
      la convivencia | sameksistens, samliv
      el alcázar | borg (fra arabisk al-qasr)
      el arco de herradura | hesteskobue
      los baños árabes | arabisk badehus
      la almohada | pute (fra arabisk al-mukhadda)
      el alcalde | ordfører (fra arabisk al-qadi «dommeren»)
      la aldea | grend (fra arabisk)
      la alfombra | teppe (fra arabisk)
      el algodón | bomull (fra arabisk al-qutn)
      el ajedrez | sjakk (fra arabisk ash-shatranj)
      la aduana | toll (fra arabisk ad-diwan)
      el almacén | lager (fra arabisk al-makhzan)
      la zanahoria | gulrot (fra arabisk)
      la berenjena | aubergine (fra arabisk)
      el jarabe | sirup (fra arabisk sharab «drikk»)
      el alcohol | alkohol (fra arabisk al-kuhl)
      la tarea | oppgave (fra arabisk)
      el albañil | murer (fra arabisk al-banna)
      hasta | helt til (fra arabisk hatta) | prep
      si Dios quiere | om Gud vil | expr
      viene del árabe | det kommer fra arabisk | expr
    `,
  },
  {
    id: 'museo',
    es: 'En el museo',
    no: 'Kunstmuseet',
    words: `
      el cuadro | maleri, bilde
      la pintura | malerkunst, maling
      el pintor | maler
      la pintora | maler (kvinne)
      el retrato | portrett
      el autorretrato | selvportrett
      el paisaje | landskap
      el bodegón | stilleben
      el pincel | pensel
      el lienzo | lerret
      el óleo | oljemaling, oljemaleri
      el marco | ramme
      el dibujo | tegning
      dibujar | tegne | v
      el grabado | grafisk trykk
      la obra | verk, byggearbeid
      la obra maestra | mesterverk
      la sala | sal, rom
      la exposición | utstilling
      la colección | samling
      la entrada | inngang, billett
      el surrealismo | surrealisme
      abstracto | abstrakt | adj
      realista | realistisk | adj
      fijarse | legge merke til | v
      ¿qué representa? | hva forestiller det? | expr
      prohibido hacer fotos | fotografering forbudt | expr
      ¡qué bonito! | så vakkert! | expr
    `,
  },
  {
    id: 'gaudi',
    es: 'La Barcelona de Gaudí',
    no: 'Gaudís Barcelona',
    words: `
      la naturaleza | natur
      la forma | form, fasong
      la curva | kurve, sving
      curvo | buet | adj
      recto | rett | adj
      la columna | søyle
      la cúpula | kuppel
      la bóveda | hvelv
      la vidriera | glassmaleri
      la chimenea | skorstein, peis
      el tejado | tak (utvendig)
      la azotea | takterrasse
      la escalera | trapp
      el balcón | balkong
      el hierro | jern
      la cerámica | keramikk
      el mosaico | mosaikk
      el dragón | drage
      la salamandra | salamander
      el hueso | knokkel, bein
      la hoja | blad, ark
      la rama | grein
      el tronco | stamme
      el bosque | skog
      la grúa | kran
      sin terminar | uferdig | expr
      ¡qué maravilla! | så fantastisk! | expr
      parece un bosque | det ser ut som en skog | expr
    `,
  },
  {
    id: 'cine',
    es: 'Cine y televisión',
    no: 'Film og TV',
    words: `
      el cine | kino, film
      la película | film
      el director | regissør, direktør
      el actor | skuespiller
      la actriz | skuespiller (kvinne)
      el personaje | rollefigur
      el papel | papir, rolle
      el guion | manus
      la escena | scene
      rodar | spille inn (film), rulle | v
      la pantalla | skjerm, lerret
      las palomitas | popkorn
      el estreno | premiere
      el premio | premie, pris
      la versión original | originalversjon
      doblado | dubbet | adj
      los subtítulos | undertekster
      la serie | TV-serie, serie
      el capítulo | episode, kapittel
      la guerra civil | borgerkrig
      la dictadura | diktatur
      la censura | sensur
      la colmena | bikube
      la abeja | bie
      el fauno | faun
      el laberinto | labyrint
      el monstruo | monster
      ¿de qué va? | hva handler den om? | expr
      ¿vamos al cine? | skal vi gå på kino? | expr
    `,
  },
  {
    id: 'mexico',
    es: 'México',
    no: 'Mexico',
    words: `
      mexicano | meksikansk | adj
      el Día de Muertos | De dødes dag
      la muerte | døden, død
      muerto | død | adj
      el alma | sjel | f
      la calavera | hodeskalle
      el esqueleto | skjelett
      la Catrina | skjelettdame med stor hatt
      el altar | alter
      la vela | stearinlys, seil
      el cempasúchil | fløyelsblomst
      el pan de muerto | søtt brød til De dødes dag
      el papel picado | papirpynt med utklipte mønstre
      el cementerio | kirkegård
      la tumba | grav
      el recuerdo | minne, suvenir
      el mural | veggmaleri
      el dolor | smerte
      la ceja | øyenbryn
      el mono | ape
      el loro | papegøye
      la bruja | heks
      ¿mande? | hva sa du? (i Mexico) | expr
      ¡qué padre! | så kult! (i Mexico) | expr
      descanse en paz | hvil i fred | expr
    `,
  },
  {
    id: 'cuba',
    es: 'Cuba',
    no: 'Cuba',
    words: `
      cubano | kubansk | adj
      la Habana | Havanna
      el malecón | molo, strandpromenade
      el Caribe | Karibia
      el huracán | orkan
      la caña de azúcar | sukkerrør
      el ron | rom (brennevin)
      el mojito | drink med rom og mynte
      el tabaco | tobakk
      el puro | sigar
      la plantación | plantasje
      la esclavitud | slaveri
      la independencia | uavhengighet, selvstendighet
      la revolución | revolusjon
      la guerrilla | gerilja
      el bloqueo | blokade
      el compañero | kamerat, kollega
      el son | son (kubansk musikk)
      ¿qué bolá? | hva skjer? (på Cuba) | expr
      en la lucha | vi holder ut (på Cuba) | expr
    `,
  },
  {
    id: 'argentina',
    es: 'Argentina',
    no: 'Argentina',
    words: `
      argentino | argentinsk | adj
      porteño | fra Buenos Aires | adj
      el tango | tango
      el bandoneón | bandoneon (tangotrekkspill)
      la milonga | tangokveld, milonga
      el abrazo | klem, omfavnelse
      la nostalgia | lengsel, nostalgi
      la pampa | pampas, gresslette
      el gaucho | gaucho (gjeter til hest)
      el escritor | forfatter
      el cuento | novelle, eventyr
      érase una vez | det var en gang | expr
      la biblioteca | bibliotek
      infinito | uendelig | adj
      ciego | blind | adj
      la rayuela | paradis (hoppelek)
      la tira cómica | tegneseriestripe
      la paz | fred
      vos | du (i Argentina) | pron
      che | hei du (i Argentina) | int
      ¿de dónde sos? | hvor er du fra? (i Argentina) | expr
      ¡qué lindo! | så fint! | expr
    `,
  },
  {
    id: 'colombia',
    es: 'Colombia',
    no: 'Colombia',
    words: `
      colombiano | colombiansk | adj
      el periodista | journalist
      el periódico | avis
      el realismo mágico | magisk realisme
      la magia | magi, trolldom
      la soledad | ensomhet
      recordar | minnes, huske | v
      la memoria | hukommelse, minne
      el coronel | oberst
      exagerar | overdrive | v
      increíble | utrolig | adj
      volar | fly | v
      la esmeralda | smaragd
      la telenovela | såpeopera
      la cumbia | cumbia (musikk og dans)
      el acordeón | trekkspill
      ¡qué chévere! | så kult! (i Colombia) | expr
      con cara de palo | med steinansikt | expr
      muchos años después | mange år senere | expr
    `,
  },
  {
    id: 'flamenco',
    es: 'El flamenco',
    no: 'Flamenco',
    words: `
      el cantaor | flamencosanger
      la cantaora | flamencosanger (kvinne)
      el bailaor | flamencodanser
      la bailaora | flamencodanser (kvinne)
      el tocaor | flamencogitarist
      tocar | spille (instrument), ta på | v
      el tablao | flamencoscene
      el cante jondo | dyp og alvorlig flamencosang
      el compás | takt, passer
      el duende | nisse, flamencoens magi
      el palo | pinne, flamencostil
      la soleá | langsom flamencostil (av soledad)
      las bulerías | rask og leken flamencostil
      el zapateado | rytmiske fottrinn
      el zapato | sko
      el tacón | hæl
      las castañuelas | kastanjetter
      la bata de cola | flamencokjole med slep
      el mantón | stort sjal med frynser
      el jaleo | oppstyr, rop og klapp (i flamenco)
      la juerga | festing, moro
      gitano | romsk, rom (folkegruppen) | adj
      la voz | stemme
      ronco | hes | adj
      la pena | sorg, smerte
      ¡qué pena! | så synd! | expr
      ¡así se baila! | slik skal det danses! | expr
    `,
  },
  {
    id: 'ritmos',
    es: 'Ritmos latinos',
    no: 'Latinamerikanske rytmer',
    words: `
      la música | musikk
      el ritmo | rytme
      la canción | sang
      la letra | bokstav, sangtekst
      el cantante | sanger
      el músico | musiker
      la orquesta | orkester
      el concierto | konsert
      el disco | plate, skive
      la radio | radio
      el tambor | tromme
      las maracas | maracas
      la trompeta | trompet
      el bolero | bolero (langsom kjærlighetssang)
      el mambo | mambo
      el merengue | marengs, merengue (dans)
      la bachata | bachata
      la rumba | rumba
      la pista de baile | dansegulv
      el bailarín | danser
      la bailarina | danser (kvinne), ballerina
      girar | snurre, svinge | v
      la cadera | hofte
      romántico | romantisk | adj
      el amor | kjærlighet
      besar | kysse | v
      ¿me concedes este baile? | får jeg denne dansen? | expr
      ¿quién canta? | hvem synger? | expr
    `,
  },
  {
    id: 'semanasanta',
    es: 'Semana Santa y Feria',
    no: 'Påske og feria i Sevilla',
    words: `
      el paso | skritt, prosesjonsplattform
      la cofradía | brorskap
      el nazareno | prosesjonsdeltaker i spiss hette
      el costalero | bærer under prosesjonsplattformen
      la saeta | kort sang til prosesjonen, pil
      la Virgen | Jomfru Maria, madonnafigur
      el Cristo | Kristus, kristusfigur
      la cruz | kors
      el incienso | røkelse
      la cera | voks
      el Domingo de Ramos | palmesøndag
      el Jueves Santo | skjærtorsdag
      el Viernes Santo | langfredag
      la Madrugá | natten til langfredag (i Sevilla)
      la Pascua | påske
      la caseta | festtelt, bu
      el farolillo | papirlykt
      el traje de flamenca | flamencokjole
      el volante | ratt, volang
      el lunar | prikk, føflekk
      la peineta | høy pyntekam (i håret)
      las sevillanas | sevillanas (pardans fra Sevilla)
      el coche de caballos | hestevogn
      la manzanilla | kamillete, tørr sherry
      guapo | kjekk, pen (om folk) | adj
      ¡guapa! | vakker! (tilrop) | int
      ¿bailamos unas sevillanas? | skal vi danse sevillanas? | expr
      nos vemos en la caseta | vi ses i teltet | expr
    `,
  },
  {
    id: 'sanfermin',
    es: 'San Fermín',
    no: 'San Fermín i Pamplona',
    words: `
      el toro | okse
      el encierro | oksesløp, innestenging
      el corredor | løper
      la carrera | løp, karriere, studier
      la cuesta | bakke
      la valla | gjerde
      el pastor | gjeter
      el cuerno | horn
      peligroso | farlig | adj
      el pañuelo rojo | rødt halstørkle
      la faja | bredt belte rundt livet
      el chupinazo | rakettskuddet som åpner festen
      el cohete | rakett
      los gigantes y cabezudos | kjempefigurer og storhoder
      la charanga | festorkester
      la peña | vennegjeng, klubb
      el santo | helgen
      la plaza de toros | tyrefekterarena
      la corrida | tyrefekting
      el torero | tyrefekter
      ¡viva San Fermín! | leve San Fermín! | expr
      ¡pobre de mí! | stakkars meg! | expr
      el siete de julio | 7. juli | expr
    `,
  },
  {
    id: 'tenorio',
    es: 'Don Juan Tenorio',
    no: 'Don Juan Tenorio',
    words: `
      el seductor | forfører
      la apuesta | veddemål
      engañar | lure, bedra | v
      el honor | ære
      el duelo | duell, sorg
      matar | drepe | v
      el convento | kloster
      la monja | nonne
      el ángel | engel
      la verdad | sannhet
      arrepentirse | angre | v
      perdonar | tilgi | v
      salvar | redde, frelse | v
      el infierno | helvete
      el más allá | det hinsidige
      el panteón | gravkapell
      el difunto | avdød
      el Día de Todos los Santos | allehelgensdag
      el convidado de piedra | steingjesten, taus gjest
      el drama | drama
      el verso | vers, verselinje
      el telón | teaterteppe
      la orilla | bredd, strandkant
      llamé al cielo y no me oyó | jeg ropte til himmelen og den hørte meg ikke | expr
      ¡que Dios me perdone! | Gud tilgi meg! | expr
    `,
  },
  {
    id: 'llorona',
    es: 'La Llorona',
    no: 'Den gråtende kvinnen',
    words: `
      la leyenda | sagn, legende
      cuentan que | det fortelles at | expr
      llorar | gråte | v
      el llanto | gråt
      llorón | grinete | adj
      el grito | skrik, rop
      ¡ay! | au, å | int
      el fantasma | spøkelse
      el alma en pena | sjel uten fred | f
      vagar | streife omkring | v
      la medianoche | midnatt
      la oscuridad | mørke
      el miedo | frykt, redsel
      ¡qué miedo! | så skummelt! | expr
      asustar | skremme | v
      el lago | innsjø
      ahogar | drukne (noen), kvele | v
      la traición | svik, forræderi
      abandonar | forlate | v
      celoso | sjalu | adj
      el castigo | straff
      el velo | slør
      el vestido | kjole
    `,
  },
  {
    id: 'dorado',
    es: 'El Dorado',
    no: 'El Dorado',
    words: `
      el oro | gull
      la plata | sølv, penger (i Latin-Amerika)
      el polvo | støv, pulver
      brillar | skinne, glitre | v
      los pueblos indígenas | urfolk
      el cacique | høvding, lokal pamp
      el dios | gud
      la ceremonia | seremoni
      la laguna | lagune, tjern
      la balsa | flåte, dam
      el fondo | bunn, bakgrunn
      hundirse | synke | v
      el tesoro | skatt (av gull og edelstener)
      la riqueza | rikdom
      el conquistador | erobrer
      la expedición | ekspedisjon
      la selva | jungel, regnskog
      la búsqueda | leting, søk
      la codicia | grådighet
      saquear | plyndre | v
      el mito | myte
      desaparecer | forsvinne | v
      vale su peso en oro | den er verdt sin vekt i gull | expr
      hacerse rico | bli rik | expr
    `,
  },
  {
    id: 'refranes',
    es: 'Refranes',
    no: 'Ordtak',
    words: `
      el refrán | ordtak
      el dicho | uttrykk, ordtak
      como dice el refrán | som ordtaket sier | expr
      poco a poco se va lejos | sakte men sikkert | expr
      más vale tarde que nunca | bedre sent enn aldri | expr
      no es oro todo lo que reluce | det er ikke gull alt som glimrer | expr
      más vale pájaro en mano que ciento volando | bedre med en fugl i hånden enn ti på taket | expr
      a quien madruga, Dios le ayuda | morgenstund har gull i munn | expr
      en boca cerrada no entran moscas | taushet er gull | expr
      Dios los cría y ellos se juntan | like barn leker best | expr
      ojos que no ven, corazón que no siente | man har ikke vondt av det man ikke vet | expr
      al pan, pan, y al vino, vino | kalle en spade for en spade | expr
      perro ladrador, poco mordedor | bjeffende hunder biter ikke | expr
      a caballo regalado no le mires el diente | man skal ikke skue given hest i munnen | expr
      donde fueres, haz lo que vieres | skikk følge eller land fly | expr
      mucho ruido y pocas nueces | mye skrik og lite ull | expr
      no hay mal que por bien no venga | ingenting er så galt at det ikke er godt for noe | expr
      más vale prevenir que curar | bedre føre var enn etter snar | expr
      el hábito no hace al monje | man skal ikke skue hunden på hårene | expr
      de tal palo, tal astilla | eplet faller ikke langt fra stammen | expr
      cuando el río suena, agua lleva | ingen røyk uten ild | expr
      hablando del rey de Roma, por la puerta asoma | snakk om sola | expr
      del dicho al hecho hay mucho trecho | lettere sagt enn gjort | expr
      a falta de pan, buenas son tortas | i nøden spiser fanden fluer | expr
    `,
  },
  {
    id: 'falsos',
    es: 'Falsos amigos',
    no: 'Falske venner',
    words: `
      embarazada | gravid (ikke flau) | adj
      constipado | forkjølet (ikke forstoppet) | adj
      el éxito | suksess (ikke utgang)
      la carpeta | mappe (ikke teppe)
      el gimnasio | treningssenter (ikke gymnas)
      el colegio | skole (ikke college)
      el instituto | ungdomsskole og videregående, institutt
      sensible | følsom (ikke fornuftig) | adj
      actual | nåværende (ikke faktisk) | adj
      en realidad | egentlig, faktisk | expr
      darse cuenta | innse, bli klar over | expr
      realizar | gjennomføre (ikke innse) | v
      asistir | være til stede, delta | v
      molestar | plage, forstyrre | v
      el pariente | slektning (ikke forelder)
      la librería | bokhandel (ikke bibliotek)
      la lectura | lesning (ikke forelesning)
      la novela | roman (ikke novelle)
      el suceso | hendelse (ikke suksess)
      el compromiso | forpliktelse, avtale
      el tópico | klisjé (ikke emne)
      el argumento | handling (i en bok eller film), argument
      la decepción | skuffelse
      grosero | uhøflig, grov | adj
      el balón | ball (ikke ballong)
      discutir | krangle, diskutere | v
      ¿qué significa? | hva betyr det? | expr
      ¿cómo se dice? | hvordan sier man det? | expr
    `,
  },
  {
    id: 'trabalenguas',
    es: 'Trabalenguas',
    no: 'Tungekrøllere',
    words: `
      el trabalenguas | tungekrøller
      tres tristes tigres tragaban trigo en un trigal | tre triste tigre slukte hvete på en hveteåker | expr
      el tigre | tiger
      tragar | svelge | v
      el trigo | hvete
      erre con erre cigarro, erre con erre barril, ¡qué rápido corren los carros del ferrocarril! | dobbel r i cigarro og barril – så fort jernbanevognene går! | expr
      el cigarro | sigarett, sigar
      el barril | tønne
      el carro | kjerre, bil (i Latin-Amerika)
      el ferrocarril | jernbane
      Pablito clavó un clavito en la calva de un calvito | lille Pablo slo en liten spiker inn i månen på en liten skallet mann | expr
      el clavo | spiker
      clavar | slå inn, stikke fast | v
      calvo | skallet | adj
      el perro de San Roque no tiene rabo porque Ramón Ramírez se lo ha cortado | San Roques hund har ingen hale fordi Ramón Ramírez har kuttet den av | expr
      el rabo | hale
      como poco coco como, poco coco compro | jeg kjøper lite kokos fordi jeg spiser lite kokos | expr
      el coco | kokosnøtt
      si Pancha plancha con cuatro planchas, ¿con cuántas planchas plancha Pancha? | hvis Pancha stryker med fire strykejern – med hvor mange strykejern stryker Pancha? | expr
      planchar | stryke (klær) | v
      la plancha | strykejern, stekeplate
    `,
  },
  {
    id: 'becquer',
    es: 'Leyendas de Bécquer',
    no: 'Bécquers sagn',
    words: `
      la noche de difuntos | de dødes natt, natt til allesjelersdag
      despertar | vekke | v
      el doble | det dobbelte, sjelering
      la campana | kirkeklokke, klokke
      cazar | jakte | v
      el monte | fjell, skogsås
      el ánima | sjel (en avdødes) | f
      el templario | tempelridder
      morir | dø | v
      sonar | lyde, ringe | v
      solo | alene, bare | adj
      otra vez | igjen | expr
      entre | mellom, blant | prep
      la joya | smykke
      la banda | bånd, skjerf
      pálido | blek | adj
      seguir | følge, fortsette | v
      el ciervo | hjort
      herido | såret | adj
      el cazador | jeger
      el espíritu | ånd
      el círculo | sirkel, ring
      el poeta | dikter, poet
      lleno | full | adj
      el rayo | stråle, lyn
      la gloria | ære, berømmelse
      la misa del gallo | midnattsmesse
      el organista | organist
      el órgano | orgel, organ
      como | som, slik som | conj
      enfermo | syk | adj
      la misa | messe
      el silencio | stillhet
      reírse | le | v
    `,
  },
  {
    id: 'viaje',
    es: 'De Madrid a Cadaqués',
    no: 'Reisens ord',
    words: `
      por si acaso | for sikkerhets skyld | expr
      entrar | gå inn, komme inn | v
      gratis | gratis | adj
      el mirador | utsiktspunkt
      el bombero | brannmann
      la roca | klippe, berg
      la tramontana | nordavind (i Katalonia)
    `,
  },
  {
    id: 'rastro',
    es: 'El Rastro',
    no: 'Loppemarkedet',
    words: `
      el rastro | loppemarked, spor
      el vendedor | selger
      regatear | prute | v
      la ganga | røverkjøp, kupp
      de segunda mano | brukt | expr
      la caja de música | spilledåse
      dejar | la, la være igjen | v
      me lo llevo | jeg tar den | expr
      ¡trato hecho! | avtale!, det er en avtale | expr
      ¡qué va! | slett ikke!, langt ifra! | expr
      menos | mindre | adv
      quince | femten | num
      veinticinco | tjuefem | num
      cuarenta | førti | num
      sesenta | seksti | num
      ochenta | åtti | num
    `,
  },
  {
    id: 'sonidos',
    es: 'Letras y sonidos',
    no: 'Bokstaver og lyder',
    words: `
      la gente | folk, mennesker
      la caza | jakt
      la tasa | avgift, gebyr
      coser | sy | v
      cocer | koke mat | v
      la uña | negl
      la cana | grått hårstrå
      la olla | kjele, gryte
      el polo | ispinne, pol
      el higo | fiken
      el peso | vekt
      el beso | kyss
      el pingüino | pingvin
      la vergüenza | skam, flauhet
    `,
  },
  {
    id: 'caso',
    es: 'El caso del reloj perdido',
    no: 'Detektivhistoriens ord',
    words: `
      el inspector | inspektør
      el caso | sak, tilfelle
      el reloj de bolsillo | lommeur
      pararse | stanse, stoppe | v
      a las cuatro y cuarto | klokka kvart over fire | expr
      desde | siden, fra | prep
      dar cuerda | trekke opp (en klokke) | expr
      la lupa | forstørrelsesglass, lupe
      la libreta | notatbok
      a las nueve y media | klokka halv ti | expr
      el pañuelo | tørkle, lommetørkle
      el relojero | urmaker
      la pista | spor, ledetråd
      robar | stjele | v
      el ladrón | tyv
      la relojería | urmakerbutikk
      arreglar | reparere, ordne | v
      ya | nå, allerede | adv
      prometer | love | v
      la sorpresa | overraskelse
      inocente | uskyldig | adj
    `,
  },
  {
    id: 'indicaciones',
    es: 'Indicaciones',
    no: 'Veibeskrivelse',
    words: `
      segundo | andre | adj
      tercero | tredje | adj
      la esquina | hjørne
      el cruce | kryss
      el semáforo | trafikklys
      delante de | foran | prep
      detrás de | bak | prep
      enfrente de | overfor | prep
      al lado de | ved siden av | prep
      cruzar | krysse, gå over | v
      parar | stoppe | v
      la farmacia | apotek
    `,
  },
  {
    id: 'ictineo',
    es: 'El Ictíneo',
    no: 'Ubåten Ictíneo',
    words: `
      el submarino | ubåt
      a babor | til babord, mot venstre om bord | expr
      a estribor | til styrbord, mot høyre om bord | expr
      arriba | opp, oppe | adv
      abajo | ned, nede | adv
      avante | forover (til sjøs) | adv
      despacio | sakte, langsomt | adv
      ¡alto! | stopp! | int
      la hélice | propell
      sumergirse | dykke, gå under vann | v
      la inmersión | dykk, neddykking
      la superficie | overflate
      el aire | luft
      la escotilla | luke (om bord)
      el casco | skrog, hjelm
      ¡cuidado! | pass på!, forsiktig! | int
      la red | nett, garn
      el muelle | kai, molo
      el coral | korall
      el buzo | dykker
      encender | tenne, slå på | v
      apagar | slokke, slå av | v
      el ancla | anker | f
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
