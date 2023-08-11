import React from 'react'
import classnames from 'classnames'

import './SlideContainer.scss'

export interface SlideContainerProps {
  children?: React.ReactElement | React.ReactElement[]
  color?: React.CSSProperties['background']
  size?: number
  fullscreen?: boolean
}

export function SlideContainer({children, color, size, fullscreen}: SlideContainerProps) {
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
  return <div className={className} style={style}>
    <div className="slide-container">
      {children}
    </div>
  </div>

}
