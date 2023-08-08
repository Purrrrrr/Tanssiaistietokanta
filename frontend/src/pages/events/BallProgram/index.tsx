import React, {useCallback} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import ReactTouchEvents from 'react-touch-events'
import classnames from 'classnames'

import {AutosizedSection, Markdown} from 'libraries/ui'
import {EditableDanceProperty} from 'components/EditableDanceProperty'
import {LoadingState} from 'components/LoadingState'
import {useOnKeydown} from 'utils/useOnKeydown'

import {ProgramTitleSelector} from './ProgramTitleSelector'
import {t} from './strings'
import {Dance, EventProgram, Slide, SlideContent, startSlideId, useBallProgramSlides} from './useBallProgram'

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
    <div className={classnames('slide-container', slide.slideStyleId && `slide-style-${slide.slideStyleId}`)}>
      <div className="controls">
        <ProgramTitleSelector value={slide?.parent?._id ?? slide._id} onChange={changeSlideId}
          program={slides} />
      </div>
      <SlideView slide={slide} />
    </div>
  </ReactTouchEvents>
}

interface SlideProps {
  slide: Slide
}

function SlideView({slide}: SlideProps) {
  const {isHeader, __typename, name, next, program, parent} = slide
  return <section className={'slide slide-type-'+__typename}>
    <h1 className="slide-title">{name}</h1>
    <section className="slide-main-content">
      <SlideContentView slide={slide} />
    </section>
    {!isHeader && next && <NextTrackSection next={next} />}
    {!isHeader && program &&
      <>
        <h2 className="slide-navigation-title">{parent?.name}</h2>
        <AutosizedSection className="slide-navigation">
          <ProgramList program={program} currentSlide={slide} />
        </AutosizedSection>
      </>
    }
  </section>
}

function NextTrackSection({next}) {
  const changeSlideId = useNavigate()

  return <section className="slide-next-track" onClick={() => changeSlideId(next._id)}>
    {t`afterThis`}:{' '}{next.name}
  </section>
}

function SlideContentView({slide}: SlideProps) {
  switch(slide.__typename) {
    case 'Event':
    case 'DanceSet':
      return <AutosizedSection>
        <ProgramList program={slide.program ?? []} />
      </AutosizedSection>
  }
  switch(slide.item?.__typename) {
    case 'Dance':
      return <DanceDescription dance={slide.item} />
    case 'RequestedDance':
      return null
    case 'EventProgram':
    case 'IntervalMusic':
      return <EventProgramDescription program={slide.item} />
    default:
      return null
  }
}

function ProgramList({program, currentSlide}: {program: SlideContent[], currentSlide?: Slide}) {
  const changeSlideId = useNavigate()
  return <ul className="slide-program-list">
    {program
      .filter(t => t.showInLists)
      .map(({__typename, _id, name}) =>
        <li className={_id === currentSlide?._id ? 'current' : ''} onClick={() => changeSlideId(_id)} key={_id}>
          {__typename === 'RequestedDance' ? <RequestedDancePlaceholder /> : name}
        </li>
      )
    }
  </ul>
}

const RequestedDancePlaceholder = () => <span className="requested-dance-placeholder"><t.span>requestedDance</t.span></span>

function EventProgramDescription({program}: {program: EventProgram | {description: string}}) {
  const {description} = program

  return <>
    {description && <AutosizedSection className="slide-program-description">
      <Markdown className="slide-program-description-content">{description}</Markdown>
    </AutosizedSection>}
  </>
}

function DanceDescription({dance}: {dance: Dance}) {
  const {teachedIn} = dance

  return <>
    <AutosizedSection className="slide-program-description">
      <EditableDanceProperty dance={dance} property="description" type="markdown" addText={t`addDescription`} />
    </AutosizedSection>
    {teachedIn.length > 0 &&
      <AutosizedSection className="slide-teached-in">{t`teachedInSet`} {teachedIn.map(w => w.name).join(', ')}</AutosizedSection>
    }
  </>
}
