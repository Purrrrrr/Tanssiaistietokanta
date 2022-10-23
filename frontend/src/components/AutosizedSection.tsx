import React, {useEffect, useLayoutEffect, useRef, useState} from 'react'

export function AutosizedSection({children, ...props}) {
  const container = useRef<HTMLElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(1)
  const windowSize = useWindowSize()

  useLayoutEffect(
    () => {
      if (inner.current === null || container.current === null) return
      const width = inner.current.offsetWidth / container.current.offsetWidth
      const height = inner.current.offsetHeight / container.current.offsetHeight
      const overFlowAmount = Math.max(1, width, height)
      console.log(width, height, overFlowAmount)

      setSize(1 / overFlowAmount)
    },
    [children, windowSize]
  )


  return <section style={{maxWidth: '100%'}} ref={container} {...props}>
    <div ref={inner} style={{width: 'fit-content', height: 'fit-content', transformOrigin: '0 0', transform: `scale(${size})`}}>{children}</div>
  </section>
}

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  useEffect(() => {
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return windowSize
}
