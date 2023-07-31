import {useMemo} from 'react'

import {sorted} from 'utils/sorted'

import { Dance } from 'types'

import { backendQueryHook, entityCreateHook, entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, setupServiceUpdateFragment, useServiceEvents } from '../backend'

setupServiceUpdateFragment(
  'dances',
  `fragment DanceFragment on Dance {
    _id, name, description, remarks, duration, prelude, formation, category, instructions, slideStyleId
  }`
)

export type WritableDanceProperty = Exclude<keyof Dance, '_id' | '__typename' | 'teachedIn'>

export const dancePropertyLabels : {[Key in WritableDanceProperty]: string} = {
  name: 'Nimi',
  description: 'Kuvaus',
  remarks: 'Huomautuksia',
  duration: 'Kesto',
  prelude: 'Alkusoitto',
  formation: 'Tanssikuvio',
  category: 'Kategoria',
  instructions: 'Tanssiohjeet',
  slideStyleId: 'Tanssiaisten diatyyli',
}

export const useDances = entityListQueryHook('dances', graphql(`
query getDances {
  dances {
    _id, name, description, remarks, duration, prelude, formation, category, instructions, slideStyleId
    events {
      _id
      name
    }
  }
}`))

export const useDance = backendQueryHook(graphql(`
query getDance($id: ID!) {
  dance(id: $id) {
    _id, name, description, remarks, duration, prelude, formation, category, instructions, slideStyleId
    events {
      _id
      name
    }
  }
}`), ({refetch, variables}) => {
  if (variables === undefined) throw new Error('Unknown dance id')
  useCallbackOnDanceChanges(variables.id, refetch)
})

function useCallbackOnDanceChanges(danceId, callback) {
  const callbacks = useMemo(() => {
    const updateFn = () => {
      console.log('Dance has changed, running callback')
      callback()
    }
    return {
      created: updateFn,
      updated: updateFn,
      removed: updateFn,
    }
  }, [callback])
  useServiceEvents('dances', `dances/${danceId}`, callbacks)
}

export const useCreateDance = entityCreateHook('dances', graphql(`
mutation createDance($dance: DanceInput!) {
  createDance(dance: $dance) {
    _id, name, description, remarks, duration, prelude, formation, category, instructions, slideStyleId
    events {
      _id
      name
    }
  }
}`))

export const usePatchDance = entityUpdateHook('dances', graphql(`
mutation patchDance($id: ID!, $dance: DancePatchInput!) {
  patchDance(id: $id, dance: $dance) {
    _id, name, description, remarks, duration, prelude, formation, category, instructions, slideStyleId
    events {
      _id
      name
    }
  }
}`))

export const useDeleteDance = entityDeleteHook('dances', graphql(`
mutation deleteDance($id: ID!) {
  deleteDance(id: $id) {
    _id, name, description, remarks, duration, prelude, formation, category, instructions, slideStyleId
    events {
      _id
      name
    }
  }
}`))


export function filterDances(dances : Dance[], searchString: string) {
  return sorted<Dance>(
    dances.filter(dance => filterDance(dance, searchString)),
    (a, b) => a.name.localeCompare(b.name)
  )
}

function filterDance(dance: Dance, search : string) {
  const lSearch = search.trim().toLowerCase()
  const lName = dance.name.trim().toLowerCase()
  return lName.indexOf(lSearch) !== -1
}
