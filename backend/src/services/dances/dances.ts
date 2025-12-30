// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  dancesDataValidator,
  dancesPatchValidator,
  dancesQueryValidator,
  dancesResolver,
  dancesExternalResolver,
  dancesDataResolver,
  dancesPatchResolver,
  dancesQueryResolver
} from './dances.schema'

import type { Application } from '../../declarations'
import { DancesService, getOptions } from './dances.class'
import { dancesPath, dancesMethods } from './dances.shared'
import { defaultChannels, withoutCurrentConnection } from '../../utils/defaultChannels'
import { getDependenciesFor } from '../../utils/dependencies'
import { authenticate } from '@feathersjs/authentication'

export * from './dances.class'
export * from './dances.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const dances = (app: Application) => {
  // Register our service on the Feathers application
  app.use(dancesPath, new DancesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: dancesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(dancesPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(dancesExternalResolver), schemaHooks.resolveResult(dancesResolver)],
      create: [authenticate('jwt')],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')],
    },
    before: {
      all: [schemaHooks.validateQuery(dancesQueryValidator), schemaHooks.resolveQuery(dancesQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(dancesDataValidator), schemaHooks.resolveData(dancesDataResolver)],
      patch: [schemaHooks.validateData(dancesPatchValidator), schemaHooks.resolveData(dancesPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  }).publish((data, context) => {
    const eventIds = getDependenciesFor('dances', data, 'usedBy', 'events')
    const workshopIds = getDependenciesFor('dances', data, 'usedBy', 'workshops')

    const channels = [
      ...eventIds.map(id => app.channel(`events/${id}/dances`)),
      ...workshopIds.map(id => app.channel(`workshops/${id}/dances`))
    ]

    return [
      ...withoutCurrentConnection(channels, context),
      ...defaultChannels(app, context)
    ]
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [dancesPath]: DancesService
  }
}
