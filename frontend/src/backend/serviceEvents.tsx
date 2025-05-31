import {useEffect } from 'react'
import {EventEmitter} from 'events'

import {Entity, ID, ServiceName} from './types'

import createDebug from 'utils/debug'
import {getOrComputeDefault} from 'utils/map'

import {DocumentNode, gql} from './apollo'
import {markDeleted, updateEntityFragment} from './apolloCache'
import {closeChannelIfUnsused, ensureChannelIsOpen} from './channels'
import { socket } from './feathers'

const debug = createDebug('serviceEvents')

const serviceTypeNameMap : {
  [key in ServiceName]: string
} = {
  dances: 'Dance',
  events: 'Event',
  workshops: 'Workshop',
}
const serviceUpdateFragmentMap : {
  [key in ServiceName]?: DocumentNode
} = {}

export type EventName = 'created' | 'removed' | 'updated'
export type Callback<T extends Entity> = (data: T, source: 'backend' | 'frontend') => unknown
export type EntityListCallbacks<T extends Entity> = Required<Callbacks<T>>
export type EntityCallbacks<T extends Entity> = Omit<EntityListCallbacks<T>, 'created'>
type Callbacks<T extends Entity> = {
  [property in EventName]?: Callback<T>
}

export function setupServiceUpdateFragment(service: ServiceName, fragment: string) {
  serviceUpdateFragmentMap[service] = gql(fragment)
}

export function emitServiceEvent(service: ServiceName, eventName: EventName, data: unknown) {
  getServiceEventEmitter(service).emit(eventName, data, 'frontend')
}

export function useServiceListEvents<T extends Entity>(service : ServiceName, callbacks : EntityListCallbacks<T>) {
  return useServiceEvents(service, service, callbacks)
}
export function useEntityEvents<T extends Entity>(service : ServiceName, id: ID, callbacks: EntityCallbacks<T>) {
  return useServiceEvents(service, `${service}/${id}`, callbacks)
}

export function useServiceEvents<T extends Entity>(service : ServiceName, channel : string, callbacks : Callbacks<T>) {
  useEffect(() => {
    subscribeToService(service, channel, callbacks)
    return () => unSubscribeToService(service, channel, callbacks)
  }, [service, channel, callbacks])
}

function subscribeToService<T extends Entity>(serviceName : ServiceName, channel: string, callbacks : Callbacks<T>) {
  debug(`subscribe service ${serviceName}`)
  ensureChannelIsOpen(channel, callbacks)

  const service = getServiceEventEmitter(serviceName)
  for (const eventName of Object.keys(callbacks)) {
    service.on(eventName, callbacks[eventName])
  }
}
function unSubscribeToService<T extends Entity>(serviceName : ServiceName, channel: string, callbacks : Callbacks<T>) {
  debug(`unsubscribe service ${serviceName}`)

  const service = getServiceEventEmitter(serviceName)
  for (const eventName of Object.keys(callbacks)) {
    service.off(eventName, callbacks[eventName])
  }

  closeChannelIfUnsused(channel, callbacks)
}

const serviceEventEmitters : Map<ServiceName, EventEmitter> = new Map()

function getServiceEventEmitter(
  serviceName: ServiceName
) : EventEmitter {
  return getOrComputeDefault(serviceEventEmitters, serviceName, () => {
    const emitter = new EventEmitter()
    emitter.setMaxListeners(40)
    const typeName = serviceTypeNameMap[serviceName]
    const entityFragment = serviceUpdateFragmentMap[serviceName]
    if (!entityFragment) {
      throw new Error('Missing update fragment for service '+serviceName)
    }
    socket.on(`${serviceName} created`, (data: unknown) => debug('received created', data))
    socket.on(`${serviceName} removed`, (data: unknown) => debug('received removed', data))
    socket.on(`${serviceName} updated`, (data: unknown) => debug('received updated', data))
    socket.on(`${serviceName} patched`, (data: unknown) => debug('received patched', data))

    socket.on(`${serviceName} created`, (data: unknown) => emitter.emit('created', data, 'backend'))
    socket.on(`${serviceName} removed`, (data: unknown) => emitter.emit('removed', data, 'backend'))
    socket.on(`${serviceName} updated`, (data: unknown) => emitter.emit('updated', data, 'backend'))
    socket.on(`${serviceName} patched`, (data: unknown) => emitter.emit('updated', data, 'backend'))

    emitter.on('removed', markDeleted)
    emitter.on('updated', function updateCache(data, source) {
      debug('updated', serviceName, source, data)
      if (source !== 'backend' || entityFragment === undefined) {
        return
      }
      debug('updating entity fragment')
      updateEntityFragment(typeName, entityFragment, data)
    })

    return emitter
  })
}

