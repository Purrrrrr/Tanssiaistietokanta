import { numberProp, showcase } from '../types'

import { AutosizedSection } from 'libraries/ui'

export const autosizedSectionShowcase = showcase({
  title: 'Autosized section',
  props: {
    lines: numberProp({ default: 1, min: 0 }),
    cols: numberProp({ default: 1, min: 0 }),
  },
  render: ({ cols, lines }) =>
    <AutosizedSection className="bg-gray-200 size-50">
      <div className="flex">
        {Array(cols).fill(0).map((_, i) =>
          <div key={i}>
            {Array(lines).fill(0).map((_, i) => <p key={i}>Lorem ipsum lorem ipsum</p>)}

          </div>,
        )}
      </div>
    </AutosizedSection>,
})
