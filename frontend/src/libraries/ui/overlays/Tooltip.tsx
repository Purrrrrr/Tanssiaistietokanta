import { createPortal } from 'react-dom'

import { ControlledPopover } from './unstyled/Popover'

interface TooltipProps {
  tooltip: React.ReactNode
  open: boolean
  onToggle: (open: boolean) => unknown
  positionAnchor: string
}

export function Tooltip({ tooltip, open, onToggle, positionAnchor }: TooltipProps) {
  return createPortal(
    <ControlledPopover
      style={{ positionAnchor }}
      type="manual"
      open={open}
      onToggle={onToggle}
      aria-hidden
      openClassname="tooltip-open"
      className="tooltip w-max bg-gray-50 border-gray-500 shadow-md p-0.75 border shadow-black/10"
    >
      {tooltip}
    </ControlledPopover>,
    document.body,
  )
}
