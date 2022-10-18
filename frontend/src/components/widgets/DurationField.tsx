import React, {useState, useEffect, useCallback} from 'react'
import {toMinSec, toSeconds, parseDuration, durationToString} from 'utils/duration'
import {Input, InputProps, FieldComponentProps} from 'libraries/forms2'
import {useDelayedEffect} from 'utils/useDelayedEffect'

interface DurationState {
  value?: number
  text: string
  event?: React.ChangeEvent
}

export function DurationField({value, onChange, readOnly, ...props} : FieldComponentProps<number, HTMLInputElement> & Omit<InputProps, 'ref'>) {
  const [params, setParams] = useState<DurationState>({value, text: durationToString(value ?? 0)})

  useDelayedEffect(10, useCallback(() => {
    const {value, text, event} = params
    const newVal = parseDuration(text)
    if (!event) return
    if (newVal === value) { //Text has changed but value hasn't. Reset text!
      setParams({value, text: durationToString(value)})
    } else { //Propagate changed value
      onChange && onChange(newVal, event as React.ChangeEvent<HTMLInputElement>)
    }
  }, [params, onChange]))
  useEffect(() => setParams({text: durationToString(value ?? 0), value}), [value])

  return <Input
    {...props}
    value={params.text}
    readOnly={readOnly}
    onChange={(text, event) => setParams({value, text, event})}
    onClick={readOnly ? undefined : onDurationFieldFocus}
    onKeyDown={readOnly ? undefined : onDurationFieldKeyDown}
    onFocus={readOnly ? undefined : onDurationFieldFocus}
  />
}

type SubField = 'minutes' | 'seconds';

function onDurationFieldFocus({target}) {
  selectArea(target, getCurrentArea(target))
}

function onDurationFieldKeyDown(event : React.KeyboardEvent<HTMLInputElement>) {
  const target = event.target as HTMLInputElement
  const {key} = event
  switch(key) {
    case 'Escape':
      target.blur(); break
    case 'ArrowLeft':
      selectArea(target, 'minutes'); break
    case 'ArrowRight':
      selectArea(target, 'seconds'); break
    case 'ArrowUp':
      addToInput(target, event.shiftKey ? 10 : 1); break
    case 'ArrowDown':
      addToInput(target, event.shiftKey ? -10 : -1); break
    case 'Tab':
    case 'Process':
    case 'Unidentified':
      return //Do not override
    default:
      if (typeof(key) == 'string' && key.match(/[0-9]|Backspace|Delete/)) {
        return
      }
  }
  event.preventDefault()
}

function addToInput(input : HTMLInputElement, amount : number) {
  const area = getCurrentArea(input)
  let [minutes, seconds] = toMinSec(parseDuration(input.value))

  if (area === 'seconds') {
    seconds += amount
  } else {
    minutes = Math.max(0, minutes+amount)
  }
  triggerValueChange(input, durationToString(toSeconds(minutes, seconds)))
  selectArea(input, area)
}

/** Changes input value and triggers a value change event that isn't ignored by React */
function triggerValueChange(input : HTMLInputElement, value : string) {
  const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value') as PropertyDescriptor;
  (descriptor.set!).call(input, value)
  input.dispatchEvent(new Event('input', {bubbles: true}))
}

function selectArea(input : HTMLInputElement, area : SubField) {
  const colonIndex = input.value.indexOf(':')
  switch(area) {
    case 'minutes':
      input.selectionStart = 0
      input.selectionEnd = colonIndex
      break
    case 'seconds':
      input.selectionStart = colonIndex+1
      input.selectionEnd = input.value.length
      break
  }
}

function getCurrentArea(input : HTMLInputElement) : SubField {
  return (input.selectionStart ?? 0) > input.value.indexOf(':') ? 'seconds' : 'minutes'
}
