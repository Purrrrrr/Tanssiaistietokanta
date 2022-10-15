import {useRef} from 'react';
import deepEquals from 'fast-deep-equal'

export function useDeepCompareMemoize<V>(value : V) : V {
  const ref = useRef<V>()
  if (!ref.current || !deepEquals(value, ref.current)) {
    ref.current = value
  }
  return ref.current
}
