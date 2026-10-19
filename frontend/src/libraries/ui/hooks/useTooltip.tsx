import { useId, useState } from 'react'

import { Tooltip } from '../overlays/Tooltip'

export interface AnchorProps {
  style: Pick<React.CSSProperties, 'anchorName'>
  onMouseEnter: () => void
  onMouseLeave: () => void
  onFocus: () => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

export function useTooltip(tooltip: React.ReactNode) {
  const [open, setOpen] = useState(false)
  const id = `--tooltip_${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  if (!tooltip) {
    return [null, null] as const
  }

  const props: AnchorProps = {
    style: { anchorName: id },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    onKeyDown: e => e.key === 'Escape' && setOpen(false),
  }
  const tooltipElement = <Tooltip
    tooltip={tooltip}
    open={open}
    onToggle={setOpen}
    positionAnchor={id} />

  return [props, tooltipElement] as const
}
