import React, {useCallback} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import ReactTouchEvents from 'react-touch-events'
import classnames from 'classnames'
import Markdown from 'markdown-to-jsx'

import {AutosizedSection} from 'libraries/ui'
import {EditableDanceProperty} from 'components/EditableDanceProperty'
import {LoadingState} from 'components/LoadingState'
import {useOnKeydown} from 'utils/useOnKeydown'

import {ProgramTitleSelector} from './ProgramTitleSelector'
import {t} from './strings'
import {Slide, startSlideId, useBallProgramSlides} from './useBallProgram'

import './BallProgram.sass'

export default function BallProgram({eventId}) {
  const [slides, {refetch, ...loadingState}] = useBallProgramSlides(eventId)

  if (!slides) return <LoadingState {...loadingState} refetch={refetch} />

  return <BallProgramView slides={slides} onRefetch={refetch} />
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
    <div className={classnames('slideshow', slide.slideStyleId && `slide-style-${slide.slideStyleId}`)}>
      <div className="controls">
        <ProgramTitleSelector value={slide._id} onChange={changeSlideId}
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
  switch(slide.__typename) {
    case 'Dance':
      return <DanceSlide slide={slide} />
    case 'RequestedDance':
      return <RequestedDanceSlide next={slide.next} />
    case 'EventProgram':
      return <EventProgramSlide slide={slide} />
    case 'DanceSet':
    case 'Event':
    default:
      return <HeaderSlide slide={slide} />
  }
}
function HeaderSlide({slide}: SlideProps) {
  const changeSlideId = useNavigate()
  const {name, program = []} = slide
  return <SimpleSlide title={name} next={null} >
    <AutosizedSection className="slide-main-content">
      <ul className="slide-header-list">
        {program
          .filter(t => t.__typename !== 'EventProgram' || t.showInLists)
          .map(({_id, name}) =>
            <li onClick={() => changeSlideId(_id)} key={_id}>
              {name ?? <RequestedDancePlaceholder />}
            </li>
          )
        }
      </ul>
    </AutosizedSection>
  </SimpleSlide>
}

function EventProgramSlide({slide}: SlideProps) {
  const {name, next, item} = slide
  if (item?.__typename !== 'EventProgram') return null
  const {description} = item

  return <SimpleSlide title={name} next={next} >
    {description && <AutosizedSection className="slide-main-content slide-program-description">
      <Markdown className="slide-program-description-content">{description}</Markdown>
    </AutosizedSection>}
  </SimpleSlide>
}

const RequestedDancePlaceholder = () => <span className="requested-dance-placeholder"><t.span>requestedDance</t.span></span>

function DanceSlide({slide}: SlideProps) {
  const {next, name, item} = slide
  if (item?.__typename !== 'Dance') return null
  const {teachedIn} = item

  return <SimpleSlide title={name} next={next}>
    <AutosizedSection className="slide-main-content slide-program-description">
      <EditableDanceProperty dance={item} property="description" type="markdown" addText={t`addDescription`} />
    </AutosizedSection>
    {teachedIn.length > 0 &&
      <AutosizedSection className="slide-teached-in">{t`teachedInSet`} {teachedIn.map(w => w.name).join(', ')}</AutosizedSection>
    }
  </SimpleSlide>
}

function RequestedDanceSlide({next}) {
  return <SimpleSlide title={t`requestedDance`} next={next}>
  </SimpleSlide>
}

function SimpleSlide({title, next, children}) {
  return <section className="slide">
    <h1 className="slide-title">{title}</h1>
    {children}
    {next && <NextTrackSection next={next} />}
  </section>
}

function NextTrackSection({next}) {
  const changeSlideId = useNavigate()
  return <section className="slide-next-track" onClick={() => changeSlideId(next._id)}>
    <h1>{t`afterThis`}:{' '}{next.name}</h1>
  </section>
}
