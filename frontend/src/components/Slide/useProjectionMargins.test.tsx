import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import {
  changeProjectionMargin, defaultProjectionMargins, getProjectionMarginOptions, normalizeProjectionMargins,
  ProjectionMargins, projectionMarginSides, projectionMarginsStorageKey,
} from './projectionMargins'
import { useProjectionMargins } from './useProjectionMargins'

describe('projection margins', () => {
  it('offers 5% increments that preserve at least 20% on both axes', () => {
    for (let top = 0; top <= 80; top += 10) {
      for (let left = 0; left <= 80; left += 10) {
        const margins = { top, bottom: 80 - top, left, right: 80 - left }
        for (const side of projectionMarginSides) {
          const options = getProjectionMarginOptions(margins, side)
          expect(options[0]).toBe(0)
          expect(options).toContain(margins[side])
          for (const value of options) {
            const changed = changeProjectionMargin(margins, side, value)
            expect(changed.top + changed.bottom).toBeLessThanOrEqual(80)
            expect(changed.left + changed.right).toBeLessThanOrEqual(80)
            expect(changed[side]).toBe(value)
            expect(value % 5).toBe(0)
          }
        }
      }
    }
  })

  it('clamps a change without changing the opposite margin', () => {
    const margins = { top: 30, bottom: 0, left: 0, right: 60 }
    expect(changeProjectionMargin(margins, 'bottom', 80)).toEqual({ ...margins, bottom: 50 })
    expect(changeProjectionMargin(margins, 'left', 80)).toEqual({ ...margins, left: 20 })
  })

  it('sanitizes stored values and excessive opposing margins', () => {
    expect(normalizeProjectionMargins({ top: 35, bottom: 80, left: 90, right: 40 }))
      .toEqual({ top: 35, bottom: 45, left: 80, right: 0 })
    expect(normalizeProjectionMargins({ top: '30', bottom: -10, left: Infinity, right: NaN }))
      .toEqual(defaultProjectionMargins)
    expect(normalizeProjectionMargins(null)).toEqual(defaultProjectionMargins)
  })
})

describe('useProjectionMargins', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  let controls: ReturnType<typeof useProjectionMargins>

  function Harness() {
    const value = useProjectionMargins()
    useEffect(() => {
      controls = value
    }, [value])
    return null
  }

  function mount() {
    act(() => root.render(<Harness />))
  }

  function storedMargins(): ProjectionMargins {
    return JSON.parse(localStorage.getItem(projectionMarginsStorageKey) ?? 'null') as ProjectionMargins
  }

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    localStorage.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  it('immediately remembers changes, restores them on remount, and remembers reset', () => {
    mount()
    act(() => controls.setMargin('bottom', 30))
    expect(storedMargins()).toEqual({ top: 0, bottom: 30, left: 0, right: 0 })

    act(() => root.unmount())
    root = createRoot(container)
    mount()
    expect(controls.margins.bottom).toBe(30)

    act(() => controls.resetMargins())
    expect(controls.margins).toEqual(defaultProjectionMargins)
    expect(storedMargins()).toEqual(defaultProjectionMargins)
  })

  it('restores valid margins while limiting excessive stored margins', () => {
    localStorage.setItem(projectionMarginsStorageKey, JSON.stringify({ top: 60, bottom: 60, left: 80, right: 80 }))
    mount()
    expect(controls.margins).toEqual({ top: 60, bottom: 20, left: 80, right: 0 })
    expect(storedMargins()).toEqual(controls.margins)
  })

  it('falls back to zero margins when the stored JSON is corrupt', () => {
    localStorage.setItem(projectionMarginsStorageKey, '{broken')
    mount()
    expect(controls.margins).toEqual(defaultProjectionMargins)
  })

  it('keeps adjustments working when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked') })
    mount()
    act(() => controls.setMargin('left', 30))
    expect(controls.margins.left).toBe(30)
    act(() => controls.resetMargins())
    expect(controls.margins).toEqual(defaultProjectionMargins)
  })
})
