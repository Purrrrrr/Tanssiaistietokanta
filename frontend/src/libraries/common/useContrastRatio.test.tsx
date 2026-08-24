import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { useContrastCheck } from './useContrastRatio'

function ContrastCheck({ onContrast }: { onContrast: (contrast: number) => void }) {
  const [ref, contrast] = useContrastCheck<HTMLDivElement>()

  useEffect(() => {
    onContrast(contrast)
  }, [contrast, onContrast])

  return <div ref={ref} style={{ backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)' }} />
}

describe('useContrastCheck', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it('recalculates contrast when the element style changes', async () => {
    const onContrast = jest.fn()

    await act(async () => {
      root.render(<ContrastCheck onContrast={onContrast} />)
    })

    const element = container.firstElementChild as HTMLDivElement
    expect(onContrast).toHaveBeenLastCalledWith(21)

    await act(async () => {
      element.style.color = 'rgb(119, 119, 119)'
      await Promise.resolve()
    })

    expect(onContrast).toHaveBeenLastCalledWith(4.47)
  })

  it('disconnects the observer when unmounted', () => {
    const disconnect = jest.fn()
    const RealMutationObserver = globalThis.MutationObserver

    class TestMutationObserver {
      observe = jest.fn()
      disconnect = disconnect
    }

    globalThis.MutationObserver = TestMutationObserver as unknown as typeof MutationObserver

    act(() => {
      root.render(<ContrastCheck onContrast={() => {}} />)
    })
    act(() => root.unmount())

    expect(disconnect).toHaveBeenCalledTimes(1)
    globalThis.MutationObserver = RealMutationObserver
  })
})
