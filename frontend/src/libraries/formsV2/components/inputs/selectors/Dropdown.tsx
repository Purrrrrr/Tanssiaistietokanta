import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
import classNames from 'classnames'

import { DropdownButtonDownshiftProps, SelectorProps } from './types'

import { Button } from 'libraries/ui'

import { useFormTranslation } from '../../../localization'

interface DropdownContainerProps {
  className?: string
  children: ReactNode
}

export function DropdownContainer({ children, className = 'inline-block w-fit' }: DropdownContainerProps) {
  return <div className={className} data-dropdown-container="true">
    {children}
  </div>
}

export function DropdownButton<T>(
  props: { selectorProps: SelectorProps<T>, buttonProps: DropdownButtonDownshiftProps}
): ReactNode {
  const { buttonProps, selectorProps } = props
  const {
    'aria-label': label, readOnly,
    itemIcon, itemToString = String,
    value, buttonRenderer
  } = selectorProps
  const ariaLabel = useDropdownButtonLabel(itemToString(value), label)

  if (buttonRenderer) {
    return buttonRenderer(value, {
      disabled: readOnly,
      'aria-label': ariaLabel,
      ...buttonProps,
    })
  }

  return <Button
    {...buttonProps}
    active={buttonProps['aria-expanded']}
    aria-label={ariaLabel}
    disabled={readOnly}
    rightIcon="double-caret-vertical"
  >
    {itemIcon?.(value)}
    {itemToString(value)}
  </Button>
}

function useDropdownButtonLabel(chosenValue: string, ariaLabel?: string) {
  const value = useFormTranslation('selector.value')
  const choose = useFormTranslation('selector.choose', { fieldName: ariaLabel ?? value })
  const chosen = useFormTranslation('selector.chosen', { value: chosenValue ?? '' })

  return `${choose}. ${chosenValue && chosen}`
}

interface DropdrownProps {
  open: boolean
  children: ReactNode
}

export const Dropdown = ({ children, open }: DropdrownProps) => {
  const element = useRef<HTMLDivElement>(null)
  const openRef = useRef<boolean>(open)
  openRef.current = open

  const updateDirection = useCallback(() => {
    if (!element.current) return
    const parent = element.current.closest('[data-dropdown-container]')
    if (!parent || !openRef.current) return
    updateDropdownPosition(element.current, parent)
  }, [])
  useLayoutEffect(() => {
    element.current?.showPopover?.()
  }, [])

  useLayoutEffect(updateDirection, [updateDirection])
  useResizeObserver(element, updateDirection)
  useScrollPosition(updateDirection, [updateDirection], undefined, true, 100)

  return <div popover="manual" ref={element} className={classNames(
    'z-50 absolute w-fit max-w-dvw max-h-dvh transition-[scale,opacity] bg-white shadow-black/40 shadow-md',
    open || 'scale-y-0 opacity-0',
  )}>
    {children}
  </div>
}

function updateDropdownPosition(element: HTMLDivElement, anchorElement: Element) {
  const anchor = anchorElement.getBoundingClientRect()
  const { clientHeight: h, clientWidth: w } = element
  const { clientHeight: winH, clientWidth: winW } = document.documentElement
  const margin = 10

  const spaceDown = winH - anchor.bottom - h
  const spaceUp = anchor.top - h

  let pointDown = true
  const canPointDown = spaceDown > margin
  if (!canPointDown) {
    const canPointUp = spaceUp > margin
    if (canPointUp) {
      pointDown = false
    } else {
      pointDown = spaceDown > spaceUp
    }
  }
  const top = pointDown
    ? anchor.top + anchor.height + 3
    : anchor.top - h - 3
  const centeredLeft = anchor.left + (anchor.width - w) / 2
  const left = clamp({
    min: margin,
    max: winW - w - margin,
    value: centeredLeft
  })

  element.style.minWidth = toPx(anchor.width)
  element.style.maxHeight = toPx(
    clamp({
      min: 200,
      value: (pointDown ? winH - anchor.bottom : anchor.top) - margin,
    })
  )
  element.style.top = toPx(top + window.scrollY)
  element.style.left = toPx(left + window.scrollX)
  element.style.transformOrigin = pointDown
    ? 'top' : 'bottom'
}

const toPx = (value: number) => `${value}px`
const clamp = ({value, min = -Infinity, max = Infinity}: { value: number, min?: number, max?: number}) => Math.min(max, Math.max(min, value))

function useResizeObserver(element: { current: HTMLDivElement | null }, callback: () => void) {
  useEffect(() => {
    if (!element.current) return

    const observer = new ResizeObserver(callback)
    observer.observe(element.current)

    return () => observer.disconnect()
  }, [element, callback])
}
