import { useEffect, useRef } from 'react'

export default function ItemLoadingIndicator(
  { unloadedCount, isTable, onLoadMore }: { unloadedCount: number, isTable: boolean, onLoadMore?: (itemsToLoad: number) => void },
) {
  const ref = useRef<HTMLDivElement & HTMLTableRowElement>(null)
  const lastUnloadedCount = useRef(Infinity)

  useEffect(() => {
    const elem = ref.current
    const updateHeight = () => {
      if (!elem?.parentElement) return
      elem.style.height = `${getAverageRowHeight(elem.parentElement) * unloadedCount}px`
    }
    elem?.parentElement?.addEventListener('resize', updateHeight)

    updateHeight()
    return () => elem?.parentElement?.removeEventListener('resize', updateHeight)
  }, [unloadedCount])

  useEffect(() => {
    if (!onLoadMore) return
    const elem = ref.current
    if (!elem) return

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && lastUnloadedCount.current !== unloadedCount) {
          lastUnloadedCount.current = unloadedCount
          const overflowHeight = entry.intersectionRect.height
            + Math.max(0, -entry.boundingClientRect.top + entry.intersectionRect.top)
          const averageRowHeight = elem.parentElement ? getAverageRowHeight(elem.parentElement) : 50
          const itemsToLoad = Math.ceil(overflowHeight / averageRowHeight)
          const clampedItemsToLoad = Math.min(40, unloadedCount, Math.max(5, itemsToLoad))
          // console.log('loading ', clampedItemsToLoad)

          onLoadMore(clampedItemsToLoad)
        }
      })
    }, { delay: 50, rootMargin: '50px' } as IntersectionObserverInit)

    observer.observe(elem)

    return () => observer.disconnect()
  }, [unloadedCount, onLoadMore])

  const Elem = isTable ? 'tr' : 'div'
  return <Elem className="animate-pulse bg-gray-300 col-span-full" ref={ref} />
}

function getAverageRowHeight(elem: HTMLElement) {
  const rowCandidates = Array.from(elem.childNodes) as HTMLElement[]
  const rows = rowCandidates
    .filter(node => node.classList?.contains('itemlist-row'))
  const height = rows.reduce((sum, node) => sum + node.offsetHeight, 0)
  return rows.length > 0 ? height / rows.length : 0
}
