import { defineConfig, globalIgnores } from 'eslint/config'
import { tanstackConfig } from '@tanstack/eslint-config'

export default defineConfig([
  ...tanstackConfig,
  // Generated, built or copied files
  globalIgnores(['dist', '.astro', '.cache', '.claude', '.wrangler', 'public']),
])
