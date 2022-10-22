import {Reducer, useEffect, useCallback, useReducer} from 'react'
import mergeValues from './mergeValues'
import {PatchStrategy} from './patchStrategies'
import {SyncState, Path } from './types'
import createDebug from 'utils/debug'

const debug = createDebug('useAutoSavingState')

const AUTOSAVE_DELAY = 50

export * from './patchStrategies'
export type { SyncState } from './types'

export type UseAutosavingStateReturn<T> = [
  T,
  (saved: T | ((t: T) => T)) => unknown,
  SyncStore<T> & {
    resolveConflict: (resolutions: ConflictResolutions<T>) => unknown,
  }
]

type SyncEvent = 'LOCAL_MODIFICATION' | 'PATCH_SENT' | 'EXTERNAL_MODIFICATION' | 'CONFLICT_RESOLVED'

interface SyncStore<T> {
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

export const USE_BACKEND_VALUE = Symbol('useBackendValue')
export const USE_LOCAL_VALUE = Symbol('useLocalValue')
export type ConflictResolutions<T> = {
  [key in (keyof T)] ?: T[key] | typeof USE_LOCAL_VALUE | typeof USE_BACKEND_VALUE
}

export default function useAutosavingState<T, Patch>(
  serverState : T,
  onPatch : (patch : Patch) => void,
  patchStrategy: PatchStrategy<T, Patch>
) : UseAutosavingStateReturn<T>
{
  const [reducerState, dispatch] = useReducer<Reducer<SyncStore<T>, SyncAction>, T>(reducer, serverState, getInitialState)
  const { serverState: originalData, state, modifications, conflicts } = reducerState

  useEffect(() => {
    dispatch({ type: 'EXTERNAL_MODIFICATION', payload: serverState })
  }, [serverState])

  useEffect(() => {
    if (state === 'IN_SYNC') return

    const id = setTimeout(() => {
      //const patchData = patchStrategy(originalData, modifications, conflicts)
      const patchData = patchStrategy(originalData, modifications, [])
      if (patchData.hasModifications) {
        debug('Saving', patchData.patch)
        dispatch({ type: 'PATCH_SENT', payload: patchData.patch})
        onPatch(patchData.patch)
      }
    }, AUTOSAVE_DELAY)

    return () => clearTimeout(id)
  }, [state, modifications, conflicts, onPatch, originalData, patchStrategy])

  const onModified = useCallback((modifications) => {
    dispatch({ type: 'LOCAL_MODIFICATION', payload: modifications})
  }, [])
  const resolveConflict = useCallback((resolutions) => {
    dispatch({ type: 'CONFLICT_RESOLVED', payload: resolutions})
  }, [])

  return [
    modifications,
    onModified,
    {
      ...reducerState,
      state: state === 'CONFLICT' ? 'MODIFIED_LOCALLY' : state,
      resolveConflict,
    }
  ]
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
    {
      const changes = typeof action.payload == 'function'
        ? action.payload(modifications)
        : action.payload
      return merge(
        reducerState.conflictOrigin ?? serverState,
        serverState,
        { ...modifications, ...changes}
      )
    }
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
  })

  const hasConflicts = state === 'CONFLICT'

  return {
    state,
    serverState: newServerState,
    conflictOrigin: hasConflicts ? serverState : null,
    modifications: pendingModifications,
    conflicts: conflicts
  }
}
