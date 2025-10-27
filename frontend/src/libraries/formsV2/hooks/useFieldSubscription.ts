import { useCallback, useEffect, useState } from 'react'

import { type FormStateContext, useFormContext } from '../context'

export function useFieldSubscription<Output extends Input, Input, Data = unknown>(
  getter: (getValueAt: FormStateContext<Data>['getValueAt']) => Input,
  setter: (val: Output, dispatch: FormStateContext<Data>['dispatch']) => void,
) {
  const { readOnly, getValueAt, dispatch, subscribe } = useFormContext<Data>()
  const [value, setValue] = useState(() => getter(getValueAt))

  useEffect(
    () => {
      setValue(getter(getValueAt))
      subscribe(() => setValue(getter(getValueAt)))
    },
    [subscribe, getValueAt, getter],
  )

  const onChange = useCallback((value: Output) => {
    setValue(value)
    setter(value, dispatch)
  }, [setter, dispatch])

  return {
    value, onChange, readOnly,
  }
}
