import { createContext, useContext } from 'react'

import { FieldStyleContextProps } from './types'

export const fieldStyleDefaults: FieldStyleContextProps = {
  inline: false,
  labelStyle: 'above',
}

export const FieldStyleContext = createContext<FieldStyleContextProps>(fieldStyleDefaults)

export function useFieldStyleContext(props: Partial<FieldStyleContextProps>) {
  const ctx = useContext(FieldStyleContext)
  return { ...ctx, ...props }
}
