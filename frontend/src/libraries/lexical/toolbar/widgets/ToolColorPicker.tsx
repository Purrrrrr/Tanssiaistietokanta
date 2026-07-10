import { CSSProperties, useId, useRef } from 'react'

import { Button, MenuButton } from 'libraries/ui'

interface ToolbarColorPickerProps {
  value: string
  onChange: (value: string) => void
  label: string
  type: 'fill' | 'stroke'
}

// Nice big set of presentable colors with good contrast and variety, but not too many to be overwhelming
const colorOptions = [
  // Grayscale
  '#000000', '#555555', '#AAAAAA', '#FFFFFF',
  // Rose, orange, amber, lime, green, cyan, sky, blue, violet, fuchsia
  '#FF4D4D', '#FF944D', '#FFD24D', '#B6FF4D', '#4DFF88', '#4DD2FF', '#4DA6FF', '#944DFF', '#FF4DD2',
  // Darker tones for the above colors
  '#CC0000', '#CC7300', '#CC9A00', '#8ACC00', '#00CC66', '#00AACC', '#0073CC', '#7300CC', '#CC0099',
]

export function ToolbarColorPicker({ value, onChange, label, type }: ToolbarColorPickerProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  return <>
    <input type="color" ref={input} value={value} className="hidden" onChange={(e) => onChange(e.target.value)} />
    <MenuButton buttonRenderer={props =>
      <Button
        id={id}
        minimal
        {...props}
        paddingClass="p-2 -mx-1"
        tooltip={label}
      >
        <span className="size-4 rounded-sm border border-stone-400" style={colorStyle(value, type === 'stroke')} />
      </Button>
    }>
      <div className="grid sm:grid-cols-6 grid-cols-3 gap-1 p-1">
        <button
          className="size-6 rounded-sm border border-stone-400 hover:outline"
          style={colorStyle('transparent')}
          onClick={() => onChange('transparent')}
        />
        <button
          className="size-6 rounded-sm border border-stone-400 hover:outline"
          style={colorStyle('custom')}
          onClick={() => input.current?.click()}
        />
        {colorOptions.map(color => (
          <button
            key={color}
            className="size-6 rounded-sm border border-stone-400 hover:outline"
            style={colorStyle(color)}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </MenuButton>
  </>
}

function colorStyle(color: string, stroke = false): CSSProperties {
  const prop = stroke ? 'borderColor' : 'background'
  if (color === 'custom') {
    return {
      [prop]: 'conic-gradient(in hsl longer hue from 45deg at center, red 0deg 360deg)',
    }
  }
  if (color === 'transparent') {
    return {
      [prop]: 'repeating-conic-gradient(#808080 0 25%, #0000 0 50%) 50% / 18px 18px',
    }
  }
  return {
    [prop]: color,
    borderWidth: stroke ? '3px' : undefined,
    boxSizing: 'border-box',
  }
}
