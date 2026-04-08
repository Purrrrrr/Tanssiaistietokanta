// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { hooks as schemaHooks } from '@feathersjs/schema'
import { uniq } from 'ramda'

import {
  workshopsDataValidator,
  workshopsPatchValidator,
  workshopsQueryValidator,
  workshopsResolver,
  workshopsExternalResolver,
  workshopsDataResolver,
  workshopsPatchResolver,
  workshopsQueryResolver,
} from './workshops.schema'

import type { Application } from '../../declarations'
import type { WorkshopInstance } from './workshops.schema'
import { WorkshopsService, getOptions } from './workshops.class'
import { workshopsPath, workshopsMethods } from './workshops.shared'
import { defaultChannels, withoutCurrentConnection } from '../../utils/defaultChannels'
import { getDependenciesFor } from '../../internal-services/dependencies'
import getFromData from '../../utils/getFromData'
import { SkipAccessControl } from '../access/hooks'

export * from './workshops.class'
export * from './workshops.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const workshops = (app: Application) => {
  // Register our service on the Feathers application
  app.use(workshopsPath, new WorkshopsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: workshopsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })

  // Initialize hooks
  app.service(workshopsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(workshopsExternalResolver),
        schemaHooks.resolveResult(workshopsResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(workshopsQueryValidator),
        schemaHooks.resolveQuery(workshopsQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(workshopsDataValidator),
        schemaHooks.resolveData(workshopsDataResolver),
      ],
      patch: [
        async ({ data, service, id }) => {
          if (id === undefined || Array.isArray(data)) throw new Error('Cannot patch multiple documents')
          if (data?.instances) {
            const { instances: oldInstances } = await service.get(id)
            data.instances = data.instances.map(instance => (
              {
                description: '',
                ...oldInstances.find(o => o._id === instance._id),
                ...instance as (Omit<WorkshopInstance, 'description'> & { description?: string }),
              }
            ))
          }
        },
        schemaHooks.validateData(workshopsPatchValidator),
        schemaHooks.resolveData(workshopsPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
    error: {
      all: [],
    },
  }).publish((data, context) => {
    const eventIds = getFromData(data, item => item.eventId)
    // The dependency graph is not updated yet. We can get our previous dances from there in case some were removed
    const previousDanceIds = getDependenciesFor('workshops', data, 'uses', 'dances')
    const nextDanceIds = getFromData(data, item => item.instances.flatMap(i => i.danceIds)).flat()
    const danceIds = uniq([...nextDanceIds, ...previousDanceIds])

    const channels = [
      ...eventIds.map(id => app.channel(`events/${id}/workshops`)),
      ...danceIds.map(id => app.channel(`dances/${id}/workshops`)),
    ]

    return [
      ...withoutCurrentConnection(channels, context),
      ...defaultChannels(app, context),
    ]
  })

  const service = app.service('workshops')
  const accessService = app.service('access')

  accessService.setAccessStrategy('workshops', {
    getOwnerFromData(workshop) {
      return workshop
        ? { owningId: workshop.eventId }
        : undefined
    },
    getEntityOwner: async (entityId) => {
      const result = await service.get(entityId, { [SkipAccessControl]: true, query: { $select: ['eventId'] } })
      return { owner: 'events', owningId: result.eventId }
    },
    authTarget: 'owner',
    authorize({ action, user, owningId: eventId }) {
      const effectiveAction = action === 'create' ? 'modify' : action
      return accessService.hasAccess('events', effectiveAction, user, eventId)
    },
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [workshopsPath]: WorkshopsService
  }
}
