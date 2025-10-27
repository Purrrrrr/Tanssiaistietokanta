import { MouseEventHandler, type ReactNode, useRef } from 'react'
import { forwardRef } from 'react'

import { Popover } from './unstyled/Popover'
import { AnchoringCallbackProps, toPx, useAnchorToElement } from './useAnchorToElement'

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
  anchorElement?: string | HTMLElement
  open: boolean
  onToggle?: (open: boolean) => unknown
  auto?: boolean
  children: ReactNode
  arrow?: boolean
  onClick?: MouseEventHandler
  tabIndex?: number
  alwaysRenderChildren?: boolean
}

export const Dropdown = ({ id, anchorElement, auto, arrow, children, open, onToggle, onClick, tabIndex, alwaysRenderChildren }: DropdrownProps) => {
  const element = useRef<HTMLDivElement>(null)
  const arrowTriangle = useRef<SVGSVGElement>(null)
  const parent = anchorElement
    ? typeof anchorElement === 'string'
      ? document.getElementById(anchorElement)
      : anchorElement
    : element.current?.closest('[data-dropdown-container]')

  useAnchorToElement(element.current, parent, arrow ? 10 : 0, arrow ? updateTriangle : undefined)

  return <Popover
    id={id}
    open={open}
    onToggle={onToggle}
    type={auto ? 'auto' : 'manual'}
    onClick={onClick}
    ref={element}
    className="flex overflow-hidden absolute flex-col p-2.5 bg-transparent duration-300 w-fit max-w-dvw max-h-dvh transition-[scale,opacity]"
    hideDelay={301}
    closedClassname="scale-y-0 scale-x-0 opacity-0"
    alwaysRenderChildren={alwaysRenderChildren}
  >
    <div className="flex overflow-auto flex-col p-0.5 bg-white shadow-md border-1 border-gray-400/50 shadow-black/40 grow" tabIndex={tabIndex}>
      {children}
    </div>
    {arrow &&
      <svg ref={arrowTriangle} className="absolute w-5 h-2.5 text-gray-400/50" width={20} height={10}>
        <polygon points="10,0 0,10.5 20,10.5" stroke="currentColor" fill="#fff" />
      </svg>
    }
  </Popover>
}

function updateTriangle({ element, elementH, transparentPadding, elementW, pointDown }: AnchoringCallbackProps) {
  const arrowElement = element.childNodes[1] as HTMLDivElement
  if (!arrowElement) return
  const triangleW = 20
  arrowElement.style.top = toPx(
    pointDown ? 1 : elementH - 1,
  )
  arrowElement.style.left = toPx((elementW + transparentPadding * 2 - triangleW) / 2)
  arrowElement.style.rotate = pointDown ? '' : '180deg'
}
