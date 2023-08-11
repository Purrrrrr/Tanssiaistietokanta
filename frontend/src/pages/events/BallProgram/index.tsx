import React, {useCallback, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import ReactTouchEvents from 'react-touch-events'
import classNames from 'classnames'

import {Button, Card, Markdown} from 'libraries/ui'
import {EditableDanceProperty} from 'components/EditableDanceProperty'
import {LoadingState} from 'components/LoadingState'
import {Slide, SlideContainer, SlideNavigationList} from 'components/Slide'
import {useOnKeydown} from 'utils/useOnKeydown'

import {ProgramTitleSelector} from './ProgramTitleSelector'
import {SlideEditor} from './SlideEditor'
import {t} from './strings'
import {SlideContent, startSlideId, useBallProgramSlides} from './useBallProgram'

import './BallProgram.scss'

export default function BallProgram({eventId}) {
  const [slides, {refetch, ...loadingState}] = useBallProgramSlides(eventId)
  const [isEditing, setEditing] = useState(false)
  const {'*': currentSlideId = startSlideId} = useParams()

  if (!slides) return <LoadingState {...loadingState} refetch={refetch} />

  const slideIndex = (i => i >= 0 ? i : 0)(slides.findIndex(s => s.id === currentSlideId))
  const slide = slides[slideIndex]

  return <div className={classNames('ball-program-container', {'is-editing': isEditing})}>
    <BallProgramView slides={slides} onRefetch={refetch} isEditing={isEditing} onToggleEditing={() => setEditing(e => !e)}/>
    <Card className="editor">
      <Button className="close" minimal icon="cross" onClick={() => setEditing(false)}/>
      <SlideEditor slide={slide} />
    </Card>
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

  const onSwipe = useCallback((_: unknown, direction : 'left'|'right') => {
    const index = slideIndex + (direction === 'left' ? -1 : 1)
    const nextSlide = slides[Math.min(Math.max(index, 0), slides.length-1)]
    changeSlideId(nextSlide.id)
  }, [slides, slideIndex, changeSlideId])

  useOnKeydown({
    ArrowLeft: () => onSwipe(null, 'left'),
    ArrowRight: () => onSwipe(null, 'right'),
    r: onRefetch,
    e: onToggleEditing,
  })

  const {parentId, slideContent, ...slide} = slides[slideIndex]

  return <ReactTouchEvents onSwipe={onSwipe} disableClick>
    <SlideContainer fullscreen={!isEditing}>
      <div className="controls">
        <ProgramTitleSelector value={parentId ?? slide.id} onChange={changeSlideId}
          program={slides} />
        <Button minimal icon="edit" onClick={onToggleEditing}/>
      </div>
      <Slide {...slide}>
        <SlideContentView slideContent={slideContent} />
      </Slide>
    </SlideContainer>
  </ReactTouchEvents>
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
