import { showcase } from '../types'

import { Breadcrumb, BreadcrumbsContainer } from 'libraries/ui'

function BreadcrumbsShowcase() {
  return <BreadcrumbsContainer label="Example breadcrumbs">
    <Breadcrumb to="/" text="Home" />
    <Breadcrumb to="/dances" text="Dances" />
    <Breadcrumb to="/dances/$danceId" params={{ danceId: '1' }} text="Example dance" />
  </BreadcrumbsContainer>
}

BreadcrumbsShowcase.showCase = showcase({
  title: 'Breadcrumbs',
  props: {},
  render: () => <BreadcrumbsShowcase />,
})

export { BreadcrumbsShowcase }
