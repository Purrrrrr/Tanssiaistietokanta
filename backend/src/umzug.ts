import { Umzug, JSONStorage } from 'umzug'
import path from 'path'
import { getContext, MigrationContext } from './umzug.context'
import type { Application } from './declarations'

export async function migrateDb(app: Application) {
  const context = getContext(app)
  const extension = app.get('importExtension')
  const umzug = getUmzug(context, extension)

  await umzug.up()
}

export function createMigration(name: string, type: 'production' | 'test' = 'production') {
  const rootPath = path.join(__dirname, '..')
  new Umzug({
    migrations: { glob: ['src/migrations/*.ts', { cwd: rootPath }] },
    logger: console,
  }).create({
    name,
    folder: path.join(
      rootPath,
      type === 'production' ? 'src' : 'test',
      '/migrations',
    ),
    skipVerify: true,
  })
}

function getUmzug<Ctx extends MigrationContext>(context: Ctx, extension: string = 'ts') {
  const rawStorage = new JSONStorage({ path: path.join(context.dbPath, 'executed-migrations.json') })
  const replaceExtension = (name: string) => name.replace(/\.ts$/, '.js')
  const isTest = process.env.NODE_ENV === 'test'
  return new Umzug<Ctx>({
    migrations: {
      glob: [
        isTest
          ? `@(src|test)/migrations/*.${extension}`
          : `src/migrations/*.${extension}`,
        { cwd: context.rootPath },
      ],
    },
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
    logger: isTest ? undefined : console,
  })
}
