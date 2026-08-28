import { useEffect, useState } from 'react'

export function useStoredState<T>(id: string | undefined, prop: string, defaultValue: T): [T, (value: T | ((fn: T) => T)) => void] {
  const key = `itemlist:${id}:${prop}`
  const [state, setState] = useState<T>(() => {
    if (id === undefined) {
      return defaultValue
    }
    const storedValue = localStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : defaultValue
  })
  useEffect(() => {
    if (id !== undefined) localStorage.setItem(key, JSON.stringify(state))
  }, [id, key, state])

  return [state, setState]
}
