import { CSSProperties } from 'react'
import classNames from 'classnames'

import { Button, ButtonProps } from './Button'

export function FloatingToolbar({ children, className, anchorName, side = 'bottom' }: {
  anchorName: string
  side?: string
  className?: string
  children: React.ReactNode
}) {
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
  return <div
    style={{
      '--toolbarAnchorName': anchorName,
      '--toolbarPositionArea': side,
    } as CSSProperties}
    onKeyDown={e => e.stopPropagation() /* Prevent input interactions from leaking into lexical */}
    className={classNames(
      'absolute [position-anchor:var(--toolbarAnchorName)] [position-area:var(--toolbarPositionArea)]',
      className,
      'bg-white border border-gray-400 rounded-md z-20 shadow-md empty:hidden max-w-dvw',
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

function ToolbarTitle({ text }: { text: React.ReactNode }) {
  return (
    <div className="inline-block px-2 py-1 [font-variant:small-caps] text-sm font-bold text-gray-700 user-select-none">
      {text}
    </div>
  )
}

type ToolbarButtonProps = ButtonProps & (
  { tooltip: string, text?: never } | { text: string, tooltip?: string }
)

export function ToolbarButton({ tooltip, text, ...props }: ToolbarButtonProps) {
  return <Button
    minimal
    tooltip={tooltip}
    aria-label={tooltip}
    {...props}
    paddingClass={text ? undefined : ''}
    text={text}
    className={text
      ? ''
      : 'grid justify-center items-center align-sub size-[30px] [font-size:18px]'
    }
  />
}
