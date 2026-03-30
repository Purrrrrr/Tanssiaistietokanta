import { createContext, useContext } from 'react'

import { useEvent } from 'services/events'

type E = NonNullable<ReturnType<typeof useEvent>[0]>
export const EventContext = createContext<E>(null as unknown as E)

export function useCurrentEvent() {
  return useContext(EventContext)
}
