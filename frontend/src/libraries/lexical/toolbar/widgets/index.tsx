import { CSSProperties } from 'react'
import classNames from 'classnames'

export { ToolbarButton } from './ToolbarButton'

export function FloatingToolbar({ children, anchorName, side = 'bottom' }: {
  anchorName: string
  side?: 'bottom' | 'top'
  children: React.ReactNode
}) {
  return <div
    style={{ '--toolbarAnchorName': anchorName } as CSSProperties}
    className={classNames(
      'absolute [position-anchor:var(--toolbarAnchorName)]',
      side === 'bottom' && '[position-area:bottom_span-right] translate-y-1',
      side === 'top' && '[position-area:top_span-right] -translate-y-1',
      'bg-white border-1 border-gray-400 rounded-md z-20 shadow-md empty:hidden max-w-dvw',
    )}
  >
    {children}
  </div>
}

export function ToolbarRow({ children, title }: { children: React.ReactNode, title: string }) {
  return <div className="flex flex-wrap gap-2 items-center py-1 px-2">
    <ToolbarTitle text={title} />
    {children}
  </div>
}

export function ToolbarTitle({ text }: { text: React.ReactNode }) {
  return (
    <div className="inline-block px-2 py-1 [font-variant:small-caps] text-sm font-bold text-gray-700">
      {text}
    </div>
  )
}
