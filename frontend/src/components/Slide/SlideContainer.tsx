import React  from 'react'
import classnames from 'classnames'

import './SlideContainer.scss'

export interface SlideContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  children?: React.ReactElement | React.ReactElement[]
  color?: React.CSSProperties['background']
  size?: number
  fullscreen?: boolean
}

export function SlideContainer({children, color, size, fullscreen, ...props}: SlideContainerProps) {
  const className =classnames(
    'slide-backdrop',
    {
      full: fullscreen,
      preview: !fullscreen && size,
    },
  )
  const style = {
    background: color,
    width: fullscreen ? undefined : size,
  }
  return <div className={className} style={style} {...props}>
    <div className="slide-container">
      {children}
    </div>
  </div>

}
