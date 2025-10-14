import { useMemo, useState } from 'react'

type WithId<X> = X & {
  id: number
}

let idCounter = 0

export function useQueue<T>(initialState: WithId<T>[] = []) {
  const [items, setItems] = useState<WithId<T>[]>(initialState)

  const queueApi = useMemo(() => {
    const updateItem = (id: number, state: Partial<T>) => setItems(items =>
      items.map(u => u.id === id ? { ...u, ...state } : u)
    )
    const removeItem = (id: number) => {
      setItems(items => items.filter(u => u.id != id))
    }

    const pushItem = (item: T) => {
      const id = ++idCounter
      setItems(items => [
        ...items,
        { id, ...item },
      ])
      return id
    }
    return {
      update: updateItem,
      remove: removeItem,
      push: pushItem,
    }
  }, [])

  return [items, queueApi] as const
}
