declare module 'react' {
  import * as ReactTypings from '@types/react'
  import { HTMLAttributes as ReactHTMLAttributes } from '@types/react'

  export = ReactTypings

  /* Enable generic functions to work with lazy */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  export function lazy<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
  ): T

  export interface HTMLAttributes<T> extends ReactHTMLAttributes<T> {
    popover?: 'auto' | 'manual' | 'hint'
  }
}
