import { type ReactNode, ComponentProps, forwardRef, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
import classNames from 'classnames'

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

type DropdownButtonProps = ComponentProps<typeof Button> & {
  onClick?: React.MouseEventHandler
  label?: string
  chosenValue?: string | null
}

export const DropdownButton = forwardRef<HTMLButtonElement, DropdownButtonProps>(({ label, chosenValue, ...props }: DropdownButtonProps, ref) => {
  const value = useFormTranslation('selector.value')
  const choose = useFormTranslation('selector.choose', { fieldName: label ?? value })
  const chosen = useFormTranslation('selector.chosen', { value: chosenValue ?? '' })

  const ariaLabel = `${choose}. ${chosenValue && chosen}`

  return <Button
    ref={ref}
    aria-label={ariaLabel}
    {...props}
    rightIcon="double-caret-vertical"
  />
})

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
  const { clientHeight: h, clientWidth: _w } = element
  const { clientHeight: winH, clientWidth: _winW } = document.documentElement
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
    ? anchor.top + anchor.height
    : anchor.top - h
  element.style.top = toPx(top + window.scrollY)
  element.style.left = toPx(anchor.left + window.scrollX)
  element.style.transformOrigin = pointDown
    ? 'top' : 'bottom'
}

const toPx = (value: number) => `${value}px`

function useResizeObserver(element: { current: HTMLDivElement | null }, callback: () => void) {
  useEffect(() => {
    if (!element.current) return

    const observer = new ResizeObserver(callback)
    observer.observe(element.current)

    return () => observer.disconnect()
  }, [element, callback])
}
