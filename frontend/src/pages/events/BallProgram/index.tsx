import {useCallback, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useSwipeable} from 'react-swipeable'
import classNames from 'classnames'

import {Button} from 'libraries/ui'
import { EventSlide, EventSlideProps, startSlideId, useEventSlides } from 'components/event/EventSlide'
import {LoadingState} from 'components/LoadingState'
import {SlideContainer} from 'components/Slide'
import {useOnKeydown} from 'utils/useOnKeydown'

import {ProgramTitleSelector} from './ProgramTitleSelector'
import {SlideEditor} from './SlideEditor'
import {Event, useBallProgramQuery} from './useBallProgramQuery'

import './BallProgram.scss'

export default function BallProgram({eventId, eventVersionId}) {
  const {data, refetch, ...loadingState} = useBallProgramQuery({eventId})
  const event = data?.event
  const [isEditing, setEditing] = useState(false)
  const {'*': currentSlideId = startSlideId} = useParams()

  const slides = useEventSlides(event?.program)
  if (!slides.length || !event) return <LoadingState {...loadingState} refetch={refetch} />

  const slideIndex = (i => i >= 0 ? i : 0)(slides.findIndex(s => s.id === currentSlideId))
  const slide = slides[slideIndex]

  return <div className={classNames('ball-program-container', {'is-editing': isEditing})}>
    <BallProgramView
      slides={slides}
      event={event}
      onRefetch={refetch}
      isEditing={isEditing}
      onToggleEditing={() => setEditing(e => !e)}
    />
    <div className="editor">
      <Button className="close" minimal icon="cross" onClick={() => setEditing(false)}/>
      <SlideEditor slide={slide} eventId={eventId} eventVersionId={eventVersionId} eventProgram={event?.program} />
    </div>
  </div>
}

function BallProgramView(
  {slides, event, onRefetch, isEditing, onToggleEditing}: {
    slides: EventSlideProps[]
    event: Event
    onRefetch: () => unknown
    onToggleEditing: () => unknown
    isEditing: boolean
  }
) {
  const {'*': currentSlideId = startSlideId} = useParams()
  const changeSlideId = useNavigate()
  const slideIndex = (i => i >= 0 ? i : 0)(slides.findIndex(s => s.id === currentSlideId))
  const slide = slides[slideIndex]

  const changeSlide = useCallback((indexDelta: number) => {
    const index = slideIndex + indexDelta
    const nextSlide = slides[Math.min(Math.max(index, 0), slides.length-1)]
    changeSlideId(nextSlide.id)
  }, [slides, slideIndex, changeSlideId])

  useOnKeydown({
    ArrowLeft: () => changeSlide(-1),
    ArrowRight: () => changeSlide(1),
    r: onRefetch,
    e: onToggleEditing,
  })

  const handlers = useSwipeable({
    onSwipedLeft: () => changeSlide(1),
    onSwipedRight: () => changeSlide(-1),
    onSwipedUp: () => changeSlideId(slide.parentId ?? slide.id),
  })

  return <SlideContainer fullscreen={!isEditing} {...handlers}>
    <div className="controls">
      <ProgramTitleSelector value={slide.parentId ?? slide.id} onChange={changeSlideId}
        program={event.program} />
      <Button minimal icon="edit" onClick={onToggleEditing}/>
    </div>
    <EventSlide {...slide} eventProgram={event.program}/>
  </SlideContainer>
}
