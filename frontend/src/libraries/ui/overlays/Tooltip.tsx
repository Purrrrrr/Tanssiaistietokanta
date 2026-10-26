import { createPortal } from 'react-dom'

import { ControlledPopover } from './unstyled/Popover'

interface TooltipProps {
  tooltip: React.ReactNode
  open: boolean
  onToggle: (open: boolean) => unknown
  onMouseEnter?: () => unknown
  onMouseLeave?: () => unknown
  positionAnchor: string
}

export function Tooltip({ tooltip, positionAnchor, ...rest }: TooltipProps) {
  return createPortal(
    <ControlledPopover
      style={{ positionAnchor }}
      type="manual"
      aria-hidden
      openClassname="tooltip-open"
      className="tooltip w-max bg-gray-50 border-gray-500 shadow-md p-0.75 border shadow-black/10"
      {...rest}
    >
      {tooltip}
    </ControlledPopover>,
    document.body,
  )
}
