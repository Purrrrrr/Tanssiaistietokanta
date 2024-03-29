import {useEffect} from 'react'

export function useDelayedEffect(timeout: number, effect: () => unknown) {
  useEffect(
    () => {
      let id : number | null = window.setTimeout(
        () => { effect(); id = null },
        timeout
      )
      return () => {
        if (id) {
          window.clearTimeout(id)
        }
      }
    },
    [effect, timeout]
  )
}
