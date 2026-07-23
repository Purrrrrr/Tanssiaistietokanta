import { CSSProperties, useId, useRef } from 'react'

import { Button } from './Button'
import { MenuButton } from './MenuButton'

interface ToolbarColorPickerProps {
  value: string
  onChange: (value: string) => void
  label: string
  type: 'fill' | 'stroke'
}

// Nice big set of presentable colors with good contrast and variety, but not too many to be overwhelming
const colorOptions = [
  // Grayscale
  '#000000', '#555555', '#AAAAAA', '#DDDDDD', '#EEEEEE', '#FFFFFF',
  // Light tones for the colors below
  '#FF9999', '#FFCC99', '#FFFF99', '#CCFF99', '#99FFCC', '#99E6FF', '#99B3FF', '#CC99FF', '#FF99CC',
  // Rose, orange, amber, lime, green, cyan, sky, blue, violet, fuchsia
  '#FF4D4D', '#FF944D', '#FFD24D', '#B6FF4D', '#4DFF88', '#4DD2FF', '#4DA6FF', '#944DFF', '#FF4DD2',
  // Darker tones for the above colors
  '#CC0000', '#CC7300', '#CC9A00', '#8ACC00', '#00CC66', '#00AACC', '#0073CC', '#7300CC', '#CC0099',
]

export function ColorPickerButton({ value, onChange, label, type }: ToolbarColorPickerProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const chosenColor = colorOptions.includes(value)
    ? value
    : value === 'transparent'
      ? 'transparent'
      : 'custom'
  console.log('ColorPickerButton', { value, chosenColor, type })
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
      <div className="grid sm:grid-cols-7 grid-cols-3 gap-1 p-1">
        <ColorButton
          color="transparent"
          chosenColor={chosenColor}
          onClick={() => onChange('transparent')}
        />
        {colorOptions.map(color => (
          <ColorButton
            key={color}
            color={(color)}
            chosenColor={chosenColor}
            onClick={() => onChange(color)}
          />
        ))}
        <ColorButton
          color="custom"
          chosenColor={chosenColor}
          onClick={() => input.current?.click()}
        />
      </div>
    </MenuButton>
  </>
}

function ColorButton({ color, onClick, chosenColor }: { color: string, chosenColor: string, onClick: () => void }) {
  return <button
    type="button"
    className={`size-6 rounded-sm border border-stone-400 hover:outline ${chosenColor === color ? 'outline-2! outline-offset-1! outline-blue-500!' : ''}`}
    style={colorStyle(color)}
    onClick={onClick}
  />
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
