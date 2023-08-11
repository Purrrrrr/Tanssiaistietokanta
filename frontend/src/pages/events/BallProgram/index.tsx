import React, {useCallback} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import ReactTouchEvents from 'react-touch-events'

import {Markdown} from 'libraries/ui'
import {EditableDanceProperty} from 'components/EditableDanceProperty'
import {LoadingState} from 'components/LoadingState'
import {Slide as Slide2, SlideContainer, SlideNavigationList} from 'components/Slide'
import {useOnKeydown} from 'utils/useOnKeydown'

import {ProgramTitleSelector} from './ProgramTitleSelector'
import {t} from './strings'
import {Slide, startSlideId, useBallProgramSlides} from './useBallProgram'

import './BallProgram.scss'

export default function BallProgram({eventId}) {
  const [slides, {refetch, ...loadingState}] = useBallProgramSlides(eventId)

  if (!slides) return <LoadingState {...loadingState} refetch={refetch} />

  return <div className="slide-backdrop full">
    <BallProgramView slides={slides} onRefetch={refetch} />
  </div>
}

function BallProgramView({slides, onRefetch}: {slides: Slide[], onRefetch: () => unknown}) {
  const {'*': currentSlideId = startSlideId} = useParams()
  const changeSlideId = useNavigate()
  const slide = slides.find(s => s.id === currentSlideId) ?? slides[0]

  useOnKeydown({
    ArrowLeft: () => changeSlideId(slide.previousId ?? slide.id),
    ArrowRight: () => changeSlideId(slide.nextId ?? slide.id),
    r: onRefetch
  })

  const onSwipe = useCallback((_, direction : 'left'|'right') => {
    changeSlideId(((direction === 'left' ? slide.nextId : slide.previousId) ?? slide.id))
  }, [slide, changeSlideId])

  return <ReactTouchEvents onSwipe={onSwipe} disableClick>
    <SlideContainer fullscreen color="#000">
      <div className="controls">
        <ProgramTitleSelector value={slide.parentId ?? slide.id} onChange={changeSlideId}
          program={slides} />
      </div>
      <SlideView slide={slide} />
    </SlideContainer>
  </ReactTouchEvents>
}

interface SlideProps {
  slide: Slide
}

function SlideView({slide}: SlideProps) {
  return <Slide2 {...slide.slide} slideStyleId={slide.slideStyleId} >
    <SlideContentView slide={slide} />
  </Slide2>
}

function SlideContentView({slide}: SlideProps) {
  switch (slide.slideContent?.type) {
    case 'navigation':
      return <SlideNavigationList items={slide.slideContent.value} />
    case 'text':
      return <Markdown className="slide-program-description-content">{slide.slideContent.value}</Markdown>
    case 'dance':
      return <EditableDanceProperty dance={slide.slideContent.value} property="description" type="markdown" addText={t`addDescription`} />
  }
  return null
}
