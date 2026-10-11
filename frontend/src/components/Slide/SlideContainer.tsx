import React from 'react'
import classnames from 'classnames'

import { ProjectionMargins } from './projectionMargins'

import './SlideContainer.scss'

export interface SlideContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  onMouseDown?: (event: React.MouseEvent) => void
  children?: React.ReactElement | React.ReactElement[]
  color?: React.CSSProperties['background']
  size?: React.CSSProperties['width']
  fullscreen?: boolean
  projectionMargins?: ProjectionMargins
}

export function SlideContainer({ children, color, size, fullscreen, projectionMargins, className, ...props }: SlideContainerProps) {
  const backdropClassNames = classnames(
    'slide-backdrop',
    {
      full: fullscreen,
      preview: !fullscreen && size,
    },
    className,
  )
  const style = {
    background: color,
    width: fullscreen ? undefined : size,
  }
  const viewportStyle = fullscreen && projectionMargins ? {
    top: `${projectionMargins.top}%`,
    bottom: `${projectionMargins.bottom}%`,
    left: `${projectionMargins.left}%`,
    right: `${projectionMargins.right}%`,
  } : undefined

  return <div className={backdropClassNames} style={style} {...props}>
    <div className="slide-viewport" style={viewportStyle}>
      <div className="slide-container">
        {children}
      </div>
    </div>
  </div>
}
