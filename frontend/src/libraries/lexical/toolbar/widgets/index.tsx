import { CSSProperties, useId } from 'react'
import classNames from 'classnames'

import { FormGroup } from 'libraries/ui'
import { CssClass } from 'libraries/ui/classes'

export { ToolbarButton } from './ToolbarButton'
export { ToolbarColorPicker } from './ToolColorPicker'

export function FloatingToolbar({ children, anchorName, side = 'bottom' }: {
  anchorName: string
  side?: 'bottom' | 'top'
  children: React.ReactNode
}) {
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
  return <div
    style={{ '--toolbarAnchorName': anchorName } as CSSProperties}
    onKeyDown={e => e.stopPropagation() /* Prevent input interactions from leaking into lexical */}
    className={classNames(
      'absolute [position-anchor:var(--toolbarAnchorName)]',
      side === 'bottom' && '[position-area:bottom_span-right] translate-y-1',
      side === 'top' && '[position-area:top_span-right] -translate-y-1',
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

export function ToolbarTitle({ text }: { text: React.ReactNode }) {
  return (
    <div className="inline-block px-2 py-1 [font-variant:small-caps] text-sm font-bold text-gray-700">
      {text}
    </div>
  )
}

interface ToolbarInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value: string | number
  onChange: (value: string) => void
  label: string
}

export function ToolbarInput({ value, onChange, label, ...props }: ToolbarInputProps) {
  const id = useId()
  return <FormGroup inline label={label} labelFor={props.id ?? id}>
    <input
      id={id}
      className={CssClass.input}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </FormGroup>
}
