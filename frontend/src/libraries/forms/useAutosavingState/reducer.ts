import { useReducer } from 'react'
import * as L from 'partial.lenses'

import { MergeableObject, MergeData, MergeResult, toFinalMergeResult } from './types'
import { StringPath, Version } from '../types'

import createDebug from 'utils/debug'

import mergeValues from './merge'

export type SyncEvent = 'LOCAL_MODIFICATION' | 'PATCH_SENT' | 'PATCH_RESOLVED' | 'EXTERNAL_MODIFICATION' | 'CONFLICT_RESOLVED'

const debug = createDebug('useAutoSavingState')

export interface SyncStore<T> {
  patchPending: boolean
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
  type: 'PATCH_RESOLVED'
} | {
  type: 'LOCAL_MODIFICATION'
  modifications: T | ((t: T) => T)
} | {
  type: 'CONFLICT_RESOLVED'
  path: StringPath<T>
  version: Version
}

export function useAutosavingStateReducer<T extends MergeableObject>(serverState: T) {
  return useReducer<SyncStore<T>, T, [SyncAction<T>]>(reducer, serverState, getInitialState)
}

function getInitialState<T extends MergeableObject>(serverState: T): SyncStore<T> {
  return {
    patchPending: false,
    serverState,
    serverStateTime: now(),
    conflictOrigin: null,
    mergeResult: {
      state: 'IN_SYNC',
      modifications: serverState,
      nonConflictingModifications: serverState,
      conflicts: new Map(),
    },
  }
}

function reducer<T extends MergeableObject>(reducerState: SyncStore<T>, action: SyncAction<T>): SyncStore<T> {
  const { mergeResult: { modifications, nonConflictingModifications }, serverState } = reducerState
  debug(action.type)
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
        reducerState.patchPending,
      )
    }
    case 'PATCH_SENT':
      return {
        ...reducerState,
        serverState: nonConflictingModifications,
        patchPending: true,
      }
    case 'PATCH_RESOLVED':
      return {
        ...reducerState,
        patchPending: false,
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
        reducerState.patchPending,
      )
  }
}
function resolveConflict<T extends MergeableObject>(reducerState: SyncStore<T>, path: StringPath<T>, version: Version): SyncStore<T> {
  const { mergeResult: { modifications, conflicts }, serverState } = reducerState
  const conflict = conflicts.get(String(path))
  if (!conflict) return reducerState

  switch (version) {
    case 'LOCAL':
    {
      const { mergeResult: { state, ...mergeResult }, ...merged } = merge(
        {
          server: L.set(conflict.serverPath, conflict.local, serverState),
          original: reducerState.conflictOrigin ?? serverState,
          local: modifications,
        },
        reducerState.serverStateTime,
        reducerState.patchPending,
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
          local: L.set(conflict.localPath, conflict.server, modifications),
        },
        reducerState.serverStateTime,
        reducerState.patchPending,
      )
  }
}

function merge<T extends MergeableObject>(mergeData: MergeData<T>, serverStateTime: number, patchPending: boolean): SyncStore<T> {
  const mergeResult = toFinalMergeResult(mergeValues(mergeData))
  const hasConflicts = mergeResult.state === 'CONFLICT'

  debug({ mergeData, mergeResult })

  return {
    patchPending,
    serverState: mergeData.server,
    serverStateTime,
    mergeResult,
    conflictOrigin: hasConflicts ? mergeData.original : null,
  }
}

function now(): number {
  return +new Date()
}
