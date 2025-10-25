import {useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import { Cross, Edit } from '@blueprintjs/icons'
import classNames from 'classnames'

import {Button} from 'libraries/ui'
import { EventSlide, EventSlideProps, startSlideId, useEventSlides } from 'components/event/EventSlide'
import {LoadingState} from 'components/LoadingState'
import {SlideContainer, useSlideshowNavigation} from 'components/Slide'
import {useOnKeydown} from 'utils/useOnKeydown'

import {ProgramTitleSelector} from './ProgramTitleSelector'
import {SlideEditor} from './SlideEditor'
import {Event, useBallProgramQuery} from './useBallProgramQuery'

import './BallProgram.scss'

export default function BallProgram({eventId, eventVersionId}) {
  const { event, slides, refetch, loadingState } = useBallProgram(eventId, eventVersionId)

  const [isEditing, setEditing] = useState(false)
  const onToggleEditing = () => setEditing(e => !e)

  const {slideId: currentSlideId = startSlideId} = useParams()

  useOnKeydown({
    r: refetch as () => unknown,
    e: onToggleEditing,
  })

  if (!event) return <LoadingState {...loadingState} refetch={refetch} />

  const slideIndex = (i => i >= 0 ? i : 0)(slides.findIndex(s => s.id === currentSlideId))
  const slide = slides[slideIndex]

  return <div className={classNames('ball-program-container', {'is-editing': isEditing})}>
    <BallProgramView
      slides={slides}
      currentSlide={slide}
      event={event}
      isEditing={isEditing}
      onToggleEditing={() => setEditing(e => !e)}
    />
    <div className="editor">
      <Button className="close" minimal icon={<Cross />} onClick={() => setEditing(false)}/>
      <SlideEditor slide={slide} eventId={eventId} eventVersionId={eventVersionId} eventProgram={event?.program} />
    </div>
  </div>
}

function BallProgramView(
  {slides, currentSlide: slide, event, isEditing, onToggleEditing}: {
    slides: EventSlideProps[]
    currentSlide: EventSlideProps
    event: Event
    onToggleEditing: () => unknown
    isEditing: boolean
  }
) {
  const navigate = useNavigate()
  const baseUrl = event._versionId
    ? `/events/${event._id}/version/${event._versionId}/ball-program/`
    : `/events/${event._id}/ball-program/`
  const { swipeHandlers } = useSlideshowNavigation({
    slides, currentSlideId: slide.id, onChangeSlide: slide => navigate(baseUrl + slide.id),
  })

  return <SlideContainer fullscreen={!isEditing} {...swipeHandlers}>
    <div className="controls">
      <ProgramTitleSelector value={slide.parentId ?? slide.id} onChange={id => navigate(baseUrl + id)}
        program={event.program} />
      <Button minimal icon={<Edit />} onClick={onToggleEditing}/>
    </div>
    <EventSlide {...slide} eventProgram={event.program}/>
  </SlideContainer>
}

function useBallProgram(eventId: string, _eventVersionId?: string | null) {
  const {data, refetch, ...loadingState} = useBallProgramQuery({eventId})
  const event = data?.event
  const slides = useEventSlides(event?.program)

  return { event, slides, loadingState, refetch }

}
