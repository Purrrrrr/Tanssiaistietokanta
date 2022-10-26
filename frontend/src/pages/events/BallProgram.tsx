import React, {useCallback, useMemo, useState} from 'react'
import ReactTouchEvents from 'react-touch-events'
import classnames from 'classnames'
import Markdown from 'markdown-to-jsx'

import {backendQueryHook, graphql, useServiceEvents} from 'backend'

import {AutosizedSection} from 'libraries/ui'
import {EditableDanceProperty} from 'components/EditableDanceProperty'
import {LoadingState} from 'components/LoadingState'
import {ProgramTitleSelector} from 'components/ProgramTitleSelector'
import {makeTranslate} from 'utils/translate'
import {useOnKeydown} from 'utils/useOnKeydown'

import './BallProgram.sass'

const t = makeTranslate({
  teachedInSet: 'Opetettu setissä',
  requestedDance: 'Toivetanssi',
  intervalMusic: 'Taukomusiikkia',
  addDescription: 'Lisää kuvaus',
  afterThis: 'Tämän jälkeen',
})

const useBallProgram = backendQueryHook(graphql(`
query BallProgram($eventId: ID!) {
  event(id: $eventId) {
    _id
    name
    program {
      slideStyleId
      introductions {
        item {
          ... on ProgramItem {
            name
          }
        }
        slideStyleId
      }
      danceSets {
        name
        intervalMusicDuration
        program {
          slideStyleId
          item {
            __typename
            ... on ProgramItem {
              _id
              name
              description
            }
            ... on Dance {
              teachedIn(eventId: $eventId) { _id, name }
            }
            ... on EventProgram {
              showInLists
            }
          }
        }
      }
    }
  }
}`), ({refetch, variables}) => {
  if (variables === undefined) throw new Error('Unknown event id')
  const id = variables.eventId
  const callbacks = useMemo(() => {
    const updateFn = () => {
      console.log('Refetching ball program')
      refetch()
    }
    return {
      created: updateFn,
      updated: updateFn,
      removed: updateFn,
    }
  }, [refetch])
  useServiceEvents('events', `events/${id}`, callbacks)
  useServiceEvents('workshops', `events/${id}/workshops`, callbacks)
  useServiceEvents('dances', `events/${id}/dances`, callbacks)
})

export default function BallProgram({eventId}) {
  const {data, refetch, ...loadingState} = useBallProgram({eventId})
  const [slide, setSlide] = useState(0)

  if (!data) return <LoadingState {...loadingState} refetch={refetch} />

  return <BallProgramView event={data.event} onRefetch={refetch}
    currentSlide={slide} onChangeSlide={setSlide} />
}

function BallProgramView({event, currentSlide, onChangeSlide, onRefetch}) {
  const program = useMemo(() => getSlides(event), [event])
  const slide = program[currentSlide]

  const changeSlide = useCallback((n) =>
    onChangeSlide((s) =>
      Math.max(0,
        Math.min(program.length-1, s+n)
      )
    )
  , [onChangeSlide, program.length])

  useOnKeydown({
    ArrowLeft: () => changeSlide(-1),
    ArrowRight: () => changeSlide(1),
    r: onRefetch
  })

  const onSwipe = useCallback((e, direction : 'left'|'right') => {
    switch(direction) {
      case 'left':
        changeSlide(1)
        break
      case 'right':
        changeSlide(-1)
        break
    }
  }, [changeSlide])

  return <ReactTouchEvents onSwipe={onSwipe} disableClick>
    <div className={classnames('slideshow', slide.slideStyleId && `slide-style-${slide.slideStyleId}`)}>
      <div className="controls">
        <ProgramTitleSelector value={slide.parent?.index ?? slide.index} onChange={onChangeSlide}
          program={program} />
        {slide.subindex && ` ${slide.subindex}/${slide.subtotal} `}
      </div>
      <SlideView slide={slide} onChangeSlide={onChangeSlide} />
    </div>
  </ReactTouchEvents>
}

interface Slide {
  __typename: string
  slideStyleId?: string
  name: string
  index?: number
  subindex?: number
  subtotal?: number
  parent?: Slide
  next?: Slide
}

function getSlides(event) : Slide[] {
  const eventHeader = { __typename: 'Event', name: event.name }
  const slides : Slide[] = [eventHeader]
  if (!event.program) return slides
  const defaultStyleId = event.program.slideStyleId

  const {introductions, danceSets} = event.program
  for (const {item, slideStyleId} of introductions) {
    slides.push({ ...item,  slideStyleId, parent: eventHeader })
  }
  for (const danceSet of danceSets) {
    const danceSetSlide = { ...danceSet, subtotal: danceSet.program.length }
    const danceProgram = danceSet.program.map(({item, slideStyleId}) => ({ ...item, slideStyleId, parent: danceSetSlide}))
    danceSetSlide.program = danceProgram
    slides.push(danceSetSlide)
    slides.push(...danceProgram)

    if (danceSet.intervalMusicDuration > 0) {
      danceSetSlide.subtotal++
      slides.push({
        __typename: 'EventProgram',
        name: t`intervalMusic`,
        parent: danceSetSlide,
      })
    }
  }

  slides.forEach((slide, index) => {
    slide.index = index
    if (slide.parent !== undefined) {
      if (slide.parent.index === undefined) throw new Error('No index in parent slide??')
      slide.subindex = index - slide.parent.index
      slide.subtotal = slide.parent.subtotal
    }
    if (!slide.slideStyleId) {
      slide.slideStyleId = defaultStyleId
    }

    slide.next = slides[index+1]
  })
  return slides
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
