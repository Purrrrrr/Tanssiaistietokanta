import { NodeAlignment } from '../plugins/nodes/types'

export function alignClassname(align: NodeAlignment): string {
  switch (align) {
    case 'left':
      return 'text-left'
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    case 'fullWidth':
      return '*:w-full'
    case 'floatLeft':
      return 'float-left paragraph-margin mr-2'
    case 'floatRight':
      return 'float-right paragraph-margin ml-2'
  }
}
