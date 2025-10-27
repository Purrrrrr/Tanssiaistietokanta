import { useDelayedValue } from './useDelayedValue'

export function useShouldRender(isOpen: boolean, delay?: number) {
  const previousOpen = useDelayedValue(isOpen, delay ?? 1)

  return isOpen || previousOpen
}
