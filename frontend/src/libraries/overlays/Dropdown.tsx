import { type ReactNode, FocusEventHandler, MouseEventHandler, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { forwardRef } from 'react'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'

import { Popover } from './unstyled/Popover'

interface DropdownContainerProps {
  className?: string
  children: ReactNode
}
export const DropdownContainer = forwardRef<HTMLDivElement, DropdownContainerProps>(({ children, className = 'inline-block w-fit' }, ref) => {
  return <div className={className} data-dropdown-container="true" ref={ref}>
    {children}
  </div>
})

interface DropdrownProps {
  id?: string
  open: boolean
  onToggle?: (open: boolean) => unknown
  auto?: boolean
  children: ReactNode
  arrow?: boolean
  onClick?: MouseEventHandler
  tabIndex?: number
  alwaysRenderChildren?: boolean
}

export const Dropdown = ({ id, auto, arrow, children, open, onToggle, onClick, tabIndex, alwaysRenderChildren }: DropdrownProps) => {
  const element = useRef<HTMLDivElement>(null)

  const updateDirection = useCallback(() => {
    if (!element.current) return
    const parent = element.current.closest('[data-dropdown-container]')
    if (!parent) return
    updateDropdownPosition(element.current, parent, arrow)
  }, [arrow])

  useLayoutEffect(updateDirection, [updateDirection])
  useResizeObserver(element, updateDirection)
  useScrollPosition(updateDirection, [updateDirection], undefined, true, 100)

  return <Popover
    id={id}
    open={open}
    onToggle={onToggle}
    type={auto ? 'auto' : 'manual'}
    onClick={onClick}
    ref={element}
    className="absolute flex flex-col w-fit max-w-dvw max-h-dvh transition-[scale,opacity] bg-transparent p-2.5 duration-300 overflow-hidden"
    hideDelay={301}
    closedClassname="scale-y-0 scale-x-0 opacity-0"
    alwaysRenderChildren={alwaysRenderChildren}
  >
    <div className="border-1 border-gray-400/50 bg-white shadow-black/40 shadow-md p-0.5 flex flex-col grow overflow-auto" tabIndex={tabIndex}>
      {children}
    </div>
    {arrow &&
      <svg className="text-gray-400/50 w-5 h-2.5 absolute" width={20} height={10}>
        <polygon points="10,0 0,10.5 20,10.5" stroke="currentColor" fill="#fff" />
      </svg>
    }
  </Popover>
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
  const maxH = clamp({
    min: 200,
    value: (pointDown ? winH - anchor.bottom : anchor.top) - margin,
  })

  element.style.minWidth = toPx(anchor.width + transparentPadding * 2)
  element.style.maxHeight = toPx(maxH)
  element.style.top = toPx(top + window.scrollY)
  element.style.left = toPx(left + window.scrollX)
  element.style.transformOrigin = pointDown
    ? 'top' : 'bottom'
  if (hasArrow) {
    const triangle = element.childNodes[1] as HTMLDivElement
    if (!triangle) return
    triangle.style.top = toPx(
      pointDown ? 1 : elementH - 1
    )
    triangle.style.left = toPx((elementWWithPadding - triangleW) / 2)
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
