// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import type { HookContext, Application } from '../../declarations'

import {
  volunteersDataValidator,
  volunteersPatchValidator,
  volunteersQueryValidator,
  volunteersResolver,
  volunteersExternalResolver,
  volunteersDataResolver,
  volunteersPatchResolver,
  volunteersQueryResolver,
} from './volunteers.schema'

import { VolunteersService, getOptions } from './volunteers.class'
import { volunteersPath, volunteersMethods } from './volunteers.shared'
import { defaultChannels } from '../../utils/defaultChannels'

export * from './volunteers.class'
export * from './volunteers.schema'

async function followDuplicatedBy(context: HookContext) {
  const result = context.result
  if (!result?.duplicatedBy || context.params?.query?._versionId || context.params?._skipDuplicatedByFollow) return
  // Follow the chain, guarding against cycles
  const visited = new Set<string>([result._id])
  let current = result
  while (current.duplicatedBy && !visited.has(current.duplicatedBy)) {
    visited.add(current.duplicatedBy)
    current = await context.service.get(current.duplicatedBy, { ...context.params, _skipDuplicatedByFollow: true })
  }
  context.result = current
}

// A configure function that registers the service and its hooks via `app.configure`
export const volunteers = (app: Application) => {
  // Register our service on the Feathers application
  app.use(volunteersPath, new VolunteersService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: volunteersMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(volunteersPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(volunteersExternalResolver), schemaHooks.resolveResult(volunteersResolver)],
    },
    before: {
      all: [schemaHooks.validateQuery(volunteersQueryValidator), schemaHooks.resolveQuery(volunteersQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(volunteersDataValidator), schemaHooks.resolveData(volunteersDataResolver)],
      patch: [schemaHooks.validateData(volunteersPatchValidator), schemaHooks.resolveData(volunteersPatchResolver)],
      remove: [],
    },
    after: {
      all: [],
      get: [followDuplicatedBy],
    },
    error: {
      all: [],
    },
  }).publish((_data, context) => defaultChannels(app, context))

  app.service('access').setAccessStrategy('volunteers', {
    authTarget: 'everything',
    authorize({ user, action }) {
      if (action === 'read' || action === 'list') {
        return true
      }

      return !!user
    },
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [volunteersPath]: VolunteersService
  }
}
