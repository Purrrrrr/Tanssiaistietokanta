import { useId, useState } from 'react'

import { useShouldRender } from '@/libraries/common/useShouldRender'

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
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [tooltipHovered, setTooltipHovered] = useState(false)
  const [escapePressed, setEscapePressed] = useState(false)
  const open = useShouldRender((hovered || focused || tooltipHovered) && !escapePressed, 300)
  const id = `--tooltip_${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  if (!tooltip) {
    return [null, null] as const
  }

  const props: AnchorProps = {
    style: { anchorName: id },
    onMouseEnter: () => { setHovered(true); setEscapePressed(false) },
    onMouseLeave: () => { setHovered(false); setEscapePressed(false) },
    onFocus: () => { setFocused(true); setEscapePressed(false) },
    onBlur: () => { setFocused(false); setEscapePressed(false) },
    onKeyDown: e => e.key === 'Escape' && setEscapePressed(true),
  }
  const tooltipElement = open
    ? (
      <Tooltip
        tooltip={tooltip + (tooltipHovered ? ' (hovered)' : '')}
        open={open}
        onToggle={() => {}}
        onMouseEnter={() => { setTooltipHovered(true); setEscapePressed(false) }}
        onMouseLeave={() => { setTooltipHovered(false); setEscapePressed(false) }}
        positionAnchor={id} />
    )
    : null

  return [props, tooltipElement] as const
}
