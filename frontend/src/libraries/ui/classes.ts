import {
  Classes,
} from '@blueprintjs/core'

import { Color } from './types'

export const CssClass = {
  input: Classes.INPUT,
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
    none: 'bg-white text-stone-700',
    primary: 'bg-blue-200 text-white saturate-65',
    success: 'bg-lime-200 text-white',
    danger: ' bg-orange-200 text-white',
    warning: ' bg-amber-100',
  } satisfies Record<Color, string>,
}
