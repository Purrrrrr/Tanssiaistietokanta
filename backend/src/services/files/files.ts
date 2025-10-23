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

import type { Application, HookContext, NextFunction } from '../../declarations'
import { File, FileData, FileService, getOptions, VirusInfectionError } from './files.class'
import { filePath, fileMethods } from './files.shared'

export * from './files.class'
export * from './files.schema'

async function validateUniqueName(ctx: HookContext, next: NextFunction) {
  const data = (ctx.data as FileData)
  const { root, path } = data
  const filename = data.filename ?? data.upload.originalFilename
  const [duplicateFile] = await ctx.app.service('files').find({ query: { root, path, name: filename }})
  if (duplicateFile && (!ctx.id || ctx.id !== duplicateFile._id)) {
    if (ctx.http) ctx.http.status = 409
    ctx.result = {
      code: 'FILE_EXISTS',
      message: 'The file already exists',
    }
    return
  }
  await next()
}
async function addInfectionStatusCode(ctx: HookContext, next: NextFunction) {
  try {
    await next()
  } catch (e) {
    if (e instanceof VirusInfectionError) {
      if (ctx.http) ctx.http.status = 422
      ctx.result = {
        code: 'FILE_IS_INFECTED',
        message: e.message,
      }
    } else {
      throw e
    }
  }
}

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
      create: [validateUniqueName, addInfectionStatusCode],
      update: [validateUniqueName, addInfectionStatusCode],
      patch: [validateUniqueName],
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
