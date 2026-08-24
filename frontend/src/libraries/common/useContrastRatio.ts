import { useEffect, useRef, useState } from 'react'

export function useContrastCheck<E extends HTMLElement>() {
  const elem = useRef(null as E | null)
  const [constrast, setContrast] = useState(0)

  useEffect(() => {
    const element = elem.current
    if (!element) return

    const updateContrast = () => setContrast(getElementContrast(element))
    updateContrast()

    const observer = new MutationObserver(updateContrast)
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style'],
    })

    return () => observer.disconnect()
  }, [])

  return [elem, constrast] as const
}

export function getElementContrast(elem: HTMLElement) {
  const bg = window.getComputedStyle(elem).backgroundColor
  const fg = window.getComputedStyle(elem).color
  const contrast = getContrastRatio(parseRgb(bg), parseRgb(fg))
  return contrast
}

const parseRgb = (rgb: string): RGB => {
  const match = rgb.match(/rgba?\((\d+), (\d+), (\d+)/)
  if (!match) return [0, 0, 0]
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
}

/**
 * Calculate contrast ratio.
 *
 * Definition: https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
 */
export function getContrastRatio(color1: RGB, color2: RGB) {
  const l1 = getRelativeLuminance(color1)
  const l2 = getRelativeLuminance(color2)
  const lightest = Math.max(l1, l2)
  const darkest = Math.min(l1, l2)
  const contrast = (lightest + 0.05) / (darkest + 0.05)
  return Math.floor(contrast * 100) / 100
}

const getRelativeLuminance = ([r, g, b]: RGB) => {
  const srgb = [r, g, b].map(value => value / 255)
  const [R, G, B] = srgb.map(value => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  const L = 0.2126 * R + 0.7152 * G + 0.0722 * B
  return L
}

type RGB = [number, number, number]
