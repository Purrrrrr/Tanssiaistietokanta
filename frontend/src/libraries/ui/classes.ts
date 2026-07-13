import { Color } from './types'

export const CssClass = {
  input: 'bp5-input bp5-input-box',
  inputElement: 'bp5-input',
  inputAppearance: 'bp5-input-appearance',
  inputBox: 'bp5-input-box',
  inputBoxAppearance: 'bp5-input-box-appearance',
  formGroupInline: 'formgroup-inline',
  formGroupInlineFill: 'formgroup-inline-fill',
}

export const ColorClass = {
  textMuted: 'text-muted',
  boxColors: {
    none: 'bg-neutral text-stone-700',
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    danger: ' bg-danger text-white',
    warning: ' bg-warning text-red-900',
  } satisfies Record<Color, string>,
  lightBoxColors: {
    none: 'bg-gray-100 text-stone-700',
    primary: 'bg-blue-50 text-blue-800 saturate-65',
    success: 'bg-green-50 text-lime-800',
    danger: 'bg-red-50 text-red-800',
    warning: 'bg-amber-100 bg-opacity-60 text-amber-800',
  } satisfies Record<Color, string>,
}
