import React, {useCallback, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import ReactTouchEvents from 'react-touch-events'

import {Button, Card, Markdown} from 'libraries/ui'
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
  const [isEditing, setEditing] = useState(true)

  if (!slides) return <LoadingState {...loadingState} refetch={refetch} />

  const view = <BallProgramView slides={slides} onRefetch={refetch} isEditing={isEditing} onEdit={() => setEditing(e => !e)}/>
  if (!isEditing) return view

  return <div className="ball-program-container">
    {view}
    <div className="editor">
      <h2>GREAT EDITOR</h2>
      <input />
    </div>
  </div>
}

function BallProgramView(
  {slides, onRefetch, isEditing, onEdit}: {
    slides: SlideContent[]
    onRefetch: () => unknown
    onEdit: () => unknown
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
    r: onRefetch
  })

  const {parentId, slideContent, ...slide} = slides[slideIndex]

  return <ReactTouchEvents onSwipe={onSwipe} disableClick>
    <SlideContainer fullscreen={!isEditing} color="#000">
      <div className="controls">
        <ProgramTitleSelector value={parentId ?? slide.id} onChange={changeSlideId}
          program={slides} />
        <Button minimal icon="cog" onClick={onEdit}/>
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
