import { createFileRoute } from '@tanstack/react-router'

import { SlideshowEditor } from 'components/event/EventProgramEditor/SlideshowEditor'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/program/slides/{-$slideId}',
)({
  component: SlideshowEditor,
})
