import createDebug from 'utils/debug'

const debug = createDebug('formReducer')

export function debugReducer<S, A>(reducer: (state: S, action: A) => S): (state: S, action: A) => S {
  return (state, action) => {
    debug(action)
    const val = reducer(state, action)
    debug(val)
    return val
  }
}
