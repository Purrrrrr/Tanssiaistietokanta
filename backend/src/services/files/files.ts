// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { hooks as schemaHooks } from '@feathersjs/schema'
import contentDisposition from 'content-disposition'

import {
  fileDataValidator,
  filePatchValidator,
  fileQueryValidator,
  fileResolver,
  fileExternalResolver,
  fileDataResolver,
  filePatchResolver,
  fileQueryResolver
} from './files.schema'

import type { Application } from '../../declarations'
import { File, FileService, getOptions } from './files.class'
import { filePath, fileMethods } from './files.shared'

export * from './files.class'
export * from './files.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const file = (app: Application) => {
  // Register our service on the Feathers application
  app.use(filePath, new FileService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: fileMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(filePath).hooks({
    around: {
      all: [
        // schemaHooks.resolveExternal(fileExternalResolver),
        // schemaHooks.resolveResult(fileResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(fileQueryValidator), schemaHooks.resolveQuery(fileQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(fileDataValidator), schemaHooks.resolveData(fileDataResolver)],
      // patch: [schemaHooks.validateData(filePatchValidator), schemaHooks.resolveData(filePatchResolver)],
      remove: [],
    },
    after: {
      all: [],
      get: [
        (ctx) => {
          const { buffer, mimetype, name } = (ctx.dispatch ?? ctx.result) as File

          if (buffer) {
            const isInline = mimetype.match(/^(image|audio|text)\//)
            ctx.http ??= {}
            ctx.http.headers = {
              'content-type': mimetype,
              'content-disposition': isInline
                ? 'inline'
                : contentDisposition(name),
            }
            ctx.dispatch = buffer as unknown as File // Type hack to allow downloadinng the data
          }
        },
      ],
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [filePath]: FileService
  }
}
