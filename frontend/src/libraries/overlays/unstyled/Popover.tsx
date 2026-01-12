import { type ComponentProps, Ref, type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import { useShouldRender } from 'libraries/common/useShouldRender'

interface PopoverProps extends Omit<ComponentProps<'div'>, 'onToggle'> {
  type: 'manual' | 'auto'
  hideDelay?: number
  open?: boolean
  alwaysRenderChildren?: boolean
  onToggle?: (open: boolean) => unknown
  openClassname?: string
  hidingClassname?: string
  closedClassname?: string
}

export function Popover({ open, onToggle, ...props }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

  return <ControlledPopover
    open={open ?? uncontrolledOpen}
    onToggle={newOpen => {
      setUncontrolledOpen(newOpen)
      onToggle?.(newOpen)
    }}
    {...props}
  />
}

type ControlledPopoverProps = PopoverProps & Required<Pick<PopoverProps, 'open' | 'onToggle'>>

export function ControlledPopover({
  open, onToggle, type,
  className, openClassname, closedClassname, hidingClassname,
  children, alwaysRenderChildren, hideDelay = 0, ref: externalRef, ...props
}: ControlledPopoverProps) {
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
    inert={!open}
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
}
function handleRefs<T>(...refs: (Ref<T> | undefined)[]) {
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

function useToggleEventHandler(element: RefObject<HTMLDivElement | null>, handler: (e: ToggleEvent) => unknown) {
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
