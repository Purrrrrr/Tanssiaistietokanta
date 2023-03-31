import {useCallback, useEffect, useState} from 'react'

import createDebug from 'utils/debug'

import {MergeableObject, SyncState, toConflictMap} from './types'

import {FormProps} from '../Form'
import {OnChangeHandler} from '../types'
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

type AutosavingFormProps<T> = Pick<Required<FormProps<T>>, 'value' | 'onChange' | 'onValidityChange' | 'conflicts'>

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
  const { state, modifications, nonConflictingModifications, conflicts } = mergeResult

  useEffect(() => {
    dispatch({ type: 'EXTERNAL_MODIFICATION', serverState })
  }, [serverState, dispatch])

  useEffect(() => {
    if (state === 'IN_SYNC') return

    const id = setTimeout(() => {
      if (hasErrors) return
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
  }, [state, nonConflictingModifications, onPatch, originalData, serverStateTime, patchStrategy, refreshData, hasErrors, dispatch])

  const onModified = useCallback((modifications) => {
    dispatch({ type: 'LOCAL_MODIFICATION', modifications})
  }, [dispatch])
  /*const resolveConflict = useCallback((resolutions) => {
    dispatch({ type: 'CONFLICT_RESOLVED', payload: resolutions})
  }, [dispatch])*/

  const onValidityChange = useCallback(
    ({hasErrors}) => setHasErrors(hasErrors),
    []
  )

  return {
    formProps: {
      value: modifications,
      onChange: onModified,
      onValidityChange,
      conflicts: toConflictMap(conflicts),
    },
    value: modifications,
    onChange: onModified,
    state: hasErrors
      ? 'INVALID'
      : state === 'CONFLICT' ? 'MODIFIED_LOCALLY' : state,
  }
}

function now(): number {
  return +new Date()
}
