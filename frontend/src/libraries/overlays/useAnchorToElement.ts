import { useCallback, useLayoutEffect } from 'react'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'

import { useResizeObserver } from 'libraries/ui'

export interface AnchoringCallbackProps {
  element: HTMLElement
  elementH: number
  elementW: number
  transparentPadding: number
  pointDown: boolean
}

export function useAnchorToElement(
  element?: HTMLElement | null,
  anchorElement?: Element | null,
  spacing?: number,
  callback?: (props: AnchoringCallbackProps) => void,
) {
  const updateDirection = useCallback(() => {
    if (!element || !anchorElement) return
    updateElementPosition(element, anchorElement, spacing ?? 0, callback)
  }, [element, anchorElement, spacing, callback])

  useLayoutEffect(updateDirection, [updateDirection])
  useResizeObserver({ current: element ?? null }, updateDirection)
  useScrollPosition(updateDirection, [updateDirection], undefined, true, 100)
}

function updateElementPosition(
  element: HTMLElement,
  anchorElement: Element,
  spacing: number,
  callback?: (props: AnchoringCallbackProps) => void,
) {
  const anchor = anchorElement.getBoundingClientRect()
  const { clientHeight: elementHWithPadding, clientWidth: elementWWithPadding } = element
  const { clientHeight: winH, clientWidth: winW } = document.documentElement
  const margin = 10
  // For shadows and the arrow to render properly we have a transparent padding area
  const transparentPadding = 10
  const elementH = elementHWithPadding - transparentPadding * 2 + spacing
  const elementW = elementWWithPadding - transparentPadding * 2

  const spaceDown = winH - anchor.bottom - elementH
  const spaceUp = anchor.top - elementH

  let pointDown = true
  const canPointDown = spaceDown > margin
  if (!canPointDown) {
    const canPointUp = spaceUp > margin
    if (canPointUp) {
      pointDown = false
    } else {
      pointDown = spaceDown > spaceUp
    }
  }
  const top = pointDown
    ? anchor.top + anchor.height + spacing - transparentPadding
    : anchor.top - elementH - transparentPadding

  const centeredLeft = anchor.left + (anchor.width - elementW) / 2 - transparentPadding
  const left = clamp({
    min: margin,
    max: winW - elementW - margin,
    value: centeredLeft,
  })
  const maxH = clamp({
    min: 200,
    value: (pointDown ? winH - anchor.bottom : anchor.top) - margin,
  })

  element.style.minWidth = toPx(anchor.width + transparentPadding * 2)
  element.style.maxHeight = toPx(maxH)
  element.style.top = toPx(top + window.scrollY)
  element.style.left = toPx(left + window.scrollX)
  element.style.transformOrigin = pointDown
    ? 'top' : 'bottom'

  callback?.({ element, elementW, elementH, transparentPadding, pointDown })
}

export const toPx = (value: number) => `${value}px`
const clamp = ({ value, min = -Infinity, max = Infinity }: { value: number, min?: number, max?: number }) => Math.min(max, Math.max(min, value))
