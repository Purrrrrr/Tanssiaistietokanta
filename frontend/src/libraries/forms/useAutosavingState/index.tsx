import { useCallback, useEffect, useRef, useState } from 'react'
import equal from 'fast-deep-equal'

import { MergeableObject, SyncState } from './types'
import { NewValue, OnFormChangeHandler, StringPath, TypedStringPath, Version } from '../types'

import createDebug from 'utils/debug'

import { FormProps } from '../Form'
import { jsonPatch, PatchStrategy } from './patchStrategies'
import { useAutosavingStateReducer } from './reducer'

const debug = createDebug('useAutoSavingState')

const AUTOSAVE_DELAY = 50

export type { PatchStrategy } from './patchStrategies'
export * as patchStrategy from './patchStrategies'
export type { SyncState } from './types'

export interface UseAutosavingStateReturn<T extends MergeableObject> {
  value: T
  onChange: OnFormChangeHandler<T>
  formProps: AutosavingFormProps<T>
  state: SyncState
}

type AutosavingFormProps<T> = Pick<Required<FormProps<T>>, 'value' | 'onChange' | 'onValidityChange' | 'conflicts' | 'onResolveConflict'>

const DISABLE_CONFLICT_OVERRIDE_DELAY = 1000 * 60 * 5 // Disable saving and overwriting conflicts after five minutes

export const USE_BACKEND_VALUE = Symbol('useBackendValue')
export const USE_LOCAL_VALUE = Symbol('useLocalValue')

export function useAutosavingState<T extends MergeableObject, Patch>(
  serverState: T,
  onPatch: (patch: Patch) => Promise<unknown>,
  patchStrategy: PatchStrategy<T, Patch>,
  refreshData?: () => unknown,
): UseAutosavingStateReturn<T> {
  const [hasErrors, setHasErrors] = useState(false)
  const [reducerState, dispatch] = useAutosavingStateReducer<T>(serverState)
  const { serverState: originalData, serverStateTime, mergeResult, patchPending } = reducerState
  const { state: mergeState, modifications, nonConflictingModifications, conflicts } = mergeResult
  const state = hasErrors ? 'INVALID' : mergeState
  const lastServerState = useRef<T>()

  useEffect(() => {
    if (equal(serverState, lastServerState.current)) return
    if (debug.enabled) {
      debug('external modification diff', jsonPatch(lastServerState.current, serverState))
    }
    dispatch({ type: 'EXTERNAL_MODIFICATION', serverState })
    lastServerState.current = serverState
  }, [serverState, dispatch])

  useEffect(() => {
    if (state === 'IN_SYNC' || state === 'INVALID') return
    if (patchPending) return

    const id = setTimeout(() => {
      if (state === 'CONFLICT' && now() - serverStateTime > DISABLE_CONFLICT_OVERRIDE_DELAY) {
        debug('Not saving conflict data on top of stale data')
        refreshData?.()
        return
      }

      const patch = patchStrategy(originalData, nonConflictingModifications)
      if (patch !== undefined) {
        debug('Saving', patch)
        dispatch({ type: 'PATCH_SENT' })
        onPatch(patch)
          .then(() => dispatch({ type: 'PATCH_RESOLVED' }))
          .catch(() => dispatch({ type: 'PATCH_RESOLVED' }))
      }
    }, AUTOSAVE_DELAY)

    return () => clearTimeout(id)
  }, [state, nonConflictingModifications, onPatch, originalData, serverStateTime, patchStrategy, refreshData, dispatch, patchPending])

  const onModified = useCallback((modifications: NewValue<T>) => {
    dispatch({ type: 'LOCAL_MODIFICATION', modifications })
  }, [dispatch])
  const onResolveConflict = useCallback(function <V>(path: TypedStringPath<V, T>, version: Version) {
    dispatch({ type: 'CONFLICT_RESOLVED', path: path as StringPath<T>, version })
  }, [dispatch])

  const onValidityChange = useCallback(
    ({ hasErrors }) => setHasErrors(hasErrors),
    [],
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
