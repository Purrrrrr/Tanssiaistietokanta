import type { ErrorStateContainerProps } from './types'

import { ErrorMessage } from '../ErrorMessage'

export function ErrorStateContainer({ errors, errorId, children, conflictElement }: ErrorStateContainerProps) {
  return <>
    {conflictElement}
    {children}
    {errors && <ErrorMessage errors={errors} id={errorId} />}
  </>
}
