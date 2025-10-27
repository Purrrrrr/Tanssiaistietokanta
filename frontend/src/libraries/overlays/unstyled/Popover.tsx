import { type ComponentProps, type ForwardedRef, forwardRef, type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
      onToggle={newOpen => {
        setUncontrolledOpen(newOpen)
        onToggle?.(newOpen)
      }}
      ref={ref}
      {...props}
    />
  },
)

type ControlledPopoverProps = PopoverProps & Required<Pick<PopoverProps, 'open' | 'onToggle'>>

export const ControlledPopover = forwardRef<HTMLDivElement, ControlledPopoverProps>(
  function ControlledPopover({
    open, onToggle, type,
    className, openClassname, closedClassname, hidingClassname,
    children, alwaysRenderChildren, hideDelay = 0, ...props
  }, externalRef) {
    const element = useRef<HTMLDivElement>(null)
    const shouldRender = useShouldRender(open, hideDelay)

    useLayoutEffect(() => {
      element.current?.togglePopover(open || shouldRender)
    }, [open, shouldRender])
    useToggleEventHandler(element, event => {
      const opened = event.newState === 'open'
      if (opened !== (open || shouldRender)) {
        element.current?.togglePopover(shouldRender)
        onToggle(opened)
      }
    })

    return <div
      inert={open ? undefined : 'inert'}
      ref={handleRefs(element, externalRef)}
      popover={type}
      {...props}
      className={classNames(
        className,
        !shouldRender && closedClassname,
        shouldRender && (
          open ? openClassname : (hidingClassname ?? closedClassname)
        ),
      )}
    >
      {(open || shouldRender || alwaysRenderChildren) && children}
    </div>
  },
)
function handleRefs<T>(...refs: (ForwardedRef<T>)[]) {
  return (node: T) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    })
  }
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
    [element],
  )
}
