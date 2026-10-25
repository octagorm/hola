import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  GAME_ICON_IDS,
  TOC_IDS,
  gameIconPicture,
  tocPicture,
} from '../src/app/data/icons'
import { ICON_PICTURES } from '../src/app/data/icon-prompts'
import { CASO_PICTURES } from '../src/app/data/caso-prompts'
import { HOME_PICTURES } from '../src/app/data/home-prompts'
import { MUSEO_PICTURES } from '../src/app/data/museo-prompts'
import { NUMEROS_PICTURES } from '../src/app/data/numeros-prompts'
import { PALABRAS_PICTURES } from '../src/app/data/palabras-prompts'
import { RASTRO_PICTURES } from '../src/app/data/rastro-prompts'
import { TAPAS_PICTURES } from '../src/app/data/tapas-prompts'
import { GAME_INFO } from '../src/app/data/games'
import { STAGES, stampPicture } from '../src/app/data/camino'
import {
  CAMINO_PICTURES,
  FIRST_STAMP,
  STAMP_SUBJECTS,
} from '../src/app/data/camino-prompts'

describe('the home page’s small paintings', () => {
  it('has a prompt for each story’s and each game’s picture, and no other', () => {
    const names = [
      ...TOC_IDS.map(tocPicture),
      ...GAME_ICON_IDS.map(gameIconPicture),
    ]
    expect(Object.keys(ICON_PICTURES).sort()).toEqual([...names].sort())
    for (const [name, p] of Object.entries(ICON_PICTURES)) {
      expect(p.shape, name).toBe('square')
      expect(p.size, name).toMatch(/^(\d+)x\1$/)
      expect(p.ref, name).toBe('design/sketches/reiseplakat.jpg')
      expect(p.prompt, name).toMatch(/travel poster/)
      expect(p.prompt, name).toMatch(/No lettering/)
    }
  })

  it('has a picture for every game on the home page', () => {
    for (const g of GAME_INFO)
      expect(GAME_ICON_IDS as ReadonlyArray<string>, g.id).toContain(g.id)
  })

  it('takes no name another picture has', () => {
    const others = [
      CASO_PICTURES,
      HOME_PICTURES,
      MUSEO_PICTURES,
      NUMEROS_PICTURES,
      PALABRAS_PICTURES,
      RASTRO_PICTURES,
      TAPAS_PICTURES,
      CAMINO_PICTURES,
    ].flatMap((p) => Object.keys(p))
    // nor a folder of public/ that holds anything else
    const folders = readdirSync('public')
    for (const name of Object.keys(ICON_PICTURES)) {
      expect(others, name).not.toContain(name)
      expect(name, name).toMatch(/^(toc|games)\//)
    }
    for (const dir of ['toc', 'games'].filter((d) => folders.includes(d)))
      for (const f of readdirSync(`public/${dir}`))
        expect(Object.keys(ICON_PICTURES), f).toContain(
          `${dir}/${f.replace(/\.webp$/, '')}`,
        )
  })

  it('is painted by the script, and the page never reads the prompts', () => {
    const script = readFileSync('scripts/pictures.mjs', 'utf8')
    expect(script).toContain('Object.assign(PICTURES, ICON_PICTURES)')
    for (const file of ['src/app/art.tsx', 'src/app/data/icons.ts'])
      expect(readFileSync(file, 'utf8'), file).not.toMatch(
        /from '[^']*-prompts/,
      )
  })
})

describe('the credential’s painted stamps', () => {
  it('has a stamp of its own for every town, each named once', () => {
    const names = STAGES.map(stampPicture)
    expect(new Set(names).size).toBe(STAGES.length)
    expect(Object.keys(CAMINO_PICTURES).sort()).toEqual([...names].sort())
    expect(Object.keys(STAMP_SUBJECTS).sort()).toEqual(
      STAGES.map((s) => s.town).sort(),
    )
    expect(new Set(Object.values(STAMP_SUBJECTS)).size).toBe(STAGES.length)
    expect(stampPicture(STAGES[8])).toBe('camino/santo-domingo-de-la-calzada')
    expect(FIRST_STAMP).toBe(`.cache/pictures/${names[0]}.png`)
    for (const [name, p] of Object.entries(CAMINO_PICTURES)) {
      expect(p.cutout, name).toBe(true)
      expect(p.prompt, name).toMatch(/travel poster/)
      expect(p.prompt, name).toMatch(/No lettering/)
      expect(p.prompt, name).toMatch(/transparent background/)
    }
  })
})
