import {Reducer, useEffect, useCallback, useReducer} from 'react';
import mergeValues from './mergeValues'
import {SyncState} from './types'

export type { SyncState } from './types';

type SyncEvent = 'LOCAL_MODIFICATION' | 'PATCH_SENT' | 'EXTERNAL_MODIFICATION' | 'CONFLICT_RESOLVED'
export type SuperPartial<T> = {
  [k in (keyof T)]?: SuperPartial<T[k]>
} | undefined


// @ts-ignore
window.m = mergeValues

export interface SyncStore<T extends Object> {
  state: SyncState
  serverState: T
  modifications: SuperPartial<T>
  conflicts: null | (string)[]
  conflictOrigin: null | T
}

interface SyncAction {
  type: SyncEvent
  payload: any
}

export const USE_BACKEND_VALUE = Symbol("useBackendValue")
export const USE_LOCAL_VALUE = Symbol("useLocalValue")
export type ConflictResolutions<T extends Object> = {
  [key in (keyof T)] ?: T[key] | typeof USE_LOCAL_VALUE | typeof USE_BACKEND_VALUE
}

export default function useAutosavingState<T>(
  serverState : T,
  onPatch : (saved : SuperPartial<T>) => void,
) : [T, (saved : T) => any, (resolutions: ConflictResolutions<T>) => any, SyncStore<T>]
{
  const [reducerState, dispatch] = useReducer<Reducer<SyncStore<T>, SyncAction>, T>(reducer, serverState, getInitialState)
  const { state, modifications, conflicts } = reducerState

  useEffect(() => {
    dispatch({ type: 'EXTERNAL_MODIFICATION', payload: serverState })
  }, [serverState])

  useEffect(() => {
    if (state === 'IN_SYNC') return

    const id = setTimeout(() => {
      const patch = getPatch(modifications, conflicts)
      dispatch({ type: 'PATCH_SENT', payload: patch})
// @ts-ignore
      onPatch(patch)
    }, 50)

    return () => clearTimeout(id)
  }, [state, modifications, conflicts, onPatch])

  const onModified = useCallback((modifications) => {
    dispatch({ type: 'LOCAL_MODIFICATION', payload: modifications})
  }, [])
  const onConflictResolved = useCallback((resolutions) => {
    dispatch({ type: 'CONFLICT_RESOLVED', payload: resolutions})
  }, [])

  const formState = {
    ...serverState,
    ...modifications,
  }

  return [formState, onModified, onConflictResolved, reducerState]
}

function getInitialState<T>(serverState: T) : SyncStore<T> {
  return {
    state: 'IN_SYNC',
    serverState,
    modifications: {},
    conflicts: null,
    conflictOrigin: null,
  }
}

function reducer<T>(reducerState : SyncStore<T>, action : SyncAction) : SyncStore<T> {
  const { modifications, serverState } = reducerState
  switch (action.type) {
    case 'LOCAL_MODIFICATION':
      return merge(
        reducerState.conflictOrigin ?? serverState,
        serverState,
        { ...modifications, ...action.payload }
      )
    case 'PATCH_SENT':
      return {
        ...reducerState,
        serverState: { ...serverState, ...action.payload },
      }
    case 'CONFLICT_RESOLVED':
      return resolveConflicts(reducerState, action.payload)
    case 'EXTERNAL_MODIFICATION':
// @ts-ignore
      return merge(
        reducerState.conflictOrigin ?? serverState,
        action.payload,
        modifications
      )
  }
}

function merge<T>(serverState : T, newServerState : T, modifications : T) : SyncStore<T> {
  const { state, pendingModifications, conflicts } = mergeValues({
    key: '',
    server: newServerState,
    original: serverState,
    local: modifications,
  });

  const hasConflicts = state === 'CONFLICT'

  return {
    state,
    serverState: newServerState,
    conflictOrigin: hasConflicts ? serverState : null,
    modifications: pendingModifications,
    conflicts: hasConflicts ? conflicts : null,
  }
}

function resolveConflicts<T extends Object>(
  storeState: SyncStore<T>,
  resolutions: ConflictResolutions<T>
) : SyncStore<T> {
  const { conflicts, modifications, conflictOrigin } = storeState;

  const newModifications = {...modifications}
  const [solvedConflicts, remainingConflicts] = partition(conflicts!, key => key in resolutions)
  const newConflictOrigin : T = {...conflictOrigin!}

  /*
  for (const key of solvedConflicts) {
    const resolution = resolutions[key]
    if (resolution === USE_BACKEND_VALUE) {
      delete newModifications[key]
    } else if (resolution === USE_LOCAL_VALUE) {
      newConflictOrigin[key] = modifications[key]! ?? conflictOrigin![key]
    } else {
      newModifications[key] = resolution as T[typeof key]
    }
  }*/

  const hasConflicts = remainingConflicts.length > 0
  const hasModifications = Object.keys(newModifications).length > 0

  let state : SyncState = 'IN_SYNC'
  if (hasConflicts) state = 'CONFLICT'
  else if (hasModifications) state = 'MODIFIED_LOCALLY'

  return {
    ...storeState,
    state,
    conflicts: hasConflicts ? remainingConflicts : null,
    conflictOrigin: hasConflicts ? newConflictOrigin : null,
    modifications: newModifications,
  }
}

function partition<T>(
  array : T[], condition : (i:T) => boolean
) : [T[], T[]] {
  const passing : T[] = []
  const failing : T[] = []

  for (const item of array) {
    (condition(item) ? passing : failing).push(item)
  }

  return [passing, failing]
}

function getPatch<T>(modifications : T, conflicts : string[] | null) : SuperPartial<T> {
  if (conflicts === null) return modifications

  //TODO: fix this
  //const patch = { ...modifications }
  //conflicts.forEach(key => delete patch[key])
  return {} //patch
}
