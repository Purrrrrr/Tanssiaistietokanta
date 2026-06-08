import { useEffect, useId, useSyncExternalStore } from 'react'

const loadingObjects = new Set<string | Promise<unknown>>()
const addLoadingObject = (object: string | Promise<unknown>) => {
  loadingObjects.add(object)
  triggerListeners()
}
const removeLoadingObject = (object: string | Promise<unknown>) => {
  loadingObjects.delete(object)
  triggerListeners()
}

const stateListeners = new Set<() => void>()
const triggerListeners = () => stateListeners.forEach(listener => listener())

const subscribeToGlobalLoadingState = (callback: () => void) => {
  stateListeners.add(callback)
  return () => stateListeners.delete(callback)
}

export function useIsGlobalLoading() {
  return useSyncExternalStore(subscribeToGlobalLoadingState, () => loadingObjects.size > 0)
}

export function addGlobalLoadingAnimation<T>(promise: Promise<T>): Promise<T> {
  addLoadingObject(promise)
  promise.finally(() => removeLoadingObject(promise))
  return promise
}

export function useShowGlobalLoadingAnimation(loading?: boolean) {
  const id = useId()
  useEffect(() => {
    if (loading) {
      addLoadingObject(id)
    } else {
      removeLoadingObject(id)
    }
    return () => removeLoadingObject(id)
  }, [id, loading])
}
