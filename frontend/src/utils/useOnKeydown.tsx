import {useEffect} from 'react'

type KeyDownHandler = (e: KeyboardEvent) => any
type KeyDownHandlerParam = KeyDownHandler | {[key: string]: KeyDownHandler}

export function useOnKeydown(onKeydown : KeyDownHandlerParam, key?: string) {
  useEffect(() => {
    function onPress(event : KeyboardEvent) {
      if (isInputTag(event.target)) return
      if (key && event.key !== key) return

      if (typeof(onKeydown) === 'object') {
        if (typeof(onKeydown[event.key]) === 'function') {
          onKeydown[event.key](event)
        }
      } else {
        onKeydown(event)
      }
    }

    document.addEventListener('keydown', onPress, false)
    return () => document.removeEventListener('keydown', onPress, false)
  }, [onKeydown, key])
}

const inputTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']
export function isInputTag(target) {
  return target && inputTags.includes(target.tagName)
}
