import { useTooltip } from './hooks/useTooltip'

export interface TooltipContainerProps {
  children: React.ReactNode | ((props: AnchorProps | null) => React.ReactNode)
  tooltip?: React.ReactNode
}

interface AnchorProps {
  style: Pick<React.CSSProperties, 'anchorName'>
  onMouseEnter: () => void
  onMouseLeave: () => void
  onFocus: () => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

export function TooltipContainer({ children, tooltip }: TooltipContainerProps) {
  const [props, tooltipElement] = useTooltip(tooltip)

  return <>
    {typeof children === 'function'
      ? children(props)
      : (
        <div {...props} className="tooltip-container inline">
          {children}
        </div>
      )
    }
    {tooltipElement}
  </>
}
