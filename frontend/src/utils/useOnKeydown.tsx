import { useEffect } from 'react'

type KeyDownHandler = (e: KeyboardEvent) => unknown
type KeyDownHandlerParam = KeyDownHandler | Record<string, KeyDownHandler>

export function useOnKeydown(onKeydown: KeyDownHandlerParam, key?: string) {
  useEffect(() => {
    function onPress(event: KeyboardEvent) {
      if (isInputTag(event.target as HTMLElement)) return
      if (key && event.key !== key) return

      if (typeof onKeydown === 'object') {
        if (typeof onKeydown[event.key] === 'function') {
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
export function isInputTag(target: HTMLElement) {
  console.log('isInputTag', target.tagName, target.isContentEditable)
  if (!target) return false
  if (inputTags.includes(target.tagName)) return true
  if (target.role === 'application') return true
  if (target.popover) return true
  if (target.isContentEditable) return true
  if (target.parentElement) return isInputTag(target.parentElement)
}
