import React, { useEffect } from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import deepEquals from 'fast-deep-equal'

import {Card, Flex, Tab, Tabs} from 'libraries/ui'
import { EventProgramSettings, Field } from 'components/event/EventProgramForm'
import {EventSlide, EventSlideProps, startSlideId, useEventSlides} from 'components/event/EventSlide'
import { EventSlideEditor } from 'components/event/EventSlideEditor'
import {SlideContainer, useSlideshowNavigation} from 'components/Slide'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {useT} from 'i18n'

import 'components/Slide/slideStyles.scss'

export function SlideshowEditor({ program }: {program: EventProgramSettings}) {
  const t = useT('components.eventProgramEditor')
  const navigate = useNavigate()
  const slides = useEventSlides(program)
  const { slideId = startSlideId } = useParams()
  const currentSlide = slides.find(slide => slide.id === slideId ) ?? slides[0]
  const { swipeHandlers, slideIndex } = useSlideshowNavigation({
    slides, currentSlideId: currentSlide.id,
    onChangeSlide: (slide) => navigate(`../slides/${slide.id}`)
  })


  return <section className="slideshowEditor">
    <div className="main-toolbar">
      <Field label="" inline path="slideStyleId" component={SlideStyleSelector} componentProps={{text: t('fields.eventDefaultStyle')}} />
    </div>
    <SlideNavigation currentSlide={currentSlide} slideIndex={slideIndex} slides={slides} eventProgram={program} />
    <div {...swipeHandlers} className="slideEditors">
      <SlideBox eventProgram={program} slide={currentSlide} />
    </div>
  </section>
}

function SlideNavigation({currentSlide, slides, eventProgram, slideIndex}: {slideIndex: number, currentSlide: EventSlideProps, slides: EventSlideProps[], eventProgram: EventProgramSettings}) {
  const navigate = useNavigate()
  const currentParentId = currentSlide.parentId ?? currentSlide.id

  useEffect(
    () => {
      document.getElementById(`slide-link-${currentSlide.id}`)?.scrollIntoView({ behavior: 'smooth'})
    },
    [currentSlide.id],
  )

  return <>
    <Tabs
      id="danceset"
      selectedTabId={currentSlide.parentId ?? currentSlide.id}
      onChange={(id) => navigate(`../slides/${id}`)}
    >
      {slides.filter(slide => slide.parentId === undefined).map(slide =>
        <Tab id={slide.id} title={slide.title} />
      )}
    </Tabs>
    <nav className="slideNavigation">
      {slideIndex > 0 &&
        <Link to={`../slides/${slides[slideIndex - 1].id}`} className="previous-slide-link">⇦</Link>
      }
      <div className="slides">
        {slides.filter(slide => slide.id || (slide.id === currentParentId || slide.parentId === currentParentId))
          .map(slide => <SlideLink key={slide.id} slide={slide} eventProgram={eventProgram} />)}

      </div>
      {slideIndex < slides.length - 1 &&
        <Link to={`../slides/${slides[slideIndex + 1].id}`} className="next-slide-link">⇨</Link>
      }
    </nav>
  </>
}

const SlideLink = React.memo(function SlideLink({slide, eventProgram}: { slide: EventSlideProps, eventProgram: EventProgramSettings }) {
  return <Link to={`../slides/${slide.id}`} id={`slide-link-${slide.id}`}>
    <SlideContainer className="flex-fill inert" color="#eee">
      <EventSlide {...slide} eventProgram={eventProgram} />
    </SlideContainer>
    <p>{slide.title}</p>
  </Link>
}, areSlideBoxPropsEqual)

interface SlideBoxProps {
  eventProgram: EventProgramSettings
  slide: EventSlideProps
}

const SlideBox = React.memo(function SlideBox({eventProgram, slide}: SlideBoxProps) {
  return <Card id={slide.id}>
    <Flex wrap>
      <SlideContainer className="flex-fill inert" size="auto" color="#eee">
        <EventSlide {...slide} eventProgram={eventProgram} />
      </SlideContainer>
      <div className="eventSlideEditor">
        <EventSlideEditor {...slide} eventProgram={eventProgram} />
      </div>
    </Flex>
  </Card>
}, areSlideBoxPropsEqual)

function areSlideBoxPropsEqual(props: SlideBoxProps, nextProps: SlideBoxProps): boolean {
  if (!deepEquals(nextProps.slide, props.slide)) {
    return false
  }
  const { eventProgram: program } = props
  const { eventProgram: nextProgram, slide } = nextProps

  if (nextProgram.slideStyleId !== program.slideStyleId) {
    return false
  }

  switch(slide.type) {
    case 'title':
      return deepEquals(nextProgram.introductions, program.introductions)
    case 'introduction':
      return nextProgram.introductions.title === program.introductions.title && deepEquals(
        nextProgram.introductions.program[slide.itemIndex],
        program.introductions.program[slide.itemIndex],
      )
    case 'danceSet':
      return deepEquals(nextProgram.danceSets[slide.danceSetIndex], program.danceSets[slide.danceSetIndex])
    case 'intervalMusic': {
      const nextDanceSet = nextProgram.danceSets[slide.danceSetIndex]
      const danceSet = program.danceSets[slide.danceSetIndex]
      return nextDanceSet.title === danceSet.title && deepEquals(
        [nextProgram.defaultIntervalMusic, nextDanceSet.intervalMusic],
        [program.defaultIntervalMusic, danceSet.intervalMusic]
      )
    }
    case 'programItem':{
      const nextDanceSet = nextProgram.danceSets[slide.danceSetIndex]
      const danceSet = program.danceSets[slide.danceSetIndex]
      return nextDanceSet.title === danceSet.title && deepEquals(
        danceSet.program[slide.itemIndex],
        nextDanceSet.program[slide.itemIndex]
      )
    }
  }
}
