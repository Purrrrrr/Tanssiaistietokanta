import {useEffect, useMemo} from 'react'
import feathers from './feathers'
import {ensureChannelIsOpen, closeChannelIfUnsused} from './channels'

type ID = string
type ServiceName = string

type Callback<T> = (data: T) => any

type EventName = 'created' | 'removed' | 'updated'
type EntityListCallbacks<T> = Required<Callbacks<T>>
type EntityCallbacks<T> = Omit<EntityListCallbacks<T>,'created'>
type Callbacks<T> = {
  [property in EventName]?: Callback<T>
}

export function useServiceListEvents<T>(service : ServiceName, callbacks : EntityListCallbacks<T>) {
  return useServiceEvents(service, service, callbacks)
}
export function useEntityEvents<T>(service : ServiceName, id: string, callbacks: EntityCallbacks<T>) {
  return useServiceEvents(service, `${service}/${id}`, callbacks)
}

function useServiceEvents<T>(service : ServiceName, channel : string, callbacks : Callbacks<T>) {
  useEffect(() => {
    subscribeToService(service, callbacks)
    return () => unSubscribeToService(service, callbacks)
  }, [service, callbacks]) 
}

function subscribeToService<T>(serviceName : ServiceName, callbacks : Callbacks<T>) {
  console.log(`subscribe service ${serviceName}`)
  ensureChannelIsOpen(serviceName, callbacks)

  const service = feathers.service(serviceName)
  Object.entries(callbacks)
    .forEach(
      ([eventName, callback]) => service.on(eventName, callback)
    )
  if ('updated' in callbacks) {
    service.on('patched', callbacks.updated)
  }
}
function unSubscribeToService<T>(serviceName : ServiceName, callbacks : Callbacks<T>) {
  console.log(`unsubscribe service ${serviceName}`)
  const service = feathers.service(serviceName)
  Object.entries(callbacks)
    .forEach(
      ([eventName, callback]) => service.off(eventName, callback)
    )
  if ('updated' in callbacks) {
    service.off('patched', callbacks.updated)
  }

  closeChannelIfUnsused(serviceName, callbacks)
}
