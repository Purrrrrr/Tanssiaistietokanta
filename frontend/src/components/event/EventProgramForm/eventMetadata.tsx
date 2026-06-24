import { createContext, useContext } from 'react'

import { Workshop } from 'types'

const emptySet = new Set<string>()

type ImmutableSet<T> = Pick<Set<T>, 'has' | 'forEach' | 'size'>
export type DanceIdSet = ImmutableSet<string>

export const WorkshopsContext = createContext<Workshop[]>([])
export const ChosenDancesContext = createContext<DanceIdSet>(emptySet)

export function useWorkshops() {
  return useContext(WorkshopsContext)
}

export function useChosenDanceIds() {
  return useContext(ChosenDancesContext)
}
