import { useCallback, useState } from 'react'

export function useStoredState<T>(id: string | undefined, prop: string, defaultValue: T): [T, (value: T) => void] {
  const key = `itemlist:${id}:${prop}`
  const [state, setState] = useState<T>(() => {
    if (id === undefined) {
      return defaultValue
    }
    const storedValue = localStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : defaultValue
  })

  const setStoredState = useCallback((value: T) => {
    setState(value)
    if (id !== undefined) localStorage.setItem(key, JSON.stringify(value))
  }, [id, key])

  return [state, setStoredState]
}
