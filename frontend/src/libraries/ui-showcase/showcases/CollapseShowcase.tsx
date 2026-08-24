import { booleanProp, showcase } from '../types'

import { Collapse } from 'libraries/ui'

export const collapseShowcase = showcase({
  title: 'Collapse',
  props: {
    isOpen: booleanProp(),
    keepChildrenMounted: booleanProp(),
  },
  render: ({ isOpen, keepChildrenMounted }) =>
    <Collapse isOpen={isOpen} keepChildrenMounted={keepChildrenMounted}>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </Collapse>,
})
