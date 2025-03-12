import { type Reducer, useCallback, useEffect, useReducer, useRef } from 'react'

import type { FormAction, FormReducerResult, FormState } from './types'

import { type CommonFormState, commonReducer, CommonReducerAction, initialState } from './reducers/commonReducer'
import { valueReducer } from './reducers/valueReducer'
import { debugReducer } from './utils/debug'
import { useSubscriptions } from './utils/useSubscriptions'

const debuggingCommonReducer = debugReducer(commonReducer)
const debuggingValueReducer = debugReducer(valueReducer)

export function useFormReducer<Data>(externalValue: Data, onChange: (changed: Data) => unknown): FormReducerResult<Data> {
  const latestValue = useRef(externalValue)
  const { subscribe, trigger } = useSubscriptions<FormState<Data>>()

  const result = useReducer<Reducer<CommonFormState, CommonReducerAction>>(debuggingCommonReducer, initialState)
  const [state, dispatch_r] = result

  useEffect(
    () => { trigger({ ...state, data: externalValue }) },
    [state, externalValue, trigger]
  )

  const dispatch = useCallback(
    (action: FormAction<Data>) => {
      switch (action.type) {
        case 'EXTERNAL_CHANGE':
        case 'CHANGE':
        case 'APPLY': {
          const newValue = debuggingValueReducer(latestValue.current, action)
          onChange(newValue)
          latestValue.current = newValue
          break
        }
        default:
          dispatch_r(action)
      }
    },
    [onChange, dispatch_r]
  )

  return {
    state: { data: externalValue, ...state },
    dispatch, subscribe,
  }
}
