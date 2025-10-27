import { useRef, useState } from 'react'

import { useResizeObserver } from './utils/useResizeObserver'

export function AutosizedSection({ children, className = '', ...props }) {
  const container = useRef<HTMLElement>(null)
  const innerContainer = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(1)

  const onResize: ResizeObserverCallback = ([e]) => {
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
  useResizeObserver(innerContainer, onResize)

  return <section className={'max-w-full overflow-hidden ' + className} ref={container} {...props}>
    <div ref={innerContainer} className="relative left-1/2 origin-top -translate-x-1/2 w-fit h-fit p-px" style={{ scale: `${size}` }}>{children}</div>
  </section>
}
