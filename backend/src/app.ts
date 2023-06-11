// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers, HookContext, NextFunction } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'

import { configurationValidator } from './configuration'
import type { Application } from './declarations'
import { logError } from './hooks/log-error'
import { services } from './services/index'
import { graphqlServiceMiddleware } from './services/graphql/graphql.class'
import initDependencyGraph from './dependencyGraph'
import {preventRemovingOfUsedItems} from './hooks/prevent-removing-of-used-items'
import { migrateDb } from './umzug'
import { channels } from './channels'

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))
app.set('importExtension', __filename.split('.').at(-1) ?? '.js')

// Set up Koa middleware
app.use(cors())
app.use(serveStatic(app.get('public')))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())
app.use(graphqlServiceMiddleware)

// Configure services and transports
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get('origins')
    }
  })
)
app.configure(channels)
app.configure(services)

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
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
    }
  ],
  teardown: []
})

export { app }
