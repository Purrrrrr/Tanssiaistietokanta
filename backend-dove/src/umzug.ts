import { Umzug, JSONStorage } from 'umzug'
import path from 'path'
import { getContext } from './umzug.context'
import type { Application } from './declarations'

export async function migrateDb(app: Application) {
  const context = getContext(app)
  const umzug = getUmzug(context)

  await umzug.up()
}

export function createMigration(name: string) {
  getUmzug({}).create({
    name,
    folder: path.join(__dirname, '/migrations'),
    skipVerify: true
  })
}

function getUmzug<Ctx extends object>(context: Ctx) {
  return new Umzug<Ctx>({
    migrations: { glob: ['./migrations/*.ts', { cwd: __dirname}] },
    context,
    storage: new JSONStorage({ path: path.join(__dirname, '../data/executed-migrations.json') }),
    logger: console
  })
}
