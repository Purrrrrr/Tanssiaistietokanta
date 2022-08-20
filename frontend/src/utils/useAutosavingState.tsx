import {Reducer, useEffect, useCallback, useReducer} from 'react';
import deepEquals from 'fast-deep-equal'

export type SyncState = 'IN_SYNC' | 'MODIFIED_LOCALLY' | 'CONFLICT'
type SyncEvent = 'LOCAL_MODIFICATION' | 'EXTERNAL_MODIFICATION' | 'CONFLICT_RESOLVED'

export interface SyncStore<T extends Object> {
  state: SyncState
  serverState: T
  modifications: Partial<T>
  conflicts: null | (keyof T)[]
  conflictOrigin: null | T
}

interface SyncAction {
  type: SyncEvent
  payload: any
}

export default function useAutosavingState<T>(
  serverState : T,
  onPatch : (saved : Partial<T>) => T,
) : [T, (saved : T) => any, SyncStore<T>]{
  const [reducerState, dispatch] = useReducer<Reducer<SyncStore<T>, SyncAction>, T>(reducer, serverState, getInitialState)
  const { state, modifications } = reducerState

  useEffect(() => {
    dispatch({ type: 'EXTERNAL_MODIFICATION', payload: serverState })
  }, [serverState])

  useEffect(() => {
    if (state === 'CONFLICT') return

    const id = setTimeout(() => {
      onPatch(modifications)
    }, 500)

    return () => clearTimeout(id)
  }, [state, modifications, onPatch])

  const onModified = useCallback((modifications) => {
    dispatch({ type: 'LOCAL_MODIFICATION', payload: modifications})
  }, [])

  const formState = {
    ...serverState,
    ...modifications,
  }

  return [formState, onModified, reducerState] 
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
  if (reducerState.state !== 'IN_SYNC') console.log(reducerState)
  console.log(action.type)
  switch (action.type) {
    case 'LOCAL_MODIFICATION':
      return merge(
        reducerState.conflictOrigin ?? serverState,
        serverState,
        { ...modifications, ...action.payload }
      )
    case 'CONFLICT_RESOLVED':
      return {
        ...reducerState,
        state: 'MODIFIED_LOCALLY',
        conflicts: null,
        conflictOrigin: null,
        modifications: { ...modifications, ...action.payload },
      }
    case 'EXTERNAL_MODIFICATION':
      return merge(
        reducerState.conflictOrigin ?? serverState,
        action.payload,
        modifications
      )
  }
}

function merge<T>(serverState : T, newServerState : T, modifications : Partial<T>) : SyncStore<T> {
  const conflicts : any[] = []
  const newModifications = {}

  let hasConflicts = false
  let hasModifications = false

  for (const key of Object.keys(newServerState)) {
    const modified = key in modifications

    if (!modified) continue
    
    const originalValue = serverState[key]
    const localValue = modifications[key]
    const serverValue = newServerState[key]

    const modifiedOnServer = !deepEquals(originalValue, serverValue)
    const modifiedLocally = !deepEquals(originalValue, localValue)
    const conflict = !deepEquals(serverValue, localValue)

    // console.log({ key, modifiedLocally, modifiedOnServer })

    if (modifiedLocally) {
      newModifications[key] = localValue
      hasModifications = true
      if (modifiedOnServer && conflict) {
        conflicts.push(key)
        hasConflicts = true
      }
    }
  }

  let state : SyncState = 'IN_SYNC'
  if (hasConflicts) state = 'CONFLICT'
  else if (hasModifications) state = 'MODIFIED_LOCALLY'

  return { 
    state,
    serverState: newServerState,
    conflictOrigin: hasConflicts ? serverState : null,
    modifications: newModifications,
    conflicts,
  }
}