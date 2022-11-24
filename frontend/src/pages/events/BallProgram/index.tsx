import React, {useCallback, useState} from 'react'
import ReactTouchEvents from 'react-touch-events'
import classnames from 'classnames'
import Markdown from 'markdown-to-jsx'

import {AutosizedSection} from 'libraries/ui'
import {EditableDanceProperty} from 'components/EditableDanceProperty'
import {LoadingState} from 'components/LoadingState'
import {useOnKeydown} from 'utils/useOnKeydown'

import {ProgramTitleSelector} from './ProgramTitleSelector'
import {t} from './strings'
import {useBallProgramSlides} from './useBallProgram'

import './BallProgram.sass'

export default function BallProgram({eventId}) {
  const [slides, {refetch, ...loadingState}] = useBallProgramSlides(eventId)
  if (!slides) return <LoadingState {...loadingState} refetch={refetch} />

  return <BallProgramView slides={slides} onRefetch={refetch} />
}

function BallProgramView({slides, onRefetch}) {
  const [currentSlide, onChangeSlide] = useState(0)
  const slide = slides[currentSlide]

  const changeSlide = useCallback((n) =>
    onChangeSlide((s) =>
      Math.max(0,
        Math.min(slides.length-1, s+n)
      )
    )
  , [onChangeSlide, slides.length])

  useOnKeydown({
    ArrowLeft: () => changeSlide(-1),
    ArrowRight: () => changeSlide(1),
    r: onRefetch
  })

  const onSwipe = useCallback((e, direction : 'left'|'right') => {
    changeSlide(direction === 'left' ? 1 : -1)
  }, [changeSlide])

  return <ReactTouchEvents onSwipe={onSwipe} disableClick>
    <div className={classnames('slideshow', slide.slideStyleId && `slide-style-${slide.slideStyleId}`)}>
      <div className="controls">
        <ProgramTitleSelector value={slide.index ?? 0} onChange={onChangeSlide}
          program={slides} />
      </div>
      <SlideView slide={slide} onChangeSlide={onChangeSlide} />
    </div>
  </ReactTouchEvents>
}

function SlideView({slide, onChangeSlide}) {
  switch(slide.__typename) {
    case 'Dance':
      return <DanceSlide dance={slide} onChangeSlide={onChangeSlide} />
    case 'RequestedDance':
      return <RequestedDanceSlide next={slide.next} onChangeSlide={onChangeSlide} />
    case 'EventProgram':
      return <EventProgramSlide program={slide} onChangeSlide={onChangeSlide} />
    case 'DanceSet':
    case 'Event':
    default:
      return <HeaderSlide header={slide} onChangeSlide={onChangeSlide} />
  }
}
function HeaderSlide({header, onChangeSlide}) {
  const {name, program = []} = header
  return <SimpleSlide title={name} next={null} onChangeSlide={onChangeSlide} >
    <AutosizedSection className="slide-main-content">
      <ul className="slide-header-list">
        {program
          .filter(t => t.__typename !== 'EventProgram' || t.showInLists)
          .map(({index, name}) =>
            <li onClick={() => onChangeSlide(index)} key={index}>
              {name ?? <RequestedDancePlaceholder />}
            </li>
          )
        }
      </ul>
    </AutosizedSection>
  </SimpleSlide>
}

function EventProgramSlide({program, onChangeSlide}) {
  const {name, next, description} = program
  return <SimpleSlide title={name} next={next} onChangeSlide={onChangeSlide} >
    {description && <AutosizedSection className="slide-main-content slide-program-description">
      <Markdown className="slide-program-description-content">{description}</Markdown>
    </AutosizedSection>}
  </SimpleSlide>
}

const RequestedDancePlaceholder = () => <span className="requested-dance-placeholder"><t.span>requestedDance</t.span></span>

function DanceSlide({dance, onChangeSlide}) {
  const {next, name, teachedIn} = dance

  return <SimpleSlide title={name} next={next} onChangeSlide={onChangeSlide}>
    <AutosizedSection className="slide-main-content slide-program-description">
      <EditableDanceProperty dance={dance} property="description" type="markdown" addText={t`addDescription`} />
    </AutosizedSection>
    {teachedIn.length > 0 &&
      <AutosizedSection className="slide-teached-in">{t`teachedInSet`} {teachedIn.map(w => w.name).join(', ')}</AutosizedSection>
    }
  </SimpleSlide>
}

function RequestedDanceSlide({next, onChangeSlide}) {
  return <SimpleSlide title={t`requestedDance`} next={next} onChangeSlide={onChangeSlide}>
  </SimpleSlide>
}

function SimpleSlide({title, next, onChangeSlide, children}) {
  return <section className="slide">
    <h1 className="slide-title">{title}</h1>
    {children}
    {next &&
        <NextTrackSection next={next}
          onChangeSlide={onChangeSlide} />
    }
  </section>
}

function NextTrackSection({next, onChangeSlide}) {
  return <section className="slide-next-track" onClick={() => onChangeSlide(next.index)}>
    <h1>{t`afterThis`}:{' '}{next.__typename === 'RequestedDance' ? t`requestedDance` : next.name}</h1>
  </section>
}
