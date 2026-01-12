import React from 'react'
import classnames from 'classnames'

import './SlideContainer.scss'

export interface SlideContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  onMouseDown?: (event: React.MouseEvent) => void
  children?: React.ReactElement | React.ReactElement[]
  color?: React.CSSProperties['background']
  size?: React.CSSProperties['width']
  fullscreen?: boolean
}

export function SlideContainer({ children, color, size, fullscreen, className, ...props }: SlideContainerProps) {
  const allClassNames = classnames(
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

  return <div className={allClassNames} style={style} {...props}>
    <div className="slide-container">
      {children}
    </div>
  </div>
}
