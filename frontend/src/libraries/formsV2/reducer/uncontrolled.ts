import { type Reducer, useEffect, useReducer, useRef } from 'react'
import equal from 'fast-deep-equal'

import type { FormAction, FormReducerResult, FormState } from './types'

import { externalChange } from './actionCreators'
import { commonReducer, initialState } from './reducers/commonReducer'
import { valueReducer } from './reducers/valueReducer'
import { assoc } from './utils/data'
import { debugReducer } from './utils/debug'
import { useSubscriptions } from './utils/useSubscriptions'

export function useFormReducer<Data>(externalData: Data, onChange: (changed: Data) => unknown): FormReducerResult<Data> {
  const result = useReducer<Reducer<FormState<Data>, FormAction<Data>>, Data>(debuggingReducer, externalData, getInitialState)
  const [state, dispatch] = result
  const { subscribe, trigger } = useSubscriptions<FormState<Data>>()

  useEffect(
    () => { trigger(state) },
    [state, trigger]
  )

  const previousDataRef = useRef({
    external: externalData,
    internal: state.data,
  })
  useEffect(
    () => {
      const { current: previous } = previousDataRef
      const externalValueChanged = !equal(previous.external, externalData)
      const internalValueChanged = !equal(previous.internal, state.data)

      if (externalValueChanged && !equal(previous.internal, externalData)) {
        dispatch(externalChange(externalData))
      } else if (internalValueChanged && !equal(externalData, state.data)) {
        onChange(state.data)
      }

      previous.external = externalData
      previous.internal = state.data
    }, [externalData, state.data, dispatch, onChange]
  )

  return {
    state, dispatch, subscribe
  }
}

function getInitialState<Data>(data: Data): FormState<Data> {
  return { ...initialState, data }
}

const debuggingReducer = debugReducer(reducer)

function reducer<Data>(state: FormState<Data>, action: FormAction<Data>): FormState<Data> {
  switch (action.type) {
    case 'EXTERNAL_CHANGE':
    case 'CHANGE':
    case 'APPLY':
      return assoc(state, 'data', valueReducer(state.data, action))
    default:
      return commonReducer(state, action) as FormState<Data>
  }
}
