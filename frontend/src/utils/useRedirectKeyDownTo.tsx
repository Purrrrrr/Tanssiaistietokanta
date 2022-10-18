import {useOnKeydown} from './useOnKeydown'

export function useRedirectKeyDownTo(ref) {
  useOnKeydown(event => {
    if (event.target === document.body) {
      const copy = copyEvent(event)
      ref.current.dispatchEvent(copy)
    }
  })
}

function copyEvent(event) {
  if (typeof(Event) === 'function') {
    return new KeyboardEvent(event.type, event)
  }
}
