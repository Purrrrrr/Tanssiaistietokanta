import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dances')({
  staticData: {
    breadcrumb: 'breadcrumbs.dances',
  },
})
