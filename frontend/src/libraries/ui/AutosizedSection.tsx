import React, {useRef, useState} from 'react'
import { ResizeSensor2, ResizeSensor2Props } from '@blueprintjs/popover2'

import './AutosizedSection.sass'

type ResizeEntry = Parameters<ResizeSensor2Props['onResize']>[0][number]

export function AutosizedSection({children, className = '', ...props}) {
  const container = useRef<HTMLElement>(null)
  const [size, setSize] = useState(1)

  const onResize = ([e]: ResizeEntry[]) => {
    if (e.contentBoxSize === null || container.current === null) return
    const innerSize = e.contentBoxSize[0]
    const containerStyle = getComputedStyle(container.current)

    const paddingX = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight)
    const paddingY = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom)
    // console.log(paddingX, paddingY)
    const width = innerSize.inlineSize / (container.current.offsetWidth - paddingX)
    const height = innerSize.blockSize / (container.current.offsetHeight - paddingY)
    const overFlowAmount = Math.max(1, width, height)
    // console.log(width, height, overFlowAmount)

    setSize(1 / overFlowAmount)
  }

  return <section className={'autosized-section '+ className} ref={container} {...props}>
    <ResizeSensor2 onResize={onResize}>
      <div className="autosized-section-inner" style={{transform: `scale(${size})`}}>{children}</div>
    </ResizeSensor2>
  </section>
}
