import { Color } from './types'

export const CssClass = {
  input: 'bp5-input',
  inputGroup: 'bp5-input-group',
  inputAction: 'bp5-input-action',
  inputFill: 'bp5-fill',
  formGroupInline: 'formgroup-inline',
  formGroupInlineFill: 'formgroup-inline-fill',
}

export const ColorClass = {
  textMuted: 'text-muted',
  boxColors: {
    none: 'bg-stone-100 text-stone-700',
    primary: 'bg-blue-600 text-white saturate-65',
    success: 'bg-lime-700 text-white',
    danger: ' bg-orange-700 text-white',
    warning: ' bg-amber-400',
  } satisfies Record<Color, string>,
  lightBoxColors: {
    none: 'bg-gray-100 text-stone-700',
    primary: 'bg-blue-50 text-blue-800 saturate-65',
    success: 'bg-green-50 text-lime-800',
    danger: ' bg-red-50 text-red-800',
    warning: ' bg-amber-100 text-amber-800',
  } satisfies Record<Color, string>,
}
