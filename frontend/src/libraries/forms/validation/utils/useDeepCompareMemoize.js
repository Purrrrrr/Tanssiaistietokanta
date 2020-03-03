import {useRef} from 'react';
import deepEquals from 'fast-deep-equal'

export function useDeepCompareMemoize(value) {
  const ref = useRef() 
  if (!deepEquals(value, ref.current)) {
    ref.current = value
  }
  return ref.current
}
