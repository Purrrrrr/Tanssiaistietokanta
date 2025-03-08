import { useMemo, useRef } from 'react'

import type { CallbackDefinition, SubscriptionCallback } from './types'
import { type GenericPath, isSubPathOf } from '../types'

import { apply, pluck } from './utils'

export function useSubscriptions<State>() {
  const callbacks = useRef<CallbackDefinition<State>[]>([])

  return useMemo(() => {
    function subscribe(callback: SubscriptionCallback<State>, path: GenericPath = '') {
      const callbackDefinition = { callback, path }
      callbacks.current.push(callbackDefinition)
      return () => { apply(callbacks, 'current', pluck(callbackDefinition)) }
    }
    const subscribeTo = (path: GenericPath) => (c: SubscriptionCallback<State>) => subscribe(c, path)
    const trigger = (changedPath: GenericPath, state: State) => {
      for (const { callback, path } of callbacks.current) {
        if (isSubPathOf(changedPath, path)) {
          callback(state)
        }
      }
    }

    return {
      subscribe, subscribeTo, trigger
    }
  }, [])
}
