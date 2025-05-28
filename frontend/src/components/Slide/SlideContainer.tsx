import React, { ForwardedRef }  from 'react'
import classnames from 'classnames'

import './SlideContainer.scss'

export interface SlideContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  onMouseDown?: (event: React.MouseEvent) => void
  children?: React.ReactElement | React.ReactElement[]
  color?: React.CSSProperties['background']
  size?: React.CSSProperties['width']
  fullscreen?: boolean
}

function SlideContainerBase({children, color, size, fullscreen, className, ...props}: SlideContainerProps, ref: ForwardedRef<HTMLDivElement>) {
  const allClassNames =classnames(
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

  return <div className={allClassNames} style={style} {...props} ref={ref}>
    <div className="slide-container">
      {children}
    </div>
  </div>

}

export const SlideContainer = React.forwardRef(SlideContainerBase)
