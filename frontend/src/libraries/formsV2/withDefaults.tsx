import { type ComponentType } from 'react'

type PropsWithDefaults<P, K extends keyof P>
  = Partial<Pick<P, K>>
    & Omit<P, K>

export function withDefaults<P, K extends keyof P>(
  Component: ComponentType<P>,
  defaultProps: Pick<P, K>,
): ComponentType<PropsWithDefaults<P, K>> {
  return props => <Component {...defaultProps} {...props as P} />
}
