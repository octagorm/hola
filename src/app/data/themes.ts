// The themes on the home page: lessons of words (data/words.ts) beyond the
// first ones, in groups, each with a few lines on what it is about. One can
// be chosen (bank.theme, games/tema.tsx), and today's chapter then meets its
// words before the rest.

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
    id: 'cultura',
    es: 'Cultura',
    no: 'Kultur',
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
]

export const THEME: Record<
  string,
  (Theme & { group: ThemeGroup }) | undefined
> = Object.fromEntries(
  THEME_GROUPS.flatMap((group) =>
    group.themes.map((t) => [t.lesson, { ...t, group }]),
  ),
)
