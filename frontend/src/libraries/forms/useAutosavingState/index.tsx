import {Reducer, useCallback, useEffect, useReducer, useState} from 'react'

import createDebug from 'utils/debug'

import {ChangeSet, MergeableObject, SyncState} from './types'

import {FormProps} from '../Form'
import {OnChangeHandler} from '../types'
import mergeValues from './merge'
import {PatchStrategy} from './patchStrategies'

const debug = createDebug('useAutoSavingState')

const AUTOSAVE_DELAY = 50

export type { PatchStrategy } from './patchStrategies'
export * as patchStrategy from './patchStrategies'
export type { SyncState } from './types'

export type UseAutosavingStateReturn<T extends MergeableObject> = {
  value: T
  onChange: OnChangeHandler<T>
  formProps: AutosavingFormProps<T>
  state: SyncState
  resolveConflict: (resolutions: ConflictResolutions<T>) => unknown,
}

type AutosavingFormProps<T> = Pick<Required<FormProps<T>>, 'value' | 'onChange' | 'onValidityChange'>

type SyncEvent = 'LOCAL_MODIFICATION' | 'PATCH_SENT' | 'EXTERNAL_MODIFICATION' | 'CONFLICT_RESOLVED'

interface SyncStore<T> {
  state: SyncState
  serverState: T
  serverStateTime: number
  modifications: T
  conflictOrigin: null | T
  changes: ChangeSet<T> | null
}

interface SyncAction {
  type: SyncEvent
  payload?: any
}

const DISABLE_CONFLICT_OVERRIDE_DELAY = 1000 * 60 * 5 //Disable saving and overwriting conflicts after five minutes

export const USE_BACKEND_VALUE = Symbol('useBackendValue')
export const USE_LOCAL_VALUE = Symbol('useLocalValue')
export type ConflictResolutions<T extends MergeableObject> = {
  [key in (keyof T)] ?: T[key] | typeof USE_LOCAL_VALUE | typeof USE_BACKEND_VALUE
}

export function useAutosavingState<T extends MergeableObject, Patch>(
  serverState : T,
  onPatch : (patch : Patch) => void,
  patchStrategy: PatchStrategy<T, Patch>,
  refreshData?: () => unknown,
) : UseAutosavingStateReturn<T>
{
  const [hasErrors, setHasErrors] = useState(false)
  const [reducerState, dispatch] = useReducer<Reducer<SyncStore<T>, SyncAction>, T>(reducer, serverState, getInitialState)
  const { serverState: originalData, serverStateTime, state, changes, modifications } = reducerState

  useEffect(() => {
    dispatch({ type: 'EXTERNAL_MODIFICATION', payload: serverState })
  }, [serverState])

  useEffect(() => {
    if (state === 'IN_SYNC') return

    const id = setTimeout(() => {
      if (hasErrors) return
      if (state === 'CONFLICT' && now() - serverStateTime > DISABLE_CONFLICT_OVERRIDE_DELAY) {
        debug('Not saving conflict data on top of stale data')
        refreshData && refreshData()
        return
      }
      if (changes !== null) {
        const patch= patchStrategy(originalData, modifications, changes)

        debug('Saving', patch)
        dispatch({ type: 'PATCH_SENT' })
        //onPatch(patch)
      }
    }, AUTOSAVE_DELAY)

    return () => clearTimeout(id)
  }, [state, modifications, onPatch, originalData, serverStateTime, patchStrategy, changes, refreshData, hasErrors])

  const onModified = useCallback((modifications) => {
    dispatch({ type: 'LOCAL_MODIFICATION', payload: modifications})
  }, [])
  const resolveConflict = useCallback((resolutions) => {
    dispatch({ type: 'CONFLICT_RESOLVED', payload: resolutions})
  }, [])

  const onValidityChange = useCallback(
    ({hasErrors}) => setHasErrors(hasErrors),
    []
  )

  return {
    formProps: {
      value: modifications,
      onChange: onModified,
      onValidityChange,
    },
    value: modifications,
    onChange: onModified,
    state: hasErrors
      ? 'INVALID'
      : state === 'CONFLICT' ? 'MODIFIED_LOCALLY' : state,
    resolveConflict,
  }
}

function getInitialState<T extends MergeableObject>(serverState: T) : SyncStore<T> {
  return {
    state: 'IN_SYNC',
    serverState,
    serverStateTime: now(),
    modifications: serverState,
    conflictOrigin: null,
    changes: null,
  }
}

function now(): number {
  return +new Date()
}

function reducer<T extends MergeableObject>(reducerState : SyncStore<T>, action : SyncAction) : SyncStore<T> {
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
        { ...modifications, ...changes},
        reducerState.serverStateTime,
      )
    }
    case 'PATCH_SENT':
      return {
        ...reducerState,
        serverState: reducerState.modifications,
        changes: null,
      }
    case 'CONFLICT_RESOLVED':
      return reducerState //TODO: create proper algorithm
    case 'EXTERNAL_MODIFICATION':
      return merge(
        reducerState.conflictOrigin ?? serverState,
        action.payload,
        modifications,
        now(),
      )
  }
}

function merge<T extends MergeableObject>(serverState : T, newServerState : T, newModifications : T, serverStateTime: number) : SyncStore<T> {
  const { state, modifications, changes } = mergeValues({
    server: newServerState,
    original: serverState,
    local: newModifications,
  })

  const hasConflicts = state === 'CONFLICT'

  return {
    state,
    serverState: newServerState,
    serverStateTime,
    conflictOrigin: hasConflicts ? serverState : null,
    modifications,
    changes,
  }
}
