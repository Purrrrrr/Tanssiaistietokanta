import { createContext, useContext, useMemo } from 'react'

import { FieldStyleContextProps } from './types'

const defaults : FieldStyleContextProps = {
  inline: false,
  labelStyle: 'above'
}
const FieldStyleReactContext = createContext<FieldStyleContextProps>(defaults)

export function FieldStyleContext(props: Partial<FieldStyleContextProps> & { children: React.ReactNode }) {
  const { labelStyle, inline, children } = { ...defaults, ...props }
  const ctx = useMemo(
    () => ({ labelStyle, inline }),
    [inline, labelStyle],
  )

  return <FieldStyleReactContext.Provider value={ctx} children={children} />
}

export function useFieldStyle({ inline, labelStyle }: Partial<FieldStyleContextProps>) {
  const ctx = useContext(FieldStyleReactContext)

  return { ...ctx, inline, labelStyle }
}
