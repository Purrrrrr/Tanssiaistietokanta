import React, {useCallback} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import ReactTouchEvents from 'react-touch-events'

import {Markdown} from 'libraries/ui'
import {EditableDanceProperty} from 'components/EditableDanceProperty'
import {LoadingState} from 'components/LoadingState'
import {Slide, SlideContainer, SlideNavigationList} from 'components/Slide'
import {useOnKeydown} from 'utils/useOnKeydown'

import {ProgramTitleSelector} from './ProgramTitleSelector'
import {t} from './strings'
import {SlideContent, startSlideId, useBallProgramSlides} from './useBallProgram'

import './BallProgram.scss'

export default function BallProgram({eventId}) {
  const [slides, {refetch, ...loadingState}] = useBallProgramSlides(eventId)

  if (!slides) return <LoadingState {...loadingState} refetch={refetch} />

  return <BallProgramView slides={slides} onRefetch={refetch} />
}

function BallProgramView({slides, onRefetch}: {slides: SlideContent[], onRefetch: () => unknown}) {
  const {'*': currentSlideId = startSlideId} = useParams()
  const changeSlideId = useNavigate()
  const slideIndex = (i => i >= 0 ? i : 0)(slides.findIndex(s => s.id === currentSlideId))

  const onSwipe = useCallback((_, direction : 'left'|'right') => {
    const index = slideIndex + (direction === 'left' ? -1 : 1)
    const nextSlide = slides[Math.min(Math.max(index, 0), slides.length-1)]
    changeSlideId(nextSlide.id)
  }, [slides, slideIndex, changeSlideId])

  useOnKeydown({
    ArrowLeft: () => onSwipe(null, 'left'),
    ArrowRight: () => onSwipe(null, 'right'),
    r: onRefetch
  })

  const {parentId, slideContent, ...slide} = slides[slideIndex]

  return <ReactTouchEvents onSwipe={onSwipe} disableClick>
    <SlideContainer fullscreen color="#000">
      <div className="controls">
        <ProgramTitleSelector value={parentId ?? slide.id} onChange={changeSlideId}
          program={slides} />
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
      return <EditableDanceProperty dance={slideContent.value} property="description" type="markdown" addText={t`addDescription`} />
  }
  return null
}
