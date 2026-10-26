import { useMemo } from 'react'

import { FieldStyleContextProps } from './types'

import { FieldStyleContext as Context, fieldStyleDefaults } from './context'

export type { FieldStyleContextProps } from './types'

export function FieldStyleContext(props: Partial<FieldStyleContextProps> & { children: React.ReactNode }) {
  const { labelStyle, inline, children } = props
  const value = useMemo(
    () => ({
      labelStyle: labelStyle ?? fieldStyleDefaults.labelStyle,
      inline: inline ?? fieldStyleDefaults.inline,
    }),
    [inline, labelStyle],
  )

  return <Context.Provider value={value} children={children} />
}
