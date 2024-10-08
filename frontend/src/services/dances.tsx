import {useMemo} from 'react'

import {compareBy, sorted} from 'utils/sorted'

import { Dance } from 'types'

import { backendQueryHook, entityCreateHook, entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, setupServiceUpdateFragment, useServiceEvents } from '../backend'

setupServiceUpdateFragment(
  'dances',
  `fragment DanceFragment on Dance {
    _id, name, description, remarks, duration, prelude, formation, category, instructions, slideStyleId
  }`
)

export type WritableDanceProperty = Exclude<keyof Dance, '_id' | '__typename' | 'teachedIn'>

export const useDances = entityListQueryHook('dances', graphql(`
query getDances {
  dances {
    _id, name, description, remarks, duration, prelude, formation, source, category, instructions, slideStyleId
    events {
      _id
      _versionId
      name
    }
  }
}`))

export const useDanceVersions = backendQueryHook(graphql(`
query getDanceVersions($id: ID!) {
  dance(id: $id) {
    _id, _versionId,
    versionHistory {
      calendar {
        date
        versions {
          _versionId
          _versionNumber
          _updatedAt
        }
      }
    }
  }
}`))

export const useDance = backendQueryHook(graphql(`
query getDance($id: ID!) {
  dance(id: $id) {
    _id, name, description, remarks, duration, prelude, formation, source, category, instructions, slideStyleId
    events {
      _id
      _versionId
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
    _id, name, description, remarks, duration, prelude, formation, source, category, instructions, slideStyleId
    events {
      _id
      _versionId
      name
    }
  }
}`))

export const usePatchDance = entityUpdateHook('dances', graphql(`
mutation patchDance($id: ID!, $dance: DancePatchInput!) {
  patchDance(id: $id, dance: $dance) {
    _id, name, description, remarks, duration, prelude, formation, source, category, instructions, slideStyleId
    events {
      _id
      _versionId
      name
    }
  }
}`))

export const useDeleteDance = entityDeleteHook('dances', graphql(`
mutation deleteDance($id: ID!) {
  deleteDance(id: $id) {
    _id, name, description, remarks, duration, prelude, formation, source, category, instructions, slideStyleId
    events {
      _id
      _versionId
      name
    }
  }
}`))


export function filterDances(dances : Dance[], searchString: string): Dance[] {
  return dances.filter(dance => filterDance(dance, searchString))
    .sort(compareDances)
}

function filterDance(dance: Dance, search : string) {
  const lSearch = search.trim().toLowerCase()
  const lName = dance.name.trim().toLowerCase()
  return lName.indexOf(lSearch) !== -1
}

export function sortDances(dances: Dance[]): Dance[] {
  return sorted(dances, compareDances)
}

const compareDances = compareBy(
  function danceSortKey(dance: Dance): string {
    return dance.name.replace(/^(an?|the) */i, '')
  }
)
