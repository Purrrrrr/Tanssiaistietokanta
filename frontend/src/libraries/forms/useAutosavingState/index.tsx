import {useCallback, useEffect, useState} from 'react'

import createDebug from 'utils/debug'

import {MergeableObject, SyncState} from './types'

import {FormProps} from '../Form'
import {OnChangeHandler, StringPath, TypedStringPath, Version} from '../types'
import {PatchStrategy} from './patchStrategies'
import {useAutosavingStateReducer} from './reducer'

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
}

type AutosavingFormProps<T> = Pick<Required<FormProps<T>>, 'value' | 'onChange' | 'onValidityChange' | 'conflicts' | 'onResolveConflict'>

const DISABLE_CONFLICT_OVERRIDE_DELAY = 1000 * 60 * 5 //Disable saving and overwriting conflicts after five minutes

export const USE_BACKEND_VALUE = Symbol('useBackendValue')
export const USE_LOCAL_VALUE = Symbol('useLocalValue')

export function useAutosavingState<T extends MergeableObject, Patch>(
  serverState : T,
  onPatch : (patch : Patch) => void,
  patchStrategy: PatchStrategy<T, Patch>,
  refreshData?: () => unknown,
) : UseAutosavingStateReturn<T>
{
  const [hasErrors, setHasErrors] = useState(false)
  const [reducerState, dispatch] = useAutosavingStateReducer<T>(serverState)
  const { serverState: originalData, serverStateTime, mergeResult } = reducerState
  const { state: mergeState, modifications, nonConflictingModifications, conflicts } = mergeResult
  const state = hasErrors ? 'INVALID' : mergeState

  useEffect(() => {
    dispatch({ type: 'EXTERNAL_MODIFICATION', serverState })
  }, [serverState, dispatch])

  useEffect(() => {
    if (state === 'IN_SYNC' || state === 'INVALID') return

    const id = setTimeout(() => {
      if (state === 'CONFLICT' && now() - serverStateTime > DISABLE_CONFLICT_OVERRIDE_DELAY) {
        debug('Not saving conflict data on top of stale data')
        refreshData && refreshData()
        return
      }

      const patch = patchStrategy(originalData, nonConflictingModifications)
      if (patch !== undefined) {
        debug('Saving', patch)
        dispatch({ type: 'PATCH_SENT' })
        onPatch(patch)
      }
    }, AUTOSAVE_DELAY)

    return () => clearTimeout(id)
  }, [state, nonConflictingModifications, onPatch, originalData, serverStateTime, patchStrategy, refreshData, dispatch])

  const onModified = useCallback((modifications) => {
    dispatch({ type: 'LOCAL_MODIFICATION', modifications})
  }, [dispatch])
  const onResolveConflict = useCallback(function <V>(path: TypedStringPath<V, T>, version: Version) {
    dispatch({ type: 'CONFLICT_RESOLVED', path: path as StringPath<T>, version })
  }, [dispatch])

  const onValidityChange = useCallback(
    ({hasErrors}) => setHasErrors(hasErrors),
    []
  )

  return {
    formProps: {
      value: modifications,
      onChange: onModified,
      onValidityChange,
      onResolveConflict,
      conflicts,
    },
    value: modifications,
    onChange: onModified,
    state,
  }
}

function now(): number {
  return +new Date()
}
