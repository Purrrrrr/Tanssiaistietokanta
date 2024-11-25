import React, { UIEvent, useDeferredValue, useEffect, useRef, useState } from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import classNames from 'classnames'
import deepEquals from 'fast-deep-equal'

import {Card, Flex, Tab, Tabs} from 'libraries/ui'
import { EventProgramSettings, Field } from 'components/event/EventProgramForm'
import {EventSlide, EventSlidePreview, EventSlideProps, startSlideId, useEventSlides} from 'components/event/EventSlide'
import { EventSlideEditor } from 'components/event/EventSlideEditor'
import {SlideContainer, useSlideshowNavigation} from 'components/Slide'
import { NavigateButton } from 'components/widgets/NavigateButton'
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
  const deferredCurrentSlide = useDeferredValue(currentSlide)
  const isStale = deferredCurrentSlide !== currentSlide

  return <section className="slideshowEditor">
    <div className="main-toolbar">
      <Field label="" inline path="slideStyleId" component={SlideStyleSelector} componentProps={{text: t('fields.eventDefaultStyle')}} />
    </div>
    <SlideNavigation currentSlide={currentSlide} slideIndex={slideIndex} slides={slides} eventProgram={program} />
    <div {...swipeHandlers} className="slideEditors" style={{
      opacity: isStale ? 0 : 1,
      transition: 'opacity 0.1s linear'
    }}>
      <SlideBox eventProgram={program} slide={deferredCurrentSlide} />
    </div>
  </section>
}

interface SlideNavigationProps {slideIndex: number, currentSlide: EventSlideProps, slides: EventSlideProps[], eventProgram: EventProgramSettings}

function SlideNavigation(props: SlideNavigationProps) {
  const {currentSlide, slides, slideIndex} = props
  const navigate = useNavigate()

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
        <NavigateButton icon="chevron-left" href={`../slides/${slides[slideIndex - 1].id}`} className="previous-slide-link" />
      }
      <SlidePreviews {...props} />
      {slideIndex < slides.length - 1 &&
        <NavigateButton icon="chevron-right" href={`../slides/${slides[slideIndex + 1].id}`} className="next-slide-link" />
      }
    </nav>
  </>
}

function SlidePreviews({slides, currentSlide, eventProgram}: SlideNavigationProps) {
  const container = React.useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState({start: 0, end: 0})

  useEffect(
    () => {
      const div = container.current
      const slide = document.getElementById(`slide-link-${currentSlide.id}`) //?.scrollIntoView({ behavior: 'smooth'})
      if (!div || !slide) return

      console.log(slide.offsetLeft, slide.offsetWidth, div.offsetWidth, slide.offsetLeft + slide.offsetWidth / 2 - div.offsetWidth / 2)
      div.scrollTo({ left: slide.offsetLeft + slide.offsetWidth / 2 - div.offsetWidth / 2, behavior: 'smooth'})
    },
    [currentSlide.id],
  )

  const onScroll = useDebouncedScrollPositionListener(scroll => {
    const div = container.current
    if (!div) return

    const padding = 2
    let start: number | undefined
    let end: number | undefined

    const children = Array.from(div.children) as HTMLElement[]
    for(let i = 0; i < children.length; i++) {
      const child = children[i]
      if (start == undefined) {
        if (child.offsetLeft + child.offsetWidth > scroll) {
          start = i - padding
        }
      }
      if (child.offsetLeft > scroll + div.offsetWidth) {
        end = i + 1 + padding
        break
      }
    }
    setRendered({start: start ?? 0, end: end ?? Infinity})
  })

  return <div className="slides" ref={container} onScroll={onScroll}>
    {slides.map((slide, i) => <SlideLink key={slide.id} slide={slide} eventProgram={eventProgram} current={slide === currentSlide} placeholder={i < rendered.start || i >= rendered.end} />)}
  </div>
}

function useDebouncedScrollPositionListener(callBack: (scrollPosition: number) => unknown) {
  const timer = useRef<NodeJS.Timeout>()
  const lastEvent = useRef<number>()
  const delay = 200
  const debounceTreshold = 600

  return (e: UIEvent<HTMLDivElement>) => {
    const scroll = (e.target as HTMLDivElement).scrollLeft
    const now = +new Date()
    if (timer.current) {
      clearTimeout(timer.current)
    }
    if (lastEvent.current && lastEvent.current + debounceTreshold < now) {
      callBack(scroll)
      lastEvent.current = now
    } else {
      timer.current = setTimeout(() => {
        callBack(scroll)
        lastEvent.current = now
      }, delay)
    }
  }
}

const SlideLink = React.memo(function SlideLink(
  {slide, eventProgram, current, placeholder}: { slide: EventSlideProps, eventProgram: EventProgramSettings, current: boolean, placeholder: boolean }
) {
  if (placeholder) {
    return <a href={`../slides/${slide.id}`} id={`slide-link-${slide.id}`} className={classNames('slide-link', {current})}>
      <SlideContainer className="flex-fill inert" color="#eee">
        <EventSlidePreview {...slide} eventProgram={eventProgram} />
      </SlideContainer>
      <p className="slide-link-title">{slide.title}</p>
    </a>
  }

  return <Link to={`../slides/${slide.id}`} id={`slide-link-${slide.id}`} className={classNames('slide-link', {current})}>
    <SlideContainer className="flex-fill inert" color="#eee">
      <EventSlide {...slide} eventProgram={eventProgram} linkComponent="a" />
    </SlideContainer>
    <p className="slide-link-title">{slide.title}</p>
  </Link>
}, (prevProps, newProps) => prevProps.current === newProps.current && newProps.placeholder === prevProps.placeholder && (newProps.placeholder || areSlideBoxPropsEqual(prevProps, newProps)))

interface SlideBoxProps {
  eventProgram: EventProgramSettings
  slide: EventSlideProps
}

const SlideBox = React.memo(function SlideBox({eventProgram, slide}: SlideBoxProps) {
  return <Card id={slide.id}>
    <Flex wrap>
      <SlideContainer className="flex-fill inert" size="auto" color="#eee">
        <EventSlide {...slide} eventProgram={eventProgram} linkComponent="a" />
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
