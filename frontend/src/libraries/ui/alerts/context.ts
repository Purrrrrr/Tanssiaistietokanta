import { createContext, useContext } from 'react'

import { ShowAlert } from './types'

export const AlertContextInner = createContext<ShowAlert>(async () => {
  throw new Error('No alert system')
})

export function useShowAlert() {
  return useContext(AlertContextInner)
}
