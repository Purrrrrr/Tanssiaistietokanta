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
          ? `../@(src|test)/migrations/*.${extension}`
          : `./migrations/*.${extension}`,
        { cwd: __dirname },
      ],
      resolve: isTest ? resolve : undefined,
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

// Something in the ts->js transpilation ends up mangling the exports in a way that makes up/down end up inside a default export instead of top-level exports.
// We work around that by always using require() to load the migration module.
function resolve<Ctx extends MigrationContext>({ name, path: filepath }: { name: string, path?: string, context: Ctx }) {
  if (!filepath) {
    throw new Error(`Can't resolve migration ${name} without a file path`)
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const loadModule = () => require(filepath)
  return {
    name,
    path: filepath,
    up: async ({ context }: { context: Ctx }) => {
      const { up } = await loadModule()
      if (up === undefined) throw new Error(`Migration ${name} does not export an "up" function`)
      return up({ path: filepath, name, context })
    },
    down: async ({ context }: { context: Ctx }) => {
      const { down } = await loadModule()
      return down?.({ path: filepath, name, context })
    },
  }
}
