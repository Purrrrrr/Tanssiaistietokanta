import { createFileRoute } from '@tanstack/react-router'

import { MainEditor } from 'components/event/EventProgramEditor/'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/program/main/',
)({
  component: MainEditor,
})
