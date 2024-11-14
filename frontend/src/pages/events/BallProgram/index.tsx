import {useCallback, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useSwipeable} from 'react-swipeable'
import classNames from 'classnames'

import {Button, Markdown} from 'libraries/ui'
import { EventSlide } from 'components/EventSlide/EventSlide'
import { EventSlideProps } from 'components/EventSlide/types'
import { useEventSlides } from 'components/EventSlide/useEventSlides'
import {LoadingState} from 'components/LoadingState'
import {Slide, SlideContainer, SlideNavigationList} from 'components/Slide'
import {useOnKeydown} from 'utils/useOnKeydown'

import {ProgramTitleSelector} from './ProgramTitleSelector'
import {SlideEditor} from './SlideEditor'
import {Event, SlideContent, startSlideId, useBallProgramSlides} from './useBallProgram'

import './BallProgram.scss'

export default function BallProgram({eventId, eventVersionId}) {
  const [slides, {event, refetch, ...loadingState}] = useBallProgramSlides(eventId)
  const [isEditing, setEditing] = useState(false)
  const {'*': currentSlideId = startSlideId} = useParams()

  const slides2 = useEventSlides(event?.program)
  if (!slides || !event) return <LoadingState {...loadingState} refetch={refetch} />

  const slideIndex = (i => i >= 0 ? i : 0)(slides.findIndex(s => s.id === currentSlideId))
  const slide = slides2[slideIndex]

  return <div className={classNames('ball-program-container', {'is-editing': isEditing})}>
    <BallProgramView
      slides={slides}
      slides2={slides2}
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
  {slides: slides1, slides2, event, onRefetch, isEditing, onToggleEditing}: {
    slides: SlideContent[]
    slides2: EventSlideProps[]
    event: Event
    onRefetch: () => unknown
    onToggleEditing: () => unknown
    isEditing: boolean
  }
) {
  const {'*': currentSlideId = startSlideId} = useParams()
  const changeSlideId = useNavigate()
  const slideIndex = (i => i >= 0 ? i : 0)(slides2.findIndex(s => s.id === currentSlideId))
  const slide = slides2[slideIndex]

  const changeSlide = useCallback((indexDelta: number) => {
    const index = slideIndex + indexDelta
    const nextSlide = slides2[Math.min(Math.max(index, 0), slides2.length-1)]
    changeSlideId(nextSlide.id)
  }, [slides2, slideIndex, changeSlideId])

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
        program={slides1} />
      <Button minimal icon="edit" onClick={onToggleEditing}/>
    </div>
    <EventSlide {...slide} eventProgram={event.program}/>
  </SlideContainer>
}
