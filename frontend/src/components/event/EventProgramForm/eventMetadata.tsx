import { createContext, ReactNode, useContext, useRef, useSyncExternalStore } from 'react'

import { Workshop } from 'types'
import { EventProgramSettings } from './types'

const emptySet = new Set<string>()

type ImmutableSet<T> = Pick<Set<T>, 'has' | 'forEach' | 'size'>
export type DanceIdSet = ImmutableSet<string>

const WorkshopsContext = createContext<Workshop[]>([])
const ChosenDancesContext = createContext<DanceIdSet>(emptySet)

export function EventMetadataContext(
  { program, workshops, children }: { workshops: Workshop[], program: EventProgramSettings, children: ReactNode },
) {
  const currentDances = program.danceSets
    .flatMap(set => [
      ...set.program
        .map(row => row.dance)
        .filter(dance => dance != null)
        .map(dance => dance._id),
      set.intervalMusic?.dance?._id,
    ])
    .filter(id => id !== null && id !== undefined)

  const chosenDances = useStableSet(currentDances)

  return <WorkshopsContext.Provider value={workshops}>
    <ChosenDancesContext.Provider value={chosenDances}>
      {children}
    </ChosenDancesContext.Provider>
  </WorkshopsContext.Provider>
}

function notEqual<T>(set: Set<T>, list: T[]) {
  if (set.size !== list.length) return true
  if (list.some(id => !set.has(id))) return true

  for (const id of set) {
    if (!list.includes(id)) return true
  }
  return false
}

function useStableSet<T>(list: T[]): Set<T> {
  const setRef = useRef<Set<T>>(new Set(list))

  const getSnapshot = () => setRef.current
  const subscribe = (onStoreChange: () => void) => {
    if (notEqual(setRef.current, list)) {
      setRef.current = new Set(list)
      onStoreChange()
    }

    return () => {}
  }

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useWorkshops() {
  return useContext(WorkshopsContext)
}

export function useChosenDanceIds() {
  return useContext(ChosenDancesContext)
}
