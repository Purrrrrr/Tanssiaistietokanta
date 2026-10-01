import { Children, useRef, useState } from 'react'

import { useResizeObserver } from '@/libraries/common/useResizeObserver'

import { useCommonT } from './commonTranslations'
import { MenuButton } from './MenuButton'

interface OverflowListProps {
  children: React.ReactNode
}

const MENU_WIDTH = 30

export function OverflowList({ children }: OverflowListProps) {
  const t = useCommonT('')
  const sizes = useRef(new Map<number | 'root', number>())
  const requestId = useRef<number | null>(null)
  const bumpCounter = useRef(0)
  const [visibleCount, setVisibleCount] = useState(0)

  const tick = () => {
    bumpCounter.current--
    if (bumpCounter.current === 0) reflow()
    else requestId.current = requestAnimationFrame(tick)
  }

  const setSize = (index: number | 'root', width: number) => {
    // console.log('setSize', index, width)
    sizes.current.set(index, width)
    bumpCounter.current = 6
    if (requestId.current) cancelAnimationFrame(requestId.current)
    requestId.current = requestAnimationFrame(tick)
  }

  const items = Children.toArray(children)

  const reflow = () => {
    if (!items) return
    console.log('reflow', sizes.current)

    const showItems = (numItems: number) => {
      const nextCount = Math.max(0, Math.min(numItems, items.length))
      console.log('showItems', numItems, nextCount)
      setVisibleCount(nextCount)
    }
    const rootSize = sizes.current.get('root') ?? 0

    let totalSize = 0
    for (let i = 0; i < items.length; i++) {
      const itemSize = sizes.current.get(i) ?? 0
      totalSize += itemSize
      if (totalSize > rootSize - (i < items.length - 1 ? MENU_WIDTH : 0)) {
        showItems(i)
        return
      }
    }
    showItems(items.length)
  }

  const invisibleItems = items?.slice(visibleCount) ?? []
  const visibleItems = items.slice(0, visibleCount)
    .map((child, index) =>
      <MeasuringContainer key={index} onSizeChange={width => setSize(index, width)}>{child}</MeasuringContainer>,
    )
  return <MeasuringContainer className="flex relative" onSizeChange={width => setSize('root', width)}>
    {visibleItems}
    {invisibleItems.length > 0 &&
      <MenuButton
        buttonProps={{
          minimal: true,
          text: t('more', { count: invisibleItems.length }),
          iconOnly: true,
          rightIcon: { icon: 'more', className: 'rotate-90' },
        }}
      >
        <div className="overflow-menu flex flex-col items-stretch">
          {invisibleItems}
        </div>
      </MenuButton>
    }
    {visibleCount < items.length &&
      <MeasuringContainer className="fixed -top-100 left-0 opacity-0 pointer-events-none" onSizeChange={width => setSize(visibleCount, width)}>
        {items[visibleCount]}
      </MeasuringContainer>
    }
  </MeasuringContainer>
}

function MeasuringContainer({ onSizeChange, ...props }: { onSizeChange: (width: number) => void } & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  useResizeObserver(ref, entries => {
    const size = entries[0].borderBoxSize
    if (size) onSizeChange(size[0].inlineSize)
  })
  return <div ref={ref} {...props} />
}
