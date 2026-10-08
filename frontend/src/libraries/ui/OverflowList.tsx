import { Children, useRef, useState } from 'react'
import classNames from 'classnames'

import { useResizeObserver } from '@/libraries/common/useResizeObserver'

import { useCommonT } from './commonTranslations'
import { MenuButton } from './MenuButton'

interface OverflowListProps {
  children?: React.ReactNode
  items?: OverflowListItem[]
  className?: string
  align?: 'left' | 'right'
}

export interface OverflowListItem {
  key?: string | number
  content: React.ReactNode
  alwaysVisible?: boolean
}

interface OverflowListState {
  minSize: number
  visibleItems: number[]
  invisibleItems: number[]
}

const MENU_WIDTH = 30
const ROOT = Symbol('ROOT_KEY')

type SizeKey = number | string | typeof ROOT

export function OverflowList({ align, className, ...props }: OverflowListProps) {
  const t = useCommonT('')
  const sizes = useRef(new Map<SizeKey, number>())
  const requestId = useRef<number | null>(null)
  const bumpCounter = useRef(0)
  const items = useOverflowItems(props)
  const [state, setState] = useState<OverflowListState>({
    minSize: 0,
    visibleItems: items.map((_, i) => i),
    invisibleItems: [],
  })

  const tick = () => {
    bumpCounter.current--
    if (bumpCounter.current === 0) reflow()
    else requestId.current = requestAnimationFrame(tick)
  }

  const setSize = (index: SizeKey, width: number) => {
    // console.log('setSize', index, width)
    if (sizes.current.get(index) === width) return
    sizes.current.set(index, width)
    bumpCounter.current = 6
    if (requestId.current) cancelAnimationFrame(requestId.current)
    requestId.current = requestAnimationFrame(tick)
  }

  const reflow = () => {
    if (!items) return
    const rootSize = sizes.current.get(ROOT) ?? 0
    const itemSizes = items.map(item => sizes.current.get(item.key) ?? 0)
    const totalItemSize = itemSizes.reduce((a, b) => a + b, 0)

    const visibleItems: number[] = []
    const invisibleItems: number[] = []
    let minSize = 0
    let totalSize = totalItemSize + (totalItemSize > rootSize ? MENU_WIDTH : 0)

    for (let index = items.length - 1; index >= 0; index--) {
      const item = items[index]
      const size = itemSizes[index]
      if (item.alwaysVisible) {
        minSize += size
        visibleItems.unshift(index)
      } else if (totalSize > rootSize) {
        totalSize -= size
        invisibleItems.unshift(index)
      } else {
        visibleItems.unshift(index)
      }
    }

    setState({
      minSize: Math.ceil(minSize + (invisibleItems.length > 0 ? MENU_WIDTH : 0)),
      visibleItems,
      invisibleItems,
    })
  }

  const visibleItems = state.visibleItems.map(index => items[index])
  const invisibleItems = state.invisibleItems.map(index => items[index])

  return <MeasuringContainer
    className={classNames(
      'flex relative min-w-(--minsize) overflow-hidden',
      className,
      align === 'right' && 'justify-end',
    )}
    onSizeChange={width => setSize(ROOT, width)}
    style={{ '--minsize': `${state.minSize}px` } as React.CSSProperties}>
    {visibleItems.map(item =>
      <MeasuringContainer key={item.key} onSizeChange={width => setSize(item.key, width)}>{item.content}</MeasuringContainer>,
    )}
    {invisibleItems.length > 0 &&
      <MenuButton
        buttonProps={{
          minimal: true,
          text: t('more', { count: invisibleItems.length }),
          iconOnly: true,
          rightIcon: { icon: 'more', className: 'rotate-90' },
        }}
      >
        <div className="overflow-menu flex flex-col items-stretch w-max *:[.tooltip-container]:*:[:not(.tooltip)]:w-full">
          {invisibleItems.map(item => item.content)}
        </div>
      </MenuButton>
    }
    {invisibleItems.length > 0 &&
      <MeasuringContainer
        className={classNames('relative -top-100 left-0 opacity-0 pointer-events-none', align === 'right' && '-order-1')}
        onSizeChange={width => setSize(invisibleItems[0].key, width)}>
        {invisibleItems[0].content}
      </MeasuringContainer>
    }
  </MeasuringContainer>
}

function useOverflowItems({ children, items }: Pick<OverflowListProps, 'items' | 'children'>): Required<OverflowListItem>[] {
  if (children && items) throw new Error('OverflowList: You can only provide either children or items, not both.')

  return children
    ? Children.toArray(children).map((child, index) => ({
      content: child,
      key: child && typeof child === 'object' && 'key' in child
        ? child.key ?? index
        : index,
      alwaysVisible: false,
    }))
    : (items ?? []).map((item, index) => ({ alwaysVisible: false, key: index, ...item }))
}

function MeasuringContainer({ onSizeChange, ...props }: { onSizeChange: (width: number) => void } & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  useResizeObserver(ref, entries => {
    const size = entries[0].borderBoxSize
    if (size) onSizeChange(size[0].inlineSize)
  })
  return <div ref={ref} {...props} />
}
