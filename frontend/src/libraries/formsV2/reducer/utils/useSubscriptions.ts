import { useMemo, useRef } from 'react'

import type { SubscriptionCallback } from '../types'

export function useSubscriptions<State>() {
  const callbacks = useRef<Set<SubscriptionCallback<State>>>(new Set())

  return useMemo(() => {
    function subscribe(callback: SubscriptionCallback<State>) {
      callbacks.current.add(callback)
      return () => void callbacks.current.delete(callback)
    }
    const trigger = (state: State) => {
      for (const  callback of callbacks.current) {
        callback(state)
      }
    }

    return {
      subscribe, trigger
    }
  }, [])
}
