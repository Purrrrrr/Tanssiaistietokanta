import { showcase } from '../types'

import { RegularLink } from 'libraries/ui'

export function LinkShowcase() {
  return <RegularLink href="#">Link</RegularLink>
}

LinkShowcase.showCase = showcase({
  title: 'Link',
  props: {},
  render: props => <LinkShowcase {...props} />,
})
