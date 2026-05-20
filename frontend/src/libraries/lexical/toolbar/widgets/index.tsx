import { CSSProperties } from 'react'
import classNames from 'classnames'

export { ToolbarButton } from './ToolbarButton'
export { ToolbarTitle } from './ToolbarTitle'

export function FloatingToolbar({ children, anchorName }: {
  anchorName: string
  children: React.ReactNode
}) {
  return <div
    style={{ '--toolbarAnchorName': anchorName } as CSSProperties}
    className={classNames(
      'absolute [position-anchor:var(--toolbarAnchorName)]',
      'mt-3 [position-area:bottom_span-right]',
      'bg-white border-1 border-gray-400 rounded-md z-20 shadow-md empty:hidden max-w-dvw',
    )}
  >
    {children}
  </div>
}

export function ToolbarRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 items-center py-1 px-2">
    {children}
  </div>
}
