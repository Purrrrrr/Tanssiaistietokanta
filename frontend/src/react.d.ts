import 'react'

declare module 'react' {
  /* Enable generic functions to work with lazy */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  function lazy<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
  ): T

  interface HTMLAttributes<T> extends ReactHTMLAttributes<T> {
    focusgroup?: string
  }
}
