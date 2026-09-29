import { makeEdits } from './index'

makeEdits().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
