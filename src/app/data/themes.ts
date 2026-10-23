// The themes on the home page: lessons of words (data/words.ts) beyond the
// first ones, in groups, each with a few lines on what it is about. One can
// be chosen (bank.theme, games/tema.tsx), and today's chapter then meets its
// words before the rest. A group with no themes yet is not shown.

export interface Theme {
  // The lesson whose words the theme has
  lesson: string
  // What it is about, for its page: a few plain lines
  about: string
}

export interface ThemeGroup {
  id: string
  es: string
  no: string
  themes: Array<Theme>
}

export const THEME_GROUPS: Array<ThemeGroup> = [
  {
    id: 'diaria',
    es: 'La vida diaria',
    no: 'Hverdagen',
    themes: [
      {
        lesson: 'tapeo',
        about:
          'Ordene ved bardisken: å bestille en caña, dele noen raciones, spandere en runde og be om regningen. I noen byer, som Granada, følger det en liten tapa gratis med drinken.',
      },
      {
        lesson: 'compras',
        about:
          'Å handle på markedet og i butikken: bodene, kiloene og prisen, kort eller kontanter, og spørsmålet som holder orden i køen: ¿quién es el último?, hvem er sist?',
      },
      {
        lesson: 'transporte',
        about:
          'Å komme seg rundt: billettluken og perrongen, avganger og forsinkelser, å ta bussen, gå av på riktig holdeplass og be om en billett tur-retur.',
      },
      {
        lesson: 'parientes',
        about:
          'Hele slekta, fra barnebarn til svigerfamilie, og festene der den samles: dåp, bryllup, bursdag og jul. I mange spanske familier er det de hellige tre konger som kommer med gavene, natt til 6. januar.',
      },
      {
        lesson: 'clima',
        about:
          'Været, som alle snakker om: sol, regn, tåke, torden og hetebølge. Legg merke til at været «gjør» noe på spansk: hace calor, hace frío, hace viento.',
      },
      {
        lesson: 'horarios',
        about:
          'Spania spiser senere enn Norge: lunsj gjerne rundt to, middag ved ti-tiden, og sobremesa, praten ved bordet etter maten. Dagens måltider og tider, fra madrugar til trasnochar.',
      },
      {
        lesson: 'tramites',
        about:
          'Skjemaer, stempler, køer og timeavtaler. Mariano José de Larra gjorde narr av byråkratiet i Vuelva usted mañana fra 1833, om en franskmann i Madrid som får høre «kom tilbake i morgen» igjen og igjen.',
      },
    ],
  },
  {
    id: 'mesa',
    es: 'A la mesa',
    no: 'Mat og drikke',
    themes: [
      {
        lesson: 'tapas',
        about:
          'Småretter til å dele: kroketter, patatas bravas, kjøttboller og hvitløksreker. I Baskerland heter de pintxos, og de står ofte på et brødstykke, holdt sammen av en tannpirker.',
      },
      {
        lesson: 'paella',
        about:
          'Paellaen kommer fra rismarkene rundt Valencia, og den tradisjonelle paella valenciana lages med kylling, kanin og bønner, gjerne over vedfyr. Her er det som går i pannen, fra safran til skalldyr, og socarrat, den sprø risen i bunnen.',
      },
      {
        lesson: 'tortilla',
        about:
          'Den spanske potetomeletten: poteter, ofte løk, stekt langsomt i olivenolje og bundet sammen med egg. Om den skal ha løk eller ikke, er en evig strid i Spania.',
      },
      {
        lesson: 'churros',
        about:
          'Frityrstekt deig dyppet i tykk, varm sjokolade, til frokost eller sent på natten. Og de andre søtsakene: flan, torrijas i påsken og roscón de Reyes til trettendedagen.',
      },
      {
        lesson: 'embutidos',
        about:
          'Spekeskinke, ost og pølser: jamón serrano og ibérico, chorizo, salchichón og manchego. De fineste ibéricoskinkene kommer fra griser som går fritt i dehesaen og spiser eikenøtter.',
      },
      {
        lesson: 'bebidas',
        about:
          'Det man drikker i Spania: vin fra bodegaen, vermut før lunsj, sider som skjenkes fra høyt i Asturias, og horchata, en søt, kald drikk av jordmandel fra Valencia.',
      },
      {
        lesson: 'latino',
        about:
          'Mat fra den andre siden av Atlanteren: tacos og guacamole fra Mexico, ceviche fra Peru, arepas fra Venezuela og Colombia, empanadas og dulce de leche fra Argentina. Mange ord er annerledes enn i Spania: en potet heter papa.',
      },
    ],
  },
  {
    id: 'espana',
    es: 'Por España',
    no: 'Steder i Spania',
    themes: [
      {
        lesson: 'cataluna',
        about:
          'Barcelona og Catalonia, der folk snakker både katalansk og spansk: Gaudís byggverk, menneskepyramidene castells, og Sant Jordi 23. april, når man gir hverandre roser og bøker.',
      },
      {
        lesson: 'andalucia',
        about:
          'Sør-Spania: Sevilla, Córdoba og Granada, med moskeen i Córdoba og Alhambra fra maurernes tid, flamenco, feria og påskeprosesjoner, og gazpacho i varmen.',
      },
      {
        lesson: 'galicia',
        about:
          'Det grønne nordvestlige hjørnet av Spania, der Caminoen ender ved katedralen i Santiago de Compostela. Pilegrimens ord, fra skjellet og den gule pilen til gnagsårene, og Galicias egne: blekksprut, sekkepipe og morriña, lengselen hjem.',
      },
      {
        lesson: 'euskadi',
        about:
          'Baskerland, med sitt eget språk, euskera, som ikke er i slekt med noe annet kjent språk. Bilbao med Guggenheim-museet, San Sebastián med pintxos, og siderhus der sideren skjenkes rett fra tønnen.',
      },
      {
        lesson: 'valencia',
        about:
          'Valencia, med rismarkene og appelsintrærne rundt byen, og Fallas i mars: en mascletá med smell midt på dagen, og store figurgrupper som brennes om natten 19. mars.',
      },
      {
        lesson: 'murcia',
        about:
          'Murcia, kalt Europas kjøkkenhage: sitroner, paprika og artisjokk fra huertaen, og retter som zarangollo og paparajotes. Ved kysten ligger Mar Menor, en av Europas største saltvannslaguner.',
      },
      {
        lesson: 'alicante',
        about:
          'Alicante på Costa Blanca, der mange nordmenn har feriert og bodd: stranden og strandpromenaden, borgen Santa Bárbara over byen, turrón fra Jijona og bålene sankthansnatt.',
      },
    ],
  },
  {
    id: 'historia',
    es: 'Historia y arte',
    no: 'Historie og kunst',
    themes: [
      {
        lesson: 'mancha',
        about:
          'Ordene i Don Quijote: ridderen og væpneren hans, hesten og eselet, vertshusene og kjempene som kanskje er vindmøller. Med dem leses romanen med stadig mer spansk.',
      },
      {
        lesson: 'suenos',
        about:
          'Drømmens ord, fra surrealistenes verden: ørkenen og skyggene, maur, elefanter og sommerfugler, skjeer og gafler, og ting som smelter.',
      },
      {
        lesson: 'romanos',
        about:
          'Romerne kom til Den iberiske halvøy i 218 f.Kr., ble i rundt 600 år og kalte den Hispania. I Mérida spilles det fortsatt teater om sommeren i det romerske teatret, og akvedukten i Segovia, av granittblokker uten mørtel, har stått i nesten to tusen år. Spansk er latin slik folk snakket det, forandret over tid: aqua ble agua, octo ble ocho og facere ble hacer.',
      },
      {
        lesson: 'alandalus',
        about:
          'Al-Andalus var den muslimske delen av Den iberiske halvøy, fra 711 til Granada falt i 1492, samme år som jødene ble drevet ut av Spania. Córdoba var en av Europas største byer på 900-tallet, og Alhambra i Granada står ennå. Spansk fikk flere tusen ord fra arabisk, mange med den arabiske artikkelen al- grodd fast foran, som almohada og alcalde. Også aceite, azúcar og ojalá, «om Gud vil», kommer fra arabisk.',
      },
      {
        lesson: 'museo',
        about:
          'Ordene for å se på kunst: portretter, landskap og stilleben, pensel, lerret og ramme. I Prado i Madrid henger Velázquez’ Las Meninas, Goyas svarte malerier og El Grecos lange skikkelser, og i Reina Sofía Picassos Guernica. Miró har et eget museum i Barcelona, og to surrealister som lenge sto i skyggen av mennene, er verdt å oppdage: Remedios Varo, som malte drømmeverdener i Mexico, og Maruja Mallo, som malte folkefestene i Madrid.',
      },
      {
        lesson: 'gaudi',
        about:
          'Antoni Gaudí lærte av naturen: søylene i Sagrada Familia greiner seg som trær, taket på Casa Batlló minner om ryggen til en drage, og en salamander av mosaikk tar imot i Park Güell. Han brukte helst buer og kurver, sjelden rette linjer. Kirken han overtok i 1883, bygges ennå.',
      },
      {
        lesson: 'cine',
        about:
          'Luis Buñuel laget Un chien andalou med Dalí i 1929 og fikk Viridiana forbudt i Francos Spania, og Pedro Almodóvar laget fargesterke melodramaer etter diktaturet. I El espíritu de la colmena (1973) ser en liten jente Frankenstein i en landsby like etter borgerkrigen, og i El laberinto del fauno (2006) søker en jente tilflukt i en eventyrverden i 1944. I Spania dubbes de fleste utenlandske filmer og serier.',
      },
    ],
  },
  {
    id: 'america',
    es: 'América',
    no: 'Latin-Amerika',
    themes: [
      {
        lesson: 'mexico',
        about:
          'Frida Kahlo malte seg selv med aper, papegøyer og sammenvokste øyenbryn i det blå huset i Coyoacán, mannen hennes Diego Rivera malte Mexicos historie på veggene, og engelskfødte Leonora Carrington malte hekser og fabeldyr i Mexico by. På De dødes dag, 1. og 2. november, pynter familiene altere med lys, fløyelsblomster og hodeskaller av sukker for de døde som kommer på besøk.',
      },
      {
        lesson: 'cuba',
        about:
          'Øya med Havanna og strandpromenaden Malecón, sukkerrør, tobakk og rom. Musikken son vokste fram av spansk sang og gitar og rytmene slavegjorte afrikanere hadde med seg, og ble grunnlaget for salsaen. Revolusjonen i 1959 styrtet diktatoren Batista og lærte nesten alle å lese, men ble selv et ettpartistyre som fengsler kritikere, og USAs blokade har tynget øya i over seksti år.',
      },
      {
        lesson: 'argentina',
        about:
          'Tangoen ble født i Buenos Aires og Montevideo og danses tett, i en klem, til bandoneonen. Jorge Luis Borges skrev om labyrinter, speil og uendelige biblioteker, Julio Cortázars Rayuela kan leses i flere rekkefølger, og Quinos Mafalda hater suppe og vil ha fred i verden. I Argentina sier man vos for tú: vos sos, vos tenés.',
      },
      {
        lesson: 'colombia',
        about:
          'Gabriel García Márquez begynte som journalist og skrev Hundre års ensomhet (1967), der det utrolige fortelles som om det var hverdagslig: det regner i nesten fem år, og en hel by mister hukommelsen. Tonen hadde han lært av bestemoren, sa han. Fra kysten kommer cumbia, med trommer og fløyter, og vallenato med trekkspill.',
      },
    ],
  },
  {
    id: 'fiestas',
    es: 'Música y fiestas',
    no: 'Musikk og fester',
    themes: [
      {
        lesson: 'flamenco',
        about:
          'Flamencoen vokste fram i Andalucía, særlig blant gitanos, Spanias rom, og står på UNESCOs liste over menneskehetens immaterielle kulturarv. Gitaristen Paco de Lucía og sangeren Camarón de la Isla, som spilte inn mange plater sammen, fornyet den på 1970-tallet, og Rosalía blandet den med pop i El mal querer (2018).',
      },
      {
        lesson: 'ritmos',
        about:
          'Rytmene fra Latin-Amerika og Karibia: bolero, de langsomme kjærlighetssangene fra Cuba, salsa, som vokste fram av kubansk son i New York på 1960- og 70-tallet, merengue og bachata fra Den dominikanske republikk, cumbia fra Colombia og tango fra Río de la Plata. Celia Cruz ropte «¡Azúcar!», sukker, når hun sang.',
      },
      {
        lesson: 'semanasanta',
        about:
          'I påskeuka går brorskapene i Sevilla i prosesjon til katedralen med pasos, tunge plattformer med Kristus- og madonnafigurer som bæres av folk som går under dem, og fra en balkong synger noen en saeta. Vanligvis to uker etter påske kommer Feria de Abril: festtelt, papirlykter, flamencokjoler med prikker og volanger, hestevogner og sevillanas til langt på natt.',
      },
      {
        lesson: 'sanfermin',
        about:
          'Festen i Pamplona begynner med rakettskuddet chupinazo fra rådhusbalkongen 6. juli klokka tolv og slutter ved midnatt 14. juli med sangen Pobre de mí. Hver morgen fra 7. juli klokka åtte løper folk kledd i hvitt og rødt foran seks okser gjennom gatene til tyrefekterarenaen, en strekning på under en kilometer, og om ettermiddagen blir de samme oksene drept i tyrefektingen. Ernest Hemingway gjorde festen kjent i The Sun Also Rises fra 1926, Fiesta på spansk.',
      },
    ],
  },
  {
    id: 'leyendas',
    es: 'Leyendas',
    no: 'Sagn',
    themes: [
      {
        lesson: 'tenorio',
        about:
          'José Zorrillas skuespill fra 1844 om forføreren Don Juan i Sevilla, som vedder om hvem som kan gjøre mest skade på ett år, og så forelsker seg i den unge doña Inés fra klosteret. Andre del foregår blant gravene, der de døde kommer tilbake, og derfor spilles stykket rundt allehelgensdag. Den eldre Don Juan fra 1600-tallet havner i helvete, men Zorrilla ga sin en annen slutt.',
      },
      {
        lesson: 'llorona',
        about:
          'Et sagn fra Mexico, fortalt i store deler av Latin-Amerika: en kvinne som druknet barna sine da mannen forlot henne, går kledd i hvitt langs elver og innsjøer om natten og gråter «¡Ay, mis hijos!», å, mine barn. Barn får høre det for at de skal holde seg inne når det blir mørkt. En gammel meksikansk sang bærer navnet hennes, kjent i Chavela Vargas’ versjon.',
      },
      {
        lesson: 'dorado',
        about:
          'Muiscaene i høylandet i dagens Colombia hadde en seremoni ved innsjøen Guatavita: en ny høvding ble dekket av gullstøv og ført ut på en flåte, der han ofret gull og smaragder i vannet. Ryktet om el dorado, den forgylte, ble til spanske erobreres jakt på et helt rike av gull. De fant det aldri, men plyndret muiscaene og lette gjennom jungelen i flere tiår.',
      },
    ],
  },
  {
    id: 'idioma',
    es: 'El idioma',
    no: 'Språket',
    themes: [
      {
        lesson: 'refranes',
        about:
          'Spanske ordtak, mange av dem flere hundre år gamle; Sancho Panza strør om seg med dem i Don Quijote. Mange har et norsk motstykke: más vale tarde que nunca er bedre sent enn aldri, og a falta de pan, buenas son tortas, «mangler det brød, er kaker godt», er i nøden spiser fanden fluer.',
      },
      {
        lesson: 'falsos',
        about:
          'Ord som ligner norske eller engelske, men betyr noe annet: embarazada er gravid, ikke flau, constipado er forkjølet, og el éxito er suksess, ikke utgang. Andre steder i ordbanken står flere: la firma er en underskrift, el vaso et glass og largo lang.',
      },
      {
        lesson: 'trabalenguas',
        about:
          'Tungekrøllere å øve uttalen på, først sakte og så fortere: den rullende r-en i erre con erre cigarro, tr og gr i tres tristes tigres, og bl og cl i Pablito clavó un clavito.',
      },
    ],
  },
]

export const THEME: Record<
  string,
  (Theme & { group: ThemeGroup }) | undefined
> = Object.fromEntries(
  THEME_GROUPS.flatMap((group) =>
    group.themes.map((t) => [t.lesson, { ...t, group }]),
  ),
)
