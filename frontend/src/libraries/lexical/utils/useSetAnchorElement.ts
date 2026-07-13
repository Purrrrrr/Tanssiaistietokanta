import { useRef } from 'react'

export function useSetAnchorElement(anchorName: string) {
  const anchorRef = useRef<HTMLElement | null>(null)

  return (newDom?: HTMLElement | null) => {
    const dom = newDom === undefined ? anchorRef.current : newDom
    if (dom) {
      addAnchorName(dom, anchorName)
    }
    if (anchorRef.current !== dom) {
      if (anchorRef.current) {
        removeAnchorName(anchorRef.current, anchorName)
      }
      anchorRef.current = dom
    }
  }
}

function addAnchorName(dom: HTMLElement, anchorName: string) {
  if (dom.style.anchorName) {
    const names = dom.style.anchorName
      .split(',')
      .map(name => name.trim())
      .filter(name => name !== anchorName)
    dom.style.anchorName = [...names, anchorName].join(', ')
  } else {
    dom.style.anchorName = anchorName
  }
}

function removeAnchorName(dom: HTMLElement, anchorName: string) {
  if (dom.style.anchorName) {
    const names = dom.style.anchorName
      .split(',')
      .map(name => name.trim())
      .filter(name => name !== anchorName)
    dom.style.anchorName = names.join(', ')
  }
}
