import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
import classNames from 'classnames'

interface DropdownContainerProps {
  className?: string
  children: ReactNode
}

export function DropdownContainer({ children, className = 'inline-block w-fit' }: DropdownContainerProps) {
  return <div className={className} data-dropdown-container="true">
    {children}
  </div>
}

interface DropdrownProps {
  open: boolean
  children: ReactNode
  arrow?: boolean
}

export const Dropdown = ({ arrow, children, open }: DropdrownProps) => {
  const element = useRef<HTMLDivElement>(null)
  const openRef = useRef<boolean>(open)
  openRef.current = open

  const updateDirection = useCallback(() => {
    if (!element.current) return
    const parent = element.current.closest('[data-dropdown-container]')
    if (!parent || !openRef.current) return
    updateDropdownPosition(element.current, parent, arrow)
  }, [arrow])
  useLayoutEffect(() => {
    element.current?.showPopover?.()
  }, [])

  useLayoutEffect(updateDirection, [updateDirection])
  useResizeObserver(element, updateDirection)
  useScrollPosition(updateDirection, [updateDirection], undefined, true, 100)

  return <div popover="manual" ref={element} className={classNames(
    'z-50 absolute w-fit max-w-dvw max-h-dvh transition-[scale,opacity] bg-transparent p-2.5',
    open || 'scale-y-0 opacity-0',
  )}>
    <div className="border-1 border-gray-400/50 bg-white shadow-black/40 shadow-md p-0.5">
      {children}
    </div>
    {arrow &&
      <svg className="text-gray-400/50 w-5 h-2.5 absolute" width={20} height={10}>
        <polygon points="10,0 0,10.5 20,10.5" stroke="currentColor" fill="#fff" />
      </svg>
    }
  </div>
}

function updateDropdownPosition(element: HTMLDivElement, anchorElement: Element, hasArrow?: boolean) {
  const anchor = anchorElement.getBoundingClientRect()
  const { clientHeight: elementHWithPadding, clientWidth: elementWWithPadding } = element
  const { clientHeight: winH, clientWidth: winW } = document.documentElement
  const margin = 10
  // For shadows and the arrow to render properly we have a transparent padding area
  const transparentPadding = 10
  const triangleH = hasArrow ? 10 : 0
  const triangleW = 20
  const elementH = elementHWithPadding - transparentPadding * 2 + triangleH
  const elementW = elementWWithPadding - transparentPadding * 2

  const spaceDown = winH - anchor.bottom - elementH
  const spaceUp = anchor.top - elementH

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
    ? anchor.top + anchor.height + triangleH - transparentPadding
    : anchor.top - elementH - transparentPadding

  const centeredLeft = anchor.left + (anchor.width - elementW) / 2 - transparentPadding
  const left = clamp({
    min: margin,
    max: winW - elementW - margin,
    value: centeredLeft
  })

  element.style.minWidth = toPx(anchor.width + transparentPadding * 2)
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
  if (hasArrow) {
    const triangle = element.childNodes[1] as HTMLDivElement
    triangle.style.top = toPx(
      pointDown ? 1 : elementH - 1
    )
    triangle.style.left = toPx((elementW - triangleW) / 2)
    triangle.style.rotate = pointDown ? '' : '180deg'
  }
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
