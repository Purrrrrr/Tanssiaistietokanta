// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { hooks as schemaHooks } from '@feathersjs/schema'
import contentDisposition from 'content-disposition'

import {
  fileDataValidator,
  filePatchValidator,
  fileQueryValidator,
  fileDataResolver,
  filePatchResolver,
  fileQueryResolver,
} from './files.schema'

import type { Application, HookContext } from '../../declarations'
import { File, FileService, getOptions } from './files.class'
import { filePath, fileMethods } from './files.shared'
import { authenticate } from '@feathersjs/authentication'

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
      ],
      find: [authenticate('refreshToken', 'jwt')],
      get: [authenticate('refreshToken', 'jwt')],
      create: [authenticate('jwt')],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')],
    },
    before: {
      all: [schemaHooks.validateQuery(fileQueryValidator), schemaHooks.resolveQuery(fileQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(fileDataValidator), schemaHooks.resolveData(fileDataResolver)],
      update: [schemaHooks.validateData(fileDataValidator), schemaHooks.resolveData(fileDataResolver)],
      patch: [schemaHooks.validateData(filePatchValidator), schemaHooks.resolveData(filePatchResolver)],
      remove: [],
    },
    after: {
      all: [],
      find: [
        (ctx) => {
          const files = (ctx.dispatch ?? ctx.result) as File[]

          const file = files[0]
          if (file?.buffer) {
            addDownloadHeaders(ctx, file, true)
            ctx.dispatch = file.buffer as unknown as File // Type hack to allow downloadinng the data
          }
        },
      ],
      get: [
        (ctx) => {
          const file = (ctx.dispatch ?? ctx.result) as File

          if (file.buffer) {
            addDownloadHeaders(ctx, file)
            ctx.dispatch = file.buffer as unknown as File // Type hack to allow downloadinng the data
          }
        },
      ],
    },
    error: {
      all: [],
    },
  })
}

function addDownloadHeaders(ctx: HookContext, { name, mimetype }: Pick<File, 'name' | 'mimetype'>, forceDownload = false) {
  const isInline = !forceDownload && mimetype.match(/^(image|audio|text)\//)
  ctx.http ??= {}
  ctx.http.headers = {
    'content-type': mimetype,
    'content-disposition': isInline
      ? 'inline'
      : contentDisposition(name),
  }
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [filePath]: FileService
  }
}
