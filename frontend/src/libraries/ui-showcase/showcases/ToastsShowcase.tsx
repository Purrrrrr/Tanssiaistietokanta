import { showcase } from '../types'

import { Button } from 'libraries/ui'
import { showToast } from 'libraries/ui/hooks'

import { colors } from '../utils'

export const toastsShowcase = showcase({
  title: 'Toasts',
  props: {},
  render: () => <div className="flex gap-2">
    {colors.map(color =>
      <Button key={color} color={color} onClick={() => showToast({ message: 'This is toast', color })}>Show toast</Button>,
    )}
  </div>,
})
