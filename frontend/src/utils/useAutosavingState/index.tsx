import {Reducer, useEffect, useCallback, useReducer} from 'react';
import mergeValues from './mergeValues'
import {PatchStrategy} from './patchStrategies'
import {SyncState, Path } from './types'

export * from './patchStrategies'
export type { SyncState } from './types';

type SyncEvent = 'LOCAL_MODIFICATION' | 'PATCH_SENT' | 'EXTERNAL_MODIFICATION' | 'CONFLICT_RESOLVED'

export interface SyncStore<T> {
  state: SyncState
  serverState: T
  modifications: T
  conflicts: Path<T>[]
  conflictOrigin: null | T
}

interface SyncAction {
  type: SyncEvent
  payload: any
}

export const USE_BACKEND_VALUE = Symbol("useBackendValue")
export const USE_LOCAL_VALUE = Symbol("useLocalValue")
export type ConflictResolutions<T> = {
  [key in (keyof T)] ?: T[key] | typeof USE_LOCAL_VALUE | typeof USE_BACKEND_VALUE
}

export default function useAutosavingState<T, Patch>(
  serverState : T,
  onPatch : (patch : Patch) => void,
  patchStrategy: PatchStrategy<T,Patch>
) : [
  T,
  (saved : T) => any,
  (resolutions: ConflictResolutions<T>) => any,
  SyncStore<T>
]
{
  const [reducerState, dispatch] = useReducer<Reducer<SyncStore<T>, SyncAction>, T>(reducer, serverState, getInitialState)
  const { serverState: originalData, state, modifications, conflicts } = reducerState

  useEffect(() => {
    dispatch({ type: 'EXTERNAL_MODIFICATION', payload: serverState })
  }, [serverState])

  useEffect(() => {
    if (state === 'IN_SYNC') return

    const id = setTimeout(() => {
      const patchData = patchStrategy(originalData, modifications, conflicts)
      if (patchData.hasModifications) {
        console.log('Saving', patchData.patch)
        dispatch({ type: 'PATCH_SENT', payload: patchData.patch})
        onPatch(patchData.patch)
      }
    }, 50)

    return () => clearTimeout(id)
  }, [state, modifications, conflicts, onPatch, originalData, patchStrategy])

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
    modifications: serverState,
    conflicts: [],
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
      return reducerState //TODO: create proper algorithm
    case 'EXTERNAL_MODIFICATION':
      return merge(
        reducerState.conflictOrigin ?? serverState,
        action.payload,
        modifications
      )
  }
}

function merge<T>(serverState : T, newServerState : T, modifications : T) : SyncStore<T> {
  const { state, pendingModifications, conflicts } = mergeValues({
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
    conflicts: conflicts
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
