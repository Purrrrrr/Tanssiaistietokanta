// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers, HookContext, NextFunction } from '@feathersjs/feathers'
import { existsSync, mkdirSync } from 'fs'
import { unlink } from 'fs/promises'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'

import { configurationValidator } from './configuration'
import type { Application } from './declarations'
import { logRequest } from './hooks/log-request'
import { authentication } from './authentication'
import { services } from './services/index'
import { graphqlServiceMiddleware } from './services/graphql/graphql.class'
import initDependencyGraph from './dependencyGraph'
import { preventRemovingOfUsedItems } from './hooks/prevent-removing-of-used-items'
import { migrateDb } from './umzug'
import { channels } from './channels'
import { addErrorStatusCode } from './hooks/addErrorStatusCode'
import { MaxFileSize } from './services/files/files.class'
import { finalizeRequest, initializeRequest } from './requestLogger'

initializeRequest({ method: 'startup' })

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))
app.set('importExtension', __filename.split('.').at(-1) ?? '.js')

// Set up Koa middleware
app.use(cors())
app.use(serveStatic(app.get('public')))
app.use(errorHandler())
app.use(parseAuthentication())

const uploadTmp = app.get('uploadTmp')
mkdirSync(uploadTmp, { recursive: true })
mkdirSync(app.get('uploadDir'), { recursive: true })

app.use(bodyParser({
  multipart: true,
  formidable: {
    uploadDir: uploadTmp,
    maxFileSize: MaxFileSize,
  },
}))

app.use(async (ctx, next) => {
  const { body, files } = ctx.request
  Object.assign(body, files)
  await next()
  const filesToCleanup = Object.values(files ?? {})
    .flat()
    .filter(file => existsSync(file.filepath))

  await Promise.all(filesToCleanup.map(file => unlink(file.filepath)))
})
app.use(graphqlServiceMiddleware)
app.use(async (ctx, next) => {
  ctx.feathers ??= {}
  ctx.feathers.IP = ctx.request.ip
  await next()
})
console.log(allowLocalhostOnDev(app.get('origins')))

// Configure services and transports
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: allowLocalhostOnDev(app.get('origins'))
    }
  })
)

function allowLocalhostOnDev(origins: string[] | undefined) {
  if (process.env.CORS_ALLOW_LOCALHOST !== 'true') return origins
  const localhost = /^http:\/\/localhost:[0-9]{2,4}$/
  return origins ? [...origins, localhost] : localhost
}
app.configure(channels)
app.configure(authentication)
app.configure(services)

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logRequest({ ignoredPaths: ['channel-connections']}), addErrorStatusCode]
  },
  before: {
    remove: [preventRemovingOfUsedItems],
  },
  after: {},
  error: {}
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [
    async (context: HookContext<Application>, next: NextFunction) => {
      await migrateDb(context.app)
      await initDependencyGraph(context.app)
      await next()
      // Finalize app startup request log
      finalizeRequest()
    },
  ],
  teardown: [async (_: HookContext<Application>, next: NextFunction) => {
    initializeRequest({ method: 'shutdown' }).writeRequest()
    await next()
  }]
})

export { app }
