import React, {useCallback} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import ReactTouchEvents from 'react-touch-events'

import {Markdown} from 'libraries/ui'
import {EditableDanceProperty} from 'components/EditableDanceProperty'
import {LoadingState} from 'components/LoadingState'
import {Slide as Slide2, SlideContainer, SlideNavigation, SlideNavigationList} from 'components/Slide'
import {useOnKeydown} from 'utils/useOnKeydown'

import {ProgramTitleSelector} from './ProgramTitleSelector'
import {t} from './strings'
import {Dance, EventProgram, Slide, startSlideId, useBallProgramSlides} from './useBallProgram'

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
  const slide = slides.find(s => s._id === currentSlideId) ?? slides[0]

  useOnKeydown({
    ArrowLeft: () => changeSlideId(slide.previous?._id ?? slide._id),
    ArrowRight: () => changeSlideId(slide.next?._id ?? slide._id),
    r: onRefetch
  })

  const onSwipe = useCallback((_, direction : 'left'|'right') => {
    changeSlideId(((direction === 'left' ? slide.next : slide.previous) ?? slide)._id)
  }, [slide, changeSlideId])

  return <ReactTouchEvents onSwipe={onSwipe} disableClick>
    <SlideContainer fullscreen slideStyleId={slide.slideStyleId} color="#000">
      <div className="controls">
        <ProgramTitleSelector value={slide?.parent?._id ?? slide._id} onChange={changeSlideId}
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
  const {isHeader, __typename, item, name, next, program, parent} = slide
  let teachedIn : Dance['teachedIn'] | undefined
  if (item?.__typename === 'Dance') {
    teachedIn = item.teachedIn
  }
  let navigation : SlideNavigation | undefined
  if (!isHeader && program) {
    navigation = {
      title: parent?.name ?? '',
      items: program
        .filter(item => item.showInLists)
        .map(item => ({
          title: item.name,
          url: item._id,
          current: item._id === slide._id,
          isPlaceholder: item.__typename === 'RequestedDance',
        })),
    }
  }

  return <Slide2
    title={name}
    type={__typename}
    footer={teachedIn &&
      <>{t`teachedInSet`} {teachedIn.map(w => w.name).join(', ')}</>
    }
    navigation={navigation}
    next={!isHeader && next ? {title: `${t('afterThis')}: ${next.name}`, url: next._id} : undefined}
  >
    <SlideContentView slide={slide} />
  </Slide2>
}

function SlideContentView({slide}: SlideProps) {
  switch(slide.__typename) {
    case 'Event':
    case 'DanceSet':
      return <SlideNavigationList items={(slide.program ?? [])
        .filter(item => item.showInLists)
        .map(item => ({title: item.name, isPlaceholder: item.__typename === 'RequestedDance', url: item._id}))} />
  }
  switch(slide.item?.__typename) {
    case 'Dance':
      return <EditableDanceProperty dance={slide.item} property="description" type="markdown" addText={t`addDescription`} />
    case 'RequestedDance':
      return null
    case 'EventProgram':
    case 'IntervalMusic':
      return <EventProgramDescription program={slide.item} />
    default:
      return null
  }
}

function EventProgramDescription({program}: {program: EventProgram | {description: string}}) {
  const {description} = program
  if (!description) return null

  return <Markdown className="slide-program-description-content">{description}</Markdown>
}
