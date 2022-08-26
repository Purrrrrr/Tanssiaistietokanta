import {useEffect } from 'react'
import {EventEmitter} from 'events'
import {getOrComputeDefault} from 'utils/map'
import feathers from './feathers'
import {ensureChannelIsOpen, closeChannelIfUnsused} from './channels'
import {gql, DocumentNode} from './apollo'
import {updateEntityFragment, markDeleted} from './apolloCache'
import {ServiceName, ID, Entity} from './types'

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
export type Callback<T extends Entity> = (data: T) => any
export type EntityListCallbacks<T extends Entity> = Required<Callbacks<T>>
export type EntityCallbacks<T extends Entity> = Omit<EntityListCallbacks<T>,'created'>
type Callbacks<T extends Entity> = {
  [property in EventName]?: Callback<T>
}

export function setupServiceUpdateFragment(service: ServiceName, fragment: string) {
  serviceUpdateFragmentMap[service] = gql(fragment);
}

export function emitServiceEvent(service: ServiceName, eventName: EventName, data: any) {
  getServiceEventEmitter(service).emit(eventName, data, 'frontend')
}

export function useServiceListEvents<T extends Entity>(service : ServiceName, callbacks : EntityListCallbacks<T>) {
  return useServiceEvents(service, service, callbacks)
}
export function useEntityEvents<T extends Entity>(service : ServiceName, id: ID, callbacks: EntityCallbacks<T>) {
  return useServiceEvents(service, `${service}/${id}`, callbacks)
}

function useServiceEvents<T extends Entity>(service : ServiceName, channel : string, callbacks : Callbacks<T>) {
  useEffect(() => {
    subscribeToService(service, channel, callbacks)
    return () => unSubscribeToService(service, channel, callbacks)
  }, [service, channel, callbacks]) 
}

function subscribeToService<T extends Entity>(serviceName : ServiceName, channel: string, callbacks : Callbacks<T>) {
  console.log(`subscribe service ${serviceName}`)
  ensureChannelIsOpen(channel, callbacks)

  const service = getServiceEventEmitter(serviceName)
  for (const eventName of Object.keys(callbacks)) {
    service.on(eventName, callbacks[eventName])
  }
}
function unSubscribeToService<T extends Entity>(serviceName : ServiceName, channel: string, callbacks : Callbacks<T>) {
  console.log(`unsubscribe service ${serviceName}`)

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
    const service = feathers.service(serviceName)
    const emitter = new EventEmitter()
    const typeName = serviceTypeNameMap[serviceName]
    const entityFragment = serviceUpdateFragmentMap[serviceName]
    if (!entityFragment) {
      console.error("Missing update fragment for service "+serviceName)
    }

    service.on('created', (data: any) => emitter.emit('created', data, 'backend'))
    service.on('removed', (data: any) => emitter.emit('removed', data, 'backend'))
    service.on('updated', (data: any) => emitter.emit('updated', data, 'backend'))
    service.on('patched', (data: any) => emitter.emit('updated', data, 'backend'))

    emitter.on('removed', markDeleted)
    emitter.on('updated', function updateCache(data, source) {
      if (source !== 'backend' || entityFragment === undefined) {
        return
      }
      updateEntityFragment(typeName, entityFragment, data)
    })
    
    return emitter;
  })
}

