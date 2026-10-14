import { useCallback, useLayoutEffect, useRef } from 'react'
import { useWindowScrollPosition } from '@n8tb1t/use-scroll-position'

import { useResizeObserver } from '@/libraries/common/useResizeObserver'

export interface AnchoringCallbackProps {
  element: HTMLElement
  elementH: number
  elementW: number
  transparentPadding: number
  pointDown: boolean
  anchorCenterX: number
}

export type HorizontalAlignment = 'start' | 'center' | 'end'

export function useAnchorToElement<TargetElement extends HTMLElement>(
  anchorElementParam?: string | HTMLElement,
  spacing?: number,
  callback?: (props: AnchoringCallbackProps) => void,
  enabled = true,
  alignment: HorizontalAlignment = 'center',
) {
  const elementRef = useRef<TargetElement>(null)

  const updateDirection = useCallback(() => {
    const anchorElement = toElement(anchorElementParam)
      ?? elementRef.current?.closest('[data-dropdown-container]')

    if (!elementRef.current || !anchorElement || !enabled) return
    updateElementPosition(elementRef.current, anchorElement, spacing ?? 0, alignment, callback)
  }, [anchorElementParam, spacing, callback, enabled, alignment])

  useLayoutEffect(updateDirection, [updateDirection])
  useResizeObserver(elementRef, updateDirection)
  useWindowScrollPosition(updateDirection, { wait: 100 })
  return elementRef
}

const toElement = (element?: string | HTMLElement) => typeof element === 'string'
  ? document.getElementById(element)
  : element

function updateElementPosition(
  element: HTMLElement,
  anchorElement: Element,
  spacing: number,
  alignment: HorizontalAlignment,
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

  const alignedLeft = alignment === 'start'
    ? anchor.left - transparentPadding
    : alignment === 'end'
      ? anchor.right - elementW - transparentPadding
      : anchor.left + (anchor.width - elementW) / 2 - transparentPadding
  const left = clamp({
    min: margin,
    max: winW - elementWWithPadding - margin,
    value: alignedLeft,
  })
  const anchorCenterX = anchor.left + anchor.width / 2 - left
  const maxH = clamp({
    min: 200,
    value: (pointDown ? winH - anchor.bottom : anchor.top) - margin,
  })

  element.style.minWidth = toPx(anchor.width + transparentPadding * 2)
  element.style.maxHeight = toPx(maxH)
  element.style.top = toPx(top + window.scrollY)
  element.style.left = toPx(left + window.scrollX)
  element.style.transformOrigin = `${toPx(anchorCenterX)} ${pointDown ? 'top' : 'bottom'}`

  callback?.({ element, elementW, elementH, transparentPadding, pointDown, anchorCenterX })
}

export const toPx = (value: number) => `${value}px`
const clamp = ({ value, min = -Infinity, max = Infinity }: { value: number, min?: number, max?: number }) => Math.min(max, Math.max(min, value))
