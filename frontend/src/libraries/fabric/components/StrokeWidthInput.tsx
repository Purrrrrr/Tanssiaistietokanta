import { useId, useRef } from 'react'
import classNames from 'classnames'

import { Button } from '@/libraries/ui'
import { CssClass } from '@/libraries/ui/classes'
import { useTooltip } from '@/libraries/ui/hooks/useTooltip'

import { StrokeWidthIcon } from './icons'

export function StrokeWidthInput({ value, onChange, label }: { value: number, onChange: (value: number) => void, label: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const [tooltipProps, tooltipElement] = useTooltip(label)

  return <>
    <div {...tooltipProps} className={CssClass.inputBoxAppearance + ' rounded-full overflow-hidden flex items-center ps-2'}>
      <label htmlFor={id}>
        <StrokeWidthIcon />
      </label>
      <Button
        minimal
        onClick={() => { onChange(Math.max(0, value - 1)); inputRef.current?.focus() }}
        text="-"
      />
      <input
        ref={inputRef}
        id={id}
        type="number"
        aria-label={label}
        value={value}
        min={0}
        onChange={e => {
          const num = Number(e.target.value)
          onChange(isNaN(num) ? 0 : num)
        }}
        className={classNames(CssClass.inputAppearance, 'text-center p-1 field-sizing-content align-baseline hide-arrows')}
      />
      <Button
        minimal
        onClick={() => { onChange(value + 1); inputRef.current?.focus() }}
        text="+"
      />
    </div>
    {tooltipElement}
  </>
}
