import {useCallback, useMemo, useRef} from 'react'
import * as L from 'partial.lenses'

export function useOnChangeForPropInValue(onChange, value) {
  const valueRef = useRef()
  valueRef.current = value
  const updater = useCallback(mapper => onChange(mapper(valueRef.current)), [onChange])
  return useOnChangeForProp(updater)
}
export function useOnChangeForProp(onChange) {
  return useMemo(
    () => {
      const callbacks = new Map()
      return (prop) => getOrComputeKey(
        callbacks, prop,
        prop => getPropChanger(prop, onChange)
      )
    },
    [onChange]
  )

}

function getOrComputeKey(map, key, compute) {
  if (map.has(key)) return map.get(key)
  const value = compute(key)
  map.set(key, value)
  return value
}

function getPropChanger(prop, onChange) {
  return arg => typeof(arg) === 'function'
    ? onChange(L.modify(prop, arg))
    : onChange(val => L.set(prop, arg, val))
}
