import { useEffect, useMemo, useRef } from 'react'

import type { SubscriptionCallback } from '../types'

export function useSubscriptions<State>(state: State) {
  const callbacks = useRef<Set<SubscriptionCallback<State>>>(new Set())

  const api = useMemo(() => {
    function subscribe(callback: SubscriptionCallback<State>) {
      callbacks.current.add(callback)
      return () => void callbacks.current.delete(callback)
    }
    const trigger = (state: State) => {
      for (const callback of callbacks.current) {
        callback(state)
      }
    }

    return {
      subscribe, trigger,
    }
  }, [])
  const { trigger } = api

  useEffect(
    () => { trigger(state) },
    [state, trigger],
  )

  return api
}
