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
    ],
  },
  { id: 'america', es: 'América', no: 'Latin-Amerika', themes: [] },
  { id: 'fiestas', es: 'Música y fiestas', no: 'Musikk og fester', themes: [] },
  { id: 'leyendas', es: 'Leyendas', no: 'Sagn', themes: [] },
  { id: 'idioma', es: 'El idioma', no: 'Språket', themes: [] },
]

export const THEME: Record<
  string,
  (Theme & { group: ThemeGroup }) | undefined
> = Object.fromEntries(
  THEME_GROUPS.flatMap((group) =>
    group.themes.map((t) => [t.lesson, { ...t, group }]),
  ),
)
