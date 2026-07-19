import { useRef, useState } from 'react'

import { useDelayedValue } from 'libraries/common/useDelayedValue'
import { useResizeObserver } from 'libraries/common/useResizeObserver'

export function AutosizedSection({ children, className = '', ...props }) {
  const container = useRef<HTMLElement>(null)
  const innerContainer = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(1)
  const [minWidth, setMinWidth] = useState(0)
  const [lastAspectRatio, setLastAspectRatio] = useState(0)
  const delayedSize = useDelayedValue(size, 40)

  const onResize: ResizeObserverCallback = ([e]) => {
    if (e.contentBoxSize === null || container.current === null) return
    const innerSize = e.contentBoxSize[0]
    const containerStyle = getComputedStyle(container.current)
    // console.log(paddingX, paddingY)
    const paddingX = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight)
    const paddingY = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom)

    const containerWidth = container.current.offsetWidth - paddingX
    const containerHeight = container.current.offsetHeight - paddingY

    const width = innerSize.inlineSize / Math.max(containerWidth, 1)
    const height = innerSize.blockSize / Math.max(containerHeight, 1)
    const overFlowAmount = Math.max(1, width, height)
    // console.log(width, height, overFlowAmount, innerSize.blockSize * 1.8)

    const aspectRatio = Math.floor(containerWidth / containerHeight * 100)
    setSize(1 / overFlowAmount)
    if (aspectRatio !== lastAspectRatio) {
      setMinWidth(Math.min(innerSize.inlineSize * 1.5, innerSize.blockSize * 1.8))
    }
    setLastAspectRatio(aspectRatio)
  }
  useResizeObserver(innerContainer, onResize)
  const isReady = size === delayedSize && lastAspectRatio !== 0
  // console.log({ isReady, size, delayedSize, lastAspectRatio })

  return <section className={'max-w-full overflow-hidden ' + className} ref={container} {...props}>
    <div
      ref={innerContainer}
      className="relative left-1/2 p-px origin-top -translate-x-1/2 w-fit h-fit"
      style={{ scale: `${size}`, minWidth, opacity: isReady ? 1 : 0 }}>
      {children}
    </div>
  </section>
}
