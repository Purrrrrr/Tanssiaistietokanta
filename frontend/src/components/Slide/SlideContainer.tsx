import React, { ForwardedRef }  from 'react'
import classnames from 'classnames'

import './SlideContainer.scss'

export interface SlideContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  children?: React.ReactElement | React.ReactElement[]
  color?: React.CSSProperties['background']
  size?: number
  fullscreen?: boolean
}

function SlideContainerBase({children, color, size, fullscreen, ...props}: SlideContainerProps, ref: ForwardedRef<HTMLDivElement>) {
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

  return <div className={className} style={style} {...props} ref={ref}>
    <div className="slide-container">
      {children}
    </div>
  </div>

}

export const SlideContainer = React.forwardRef(SlideContainerBase)
