// Chromium for the scripts that need a browser (smoke.mjs, shot.mjs,
// icons.mjs, taxi-layout.mjs): Playwright's own, as `npx playwright install
// chromium` puts it; or, where that is missing, as in Claude's cloud
// sandbox, whose Chromium is for another Playwright, the one there: its
// headless shell, as Playwright's own would be, else its Chromium.
import { existsSync, readdirSync } from 'node:fs'
import { chromium } from 'playwright'

const SANDBOX = '/opt/pw-browsers'

function sandboxed() {
  if (!existsSync(SANDBOX)) return undefined
  const shells = readdirSync(SANDBOX)
    .filter((d) => d.startsWith('chromium_headless_shell-'))
    .map(
      (d) =>
        `${SANDBOX}/${d}/chrome-headless-shell-linux64/chrome-headless-shell`,
    )
    .filter((p) => existsSync(p))
  const full = `${SANDBOX}/chromium`
  return shells.at(-1) ?? (existsSync(full) ? full : undefined)
}

export async function launch(options = {}) {
  try {
    return await chromium.launch(options)
  } catch (e) {
    const executablePath = sandboxed()
    if (!executablePath || !/Executable doesn't exist/.test(String(e))) throw e
    return chromium.launch({ ...options, executablePath })
  }
}
