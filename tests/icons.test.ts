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
