import { type ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
import classNames from 'classnames'

interface DropdownContainerProps {
  children: ReactNode
}

export function DropdownContainer({ children }: DropdownContainerProps) {
  return <div className="relative w-fit">
    {children}
  </div>
}

interface DropdrownProps {
  open: boolean
  children: ReactNode
}

export const Dropdown = ({ children, open }: DropdrownProps) => {
  const element = useRef<HTMLDivElement>(null)
  const [direction, setDirection] = useState('up')

  const updateDirection = useCallback(() => {
    if (!open || !element.current) return

    const { top, bottom } = element.current.getBoundingClientRect()
    const { clientHeight } = document.documentElement
    const fromBottom = clientHeight - bottom

    if (fromBottom < 30 && top > clientHeight - bottom) {
      setDirection('up')
    } else {
      setDirection('down')
    }
  }, [open])

  useLayoutEffect(updateDirection, [updateDirection])
  useScrollPosition(updateDirection, [updateDirection], undefined, true, 100)

  return <div ref={element} onResize={updateDirection} className={classNames(
    'absolute z-50 w-fit left-0 transition-all bg-white shadow-black/40 shadow-md',
    direction === 'down' ? 'top-full origin-top' : 'bottom-full origin-bottom',
    open || 'scale-y-0 opacity-0',
  )}>
    {children}
  </div>
}
