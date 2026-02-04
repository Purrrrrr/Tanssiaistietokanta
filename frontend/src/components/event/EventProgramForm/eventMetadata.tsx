import { createContext, ReactNode, useContext, useRef } from 'react'

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
  const chosenDancesRef = useRef<Set<string>>(emptySet)

  const currentDances = program.danceSets
    .flatMap(set => [
      ...set.program
        .map(row => row.dance)
        .filter(dance => dance != null)
        .map(dance => dance._id),
      set.intervalMusic?.dance?._id,
    ])
    .filter(id => id !== null && id !== undefined)

  if (notEqual(chosenDancesRef.current, currentDances)) {
    chosenDancesRef.current = new Set(currentDances)
  }

  return <WorkshopsContext.Provider value={workshops}>
    <ChosenDancesContext.Provider value={chosenDancesRef.current}>
      {children}
    </ChosenDancesContext.Provider>
  </WorkshopsContext.Provider>
}

function notEqual<T>(set: Set<T>, list: T[]) {
  if (list.some(id => !set.has(id))) return true

  for (const id of set) {
    if (!list.includes(id)) return true
  }
  return false
}

export function useWorkshops() {
  return useContext(WorkshopsContext)
}

export function useChosenDanceIds() {
  return useContext(ChosenDancesContext)
}
