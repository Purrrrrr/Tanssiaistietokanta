import { type Reducer, useCallback, useMemo, useReducer, useRef } from 'react'

import type { FormAction, FormReducerResult, FormState } from './types'

import { type CommonFormState, commonReducer, CommonReducerAction, initialState } from './reducers/commonReducer'
import { isValueAction, valueReducer } from './reducers/valueReducer'
import { debugReducer } from './utils/debug'
import { useSubscriptions } from './utils/useSubscriptions'

const debuggingCommonReducer = debugReducer(commonReducer)
const debuggingValueReducer = debugReducer(valueReducer)

export function useFormReducer<Data>(externalValue: Data, onChange: (changed: Data) => unknown): FormReducerResult<Data> {
  const latestValue = useRef(externalValue)
  latestValue.current = externalValue
  const [state, dispatch_rest] = useReducer<Reducer<CommonFormState, CommonReducerAction>>(debuggingCommonReducer, initialState)
  const compositeState = useMemo(() => ({
    ...state, data: externalValue,
  }), [state, externalValue])
  const { subscribe } = useSubscriptions<FormState<Data>>(compositeState)

  const dispatch = useCallback(
    (action: FormAction<Data>) => {
      if (isValueAction(action)) {
        const newValue = debuggingValueReducer(latestValue.current, action)
        onChange(newValue)
        latestValue.current = newValue
      } else {
        dispatch_rest(action)
      }
    },
    [onChange, dispatch_rest],
  )

  return {
    state: { data: latestValue.current, ...state },
    dispatch, subscribe,
  }
}
