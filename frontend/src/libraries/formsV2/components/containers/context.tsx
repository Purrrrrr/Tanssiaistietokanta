import { createContext, useContext, useMemo } from 'react'

import { FieldStyleContextProps } from './types'

const defaults : FieldStyleContextProps = {
  inline: false,
  labelStyle: 'above'
}
const FieldStyleReactContext = createContext<FieldStyleContextProps>(defaults)

export function FieldStyleContext(props: Partial<FieldStyleContextProps> & { children: React.ReactNode }) {
  const { labelStyle, inline, children } = props
  const ctx = useMemo(
    () => ({
      labelStyle: labelStyle ?? defaults.labelStyle,
      inline: inline ?? defaults.inline,
    }),
    [inline, labelStyle],
  )

  return <FieldStyleReactContext.Provider value={ctx} children={children} />
}

export function useFieldStyle({ inline, labelStyle }: Partial<FieldStyleContextProps>) {
  const ctx = useContext(FieldStyleReactContext)

  return {
    labelStyle: labelStyle ?? ctx.labelStyle,
    inline: inline ?? ctx.inline,
  }
}
