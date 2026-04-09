import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import classNames from 'classnames'

import { RequirePermissions, useRight } from 'libraries/access-control'
import { Button } from 'libraries/ui'
import { Cross, Edit } from 'libraries/ui/icons'
import { EventSlide, EventSlideProps, startSlideId, useEventSlides } from 'components/event/EventSlide'
import { LoadingState } from 'components/LoadingState'
import { SlideContainer, useSlideshowNavigation } from 'components/Slide'
import { useOnKeydown } from 'utils/useOnKeydown'

import { ProgramTitleSelector } from './-components/ProgramTitleSelector'
import { SlideEditor } from './-components/SlideEditor'
import { Event, useBallProgramQuery } from './-components/useBallProgramQuery'

import './BallProgram.scss'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/ball-program/{-$slideId}',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { eventId, eventVersionId } = Route.useParams()
  const { event, slides, refetch, loadingState } = useBallProgram(eventId, eventVersionId)

  const [isEditing, setEditing] = useState(false)
  const onToggleEditing = () => setEditing(e => !e && canEdit)
  const canEdit = useRight('events:modify', { entityId: eventId })

  const { slideId: currentSlideId = startSlideId } = useParams({ from: '/events/$eventId/{-$eventVersionId}/ball-program/{-$slideId}' })

  useOnKeydown({
    r: refetch as () => unknown,
    e: onToggleEditing,
  })

  if (!event) return <LoadingState {...loadingState} refetch={refetch} />

  const slideIndex = (i => i >= 0 ? i : 0)(slides.findIndex(s => s.id === currentSlideId))
  const slide = slides[slideIndex]

  return <div className={classNames('ball-program-container', { 'is-editing': isEditing })}>
    <BallProgramSlideView
      slides={slides}
      currentSlide={slide}
      event={event}
      isEditing={isEditing}
      onToggleEditing={onToggleEditing}
    />
    <RequirePermissions requireRight="events:modify" entityId={eventId}>
      <div className="editor">
        <Button className="close" minimal icon={<Cross />} onClick={() => setEditing(false)} />
        <SlideEditor slide={slide} eventId={eventId} eventVersionId={eventVersionId} eventProgram={event?.program} />
      </div>
    </RequirePermissions>
  </div>
}

function useBallProgram(eventId: string, eventVersionId?: string | null) {
  const { data, refetch, ...loadingState } = useBallProgramQuery({ eventId, eventVersionId })
  const event = data?.event
  const slides = useEventSlides(event?.program)

  return { event, slides, loadingState, refetch }
}

export function BallProgramSlideView(
  { slides, currentSlide: slide, event, isEditing, onToggleEditing }: {
    slides: EventSlideProps[]
    currentSlide: EventSlideProps
    event: Event
    onToggleEditing: () => unknown
    isEditing: boolean
  },
) {
  const navigate = useNavigate()
  const goToSlide = (slideId: string) => navigate({
    to: '/events/$eventId/{-$eventVersionId}/ball-program/{-$slideId}',
    params: { eventId: event._id, eventVersionId: event._versionId ?? undefined, slideId },
  })
  const { swipeHandlers } = useSlideshowNavigation({
    slides, currentSlideId: slide.id, onChangeSlide: slide => goToSlide(slide.id),
  })
  const canEdit = useRight('events:modify', { entityId: event._id })

  return <SlideContainer fullscreen={!isEditing || !canEdit} {...swipeHandlers}>
    <div className="controls">
      <ProgramTitleSelector value={slide.parentId ?? slide.id} onChange={id => goToSlide(id)}
        program={event.program} />
      <Button requireRight="events:modify" entityId={event._id} minimal icon={<Edit />} onClick={onToggleEditing} />
    </div>
    <EventSlide {...slide} eventProgram={event.program} />
  </SlideContainer>
}
