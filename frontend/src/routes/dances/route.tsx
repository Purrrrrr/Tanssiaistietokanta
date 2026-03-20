import { createFileRoute, Outlet } from '@tanstack/react-router'

import { Breadcrumb } from 'libraries/ui'
import { anyCategory } from 'components/dance/DanceCategorySelector'
import { useTranslation } from 'i18n'

export const Route = createFileRoute('/dances')({
  component: RouteComponent,
})

function RouteComponent() {
  return <>
    <Breadcrumb
      to={Route.to}
      search={{ search: '', category: anyCategory }}
      text={useTranslation('breadcrumbs.dances')}
    />
    <Outlet />
  </>
}
