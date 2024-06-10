import {useCallback, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useSwipeable} from 'react-swipeable'
import classNames from 'classnames'

import {Button, Markdown} from 'libraries/ui'
import {LoadingState} from 'components/LoadingState'
import {Slide, SlideContainer, SlideNavigationList} from 'components/Slide'
import {useOnKeydown} from 'utils/useOnKeydown'

import {ProgramTitleSelector} from './ProgramTitleSelector'
import {SlideEditor} from './SlideEditor'
import {SlideContent, startSlideId, useBallProgramSlides} from './useBallProgram'

import './BallProgram.scss'

export default function BallProgram({eventId}) {
  const [slides, {event, refetch, ...loadingState}] = useBallProgramSlides(eventId)
  const [isEditing, setEditing] = useState(false)
  const {'*': currentSlideId = startSlideId} = useParams()

  if (!slides || !event) return <LoadingState {...loadingState} refetch={refetch} />

  const slideIndex = (i => i >= 0 ? i : 0)(slides.findIndex(s => s.id === currentSlideId))
  const slide = slides[slideIndex]

  return <div className={classNames('ball-program-container', {'is-editing': isEditing})}>
    <BallProgramView slides={slides} onRefetch={refetch} isEditing={isEditing} onToggleEditing={() => setEditing(e => !e)}/>
    <div className="editor">
      <Button className="close" minimal icon="cross" onClick={() => setEditing(false)}/>
      <SlideEditor slide={slide} eventId={eventId} eventProgram={event?.program} />
    </div>
  </div>
}

function BallProgramView(
  {slides, onRefetch, isEditing, onToggleEditing}: {
    slides: SlideContent[]
    onRefetch: () => unknown
    onToggleEditing: () => unknown
    isEditing: boolean
  }
) {
  const {'*': currentSlideId = startSlideId} = useParams()
  const changeSlideId = useNavigate()
  const slideIndex = (i => i >= 0 ? i : 0)(slides.findIndex(s => s.id === currentSlideId))

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
    onSwipedUp: () => changeSlideId(parent?.id ?? slide.id),
  })

  const {parent, slideContent, ...slide} = slides[slideIndex]

  return <SlideContainer fullscreen={!isEditing} {...handlers}>
    <div className="controls">
      <ProgramTitleSelector value={parent?.id ?? slide.id} onChange={changeSlideId}
        program={slides} />
      <Button minimal icon="edit" onClick={onToggleEditing}/>
    </div>
    <Slide {...slide}>
      <SlideContentView slideContent={slideContent} />
    </Slide>
  </SlideContainer>
}

function SlideContentView({slideContent}: Pick<SlideContent, 'slideContent'>) {
  switch (slideContent?.type) {
    case 'navigation':
      return <SlideNavigationList items={slideContent.value} />
    case 'text':
      return <Markdown className="slide-program-description-content">{slideContent.value}</Markdown>
    case 'dance':
      return <Markdown className="slide-program-description-content">{slideContent.value.description ?? ''}</Markdown>
  }
  return null
}
