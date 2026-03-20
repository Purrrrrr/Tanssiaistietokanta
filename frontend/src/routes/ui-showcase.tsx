import { createFileRoute } from '@tanstack/react-router'

import UiShowcase from 'libraries/ui-showcase'

export const Route = createFileRoute('/ui-showcase')({
  component: UiShowcase,
})
