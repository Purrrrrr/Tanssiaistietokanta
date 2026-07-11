import { rmSync } from 'node:fs'

rmSync('./data-test', {
  recursive: true,
  force: true,
})

export const mochaHooks = {
}
