import { type ComponentProps, ForwardedRef, forwardRef, RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import { useShouldRender } from './useShouldRender'

interface PopoverProps extends ComponentProps<'div'> {
  type: 'manual' | 'auto'
  hideDelay?: number
  open?: boolean
  alwaysRenderChildren?: boolean
  onToggle?: (open: boolean) => unknown
  openClassname?: string
  hidingClassname?: string
  closedClassname?: string
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({
    open, onToggle, ...props
  }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

    return <ControlledPopover
      open={open ?? uncontrolledOpen}
      onToggle={newOpen => { setUncontrolledOpen(newOpen); onToggle?.(newOpen) }}
      ref={ref}
      {...props}
    />
  }
)

type ControlledPopoverProps = PopoverProps & Required<Pick<PopoverProps, 'open' | 'onToggle'>>

export const ControlledPopover = forwardRef<HTMLDivElement, ControlledPopoverProps>(
  function ControlledPopover({
    open, onToggle, type,
    className, openClassname, closedClassname, hidingClassname,
    children, alwaysRenderChildren, hideDelay = 0, ...props
  }, externalRef) {
    const element = useRef<HTMLDivElement>(null)
    useCopyRef(element, externalRef)
    const shouldRender = useShouldRender(open, hideDelay)

    useLayoutEffect(() => {
      element.current?.togglePopover(shouldRender)
    }, [shouldRender])
    useToggleEventHandler(element, event => {
      const opened = event.newState === 'open'
      if (opened !== shouldRender) {
        element.current?.togglePopover(shouldRender)
        onToggle(opened)
      }
    })

    return <div
      ref={element}
      popover={type}
      {...props}
      className={classNames(
        className,
        !shouldRender && closedClassname,
        open && openClassname,
        shouldRender && !open && (hidingClassname ?? closedClassname),
      )}
    >
      {(open || shouldRender || alwaysRenderChildren) && children}
    </div>
  }
)

function useCopyRef<T>(ref: RefObject<T>, externalRef?: ForwardedRef<T>) {
  if (typeof externalRef === 'function') {
    externalRef(ref.current)
  } else if (externalRef) {
    externalRef.current = ref.current
  }
  return ref
}

function useToggleEventHandler(element: RefObject<HTMLDivElement>, handler: (e: ToggleEvent) => unknown) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  useEffect(
    () => {
      const node = element.current
      const h = (e: Event) => handlerRef.current(e as ToggleEvent)
      node?.addEventListener('toggle', h)
      return () => node?.removeEventListener('toggle', h)
    },
    [element]
  )
}
