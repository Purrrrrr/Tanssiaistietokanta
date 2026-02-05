import { Umzug, JSONStorage } from 'umzug'
import path from 'path'
import { getContext } from './umzug.context'
import type { Application } from './declarations'

export async function migrateDb(app: Application) {
  const context = getContext(app)
  const extension = app.get('importExtension')
  const umzug = getUmzug(context, extension)

  await umzug.up()
}

export function createMigration(name: string) {
  getUmzug({}).create({
    name,
    folder: path.join(__dirname, '/migrations'),
    skipVerify: true,
  })
}

function getUmzug<Ctx extends object>(context: Ctx, extension: string = 'ts') {
  const rawStorage = new JSONStorage({ path: path.join(__dirname, '../data/executed-migrations.json') })
  const replaceExtension = (name: string) => name.replace(/\.ts$/, '.js')
  return new Umzug<Ctx>({
    migrations: { glob: [`./migrations/*.${extension}`, { cwd: __dirname }] },
    context,
    storage: {
      logMigration({ name }: { name: string }): Promise<void> {
        return rawStorage.logMigration({ name: replaceExtension(name) })
      },
      unlogMigration({ name }: { name: string }): Promise<void> {
        return rawStorage.unlogMigration({ name: replaceExtension(name) })
      },
      async executed(): Promise<string[]> {
        return (await rawStorage.executed()).map(name => name.replace(/\.js$/, `.${extension}`))
      },
    },
    logger: console,
  })
}
