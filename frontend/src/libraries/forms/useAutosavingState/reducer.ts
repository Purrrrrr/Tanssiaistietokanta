import {Reducer, useReducer} from 'react'
import * as L from 'partial.lenses'

import {MergeableObject, MergeData, MergeResult} from './types'

import {StringPath, toArrayPath, Version} from '../types'
import mergeValues from './merge'

export type SyncEvent = 'LOCAL_MODIFICATION' | 'PATCH_SENT' | 'EXTERNAL_MODIFICATION' | 'CONFLICT_RESOLVED'

export interface SyncStore<T> {
  serverState: T
  serverStateTime: number
  conflictOrigin: null | T
  mergeResult: MergeResult<T>
}

export type SyncAction<T> = {
  type: 'EXTERNAL_MODIFICATION'
  serverState: T
} | {
  type: 'PATCH_SENT'
} | {
  type: 'LOCAL_MODIFICATION'
  modifications: T | ((t: T) => T)
} | {
  type: 'CONFLICT_RESOLVED'
  path: StringPath<T>
  version: Version
}

export function useAutosavingStateReducer<T extends MergeableObject>(serverState: T) {
  return useReducer<Reducer<SyncStore<T>, SyncAction<T>>, T>(reducer, serverState, getInitialState)
}

function getInitialState<T extends MergeableObject>(serverState: T) : SyncStore<T> {
  return {
    serverState,
    serverStateTime: now(),
    conflictOrigin: null,
    mergeResult: {
      state: 'IN_SYNC',
      modifications: serverState,
      nonConflictingModifications: serverState,
      conflicts: [],
    }
  }
}

function reducer<T extends MergeableObject>(reducerState : SyncStore<T>, action : SyncAction<T>) : SyncStore<T> {
  const { mergeResult: { modifications, nonConflictingModifications }, serverState } = reducerState
  switch (action.type) {
    case 'LOCAL_MODIFICATION':
    {
      const changes = typeof action.modifications == 'function'
        ? action.modifications(modifications)
        : action.modifications
      return merge(
        {
          server: serverState,
          original: reducerState.conflictOrigin ?? serverState,
          local: changes,
        },
        reducerState.serverStateTime,
      )
    }
    case 'PATCH_SENT':
      return {
        ...reducerState,
        serverState: nonConflictingModifications,
      }
    case 'CONFLICT_RESOLVED':
      return resolveConflict(reducerState, action.path, action.version)
    case 'EXTERNAL_MODIFICATION':
      return merge(
        {
          server: action.serverState,
          original: reducerState.conflictOrigin ?? serverState,
          local: modifications,
        },
        now(),
      )
  }
}
function resolveConflict<T extends MergeableObject>(reducerState: SyncStore<T>, path: StringPath<T>, version: Version) : SyncStore<T> {
  const { mergeResult: { modifications }, serverState } = reducerState
  const lens = toArrayPath(path)
  switch (version) {
    case 'LOCAL':
    {
      const {mergeResult: { state, ...mergeResult }, ...merged} = merge(
        {
          server: L.set(lens, L.get(lens, modifications), serverState),
          original: reducerState.conflictOrigin ?? serverState,
          local: modifications,
        },
        reducerState.serverStateTime,
      )
      return {
        ...merged,
        mergeResult: {
          ...mergeResult,
          state: state === 'IN_SYNC' ? 'MODIFIED_LOCALLY' : state,
        },
        serverState,
      }
    }
    case 'SERVER':
      return merge(
        {
          server: serverState,
          original: reducerState.conflictOrigin ?? serverState,
          local: L.set(lens, L.get(lens, serverState), modifications),
        },
        reducerState.serverStateTime,
      )
  }
}

function merge<T extends MergeableObject>(mergeData: MergeData<T>, serverStateTime: number) : SyncStore<T> {
  const mergeResult = mergeValues(mergeData)

  const hasConflicts = mergeResult.state === 'CONFLICT'

  console.log({mergeData, mergeResult})

  return {
    serverState: mergeData.server,
    serverStateTime,
    mergeResult,
    conflictOrigin: hasConflicts ? mergeData.original : null,
  }
}

function now(): number {
  return +new Date()
}
