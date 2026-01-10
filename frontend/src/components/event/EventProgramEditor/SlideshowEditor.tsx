import React, { UIEvent, useDeferredValue, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'libraries/ui/icons'
import classNames from 'classnames'

import { Card, Link } from 'libraries/ui'
import { EventProgramSettings, Field } from 'components/event/EventProgramForm'
import { EventSlide, EventSlidePreview, EventSlideProps, startSlideId, useEventSlides } from 'components/event/EventSlide'
import { EventSlideEditor } from 'components/event/EventSlideEditor'
import { SlideContainer, useSlideshowNavigation } from 'components/Slide'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { SlideStyleSelector } from 'components/widgets/SlideStyleSelector'
import { useT } from 'i18n'

import { MissingDanceInstructionsWarning } from './components'
import { SlideChooser } from './components/SlideChooser'
import { useLinkToSlide } from './useLinkToSlide'

import 'components/Slide/slideStyles.scss'

export function SlideshowEditor({ program }: { program: EventProgramSettings }) {
  const t = useT('components.eventProgramEditor')
  const navigate = useNavigate()
  const linkToSlide = useLinkToSlide()
  const slides = useEventSlides(program)
  const { slideId = startSlideId } = useParams()
  const currentSlide = slides.find(slide => slide.id === slideId) ?? slides[0]
  const { swipeHandlers, slideIndex } = useSlideshowNavigation({
    slides, currentSlideId: currentSlide.id,
    onChangeSlide: (slide) => navigate(linkToSlide(slide.id)),
  })
  const deferredCurrentSlide = useDeferredValue(currentSlide)
  const isStale = deferredCurrentSlide.id !== currentSlide.id

  return <section className="slideshowEditor">
    <MissingDanceInstructionsWarning program={program} />
    <div className="flex justify-between">
      <SlideChooser
        slides={slides}
        currentSlide={deferredCurrentSlide}
        onChoose={id => navigate(linkToSlide(id))}
      />
      <Field label="" inline path="slideStyleId" component={SlideStyleSelector} componentProps={{ text: t('fields.eventDefaultStyle') }} />
    </div>
    <SlideNavigation currentSlide={currentSlide} slideIndex={slideIndex} slides={slides} eventProgram={program} />
    <div {...swipeHandlers} className="slideEditors" style={{
      opacity: isStale ? 0 : 1,
      transition: 'opacity 0.1s linear',
    }}>
      <SlideBox eventProgram={program} slide={deferredCurrentSlide} />
    </div>
  </section>
}

interface SlideNavigationProps { slideIndex: number, currentSlide: EventSlideProps, slides: EventSlideProps[], eventProgram: EventProgramSettings }

function SlideNavigation(props: SlideNavigationProps) {
  const { slides, slideIndex } = props
  const linkToSlide = useLinkToSlide()

  return <>
    <nav className="slideNavigation">
      {slideIndex > 0 &&
        <NavigateButton icon={<ChevronLeft />} href={linkToSlide(slides[slideIndex - 1].id)} className="previous-slide-link" />
      }
      <SlidePreviews {...props} />
      {slideIndex < slides.length - 1 &&
        <NavigateButton icon={<ChevronRight />} href={linkToSlide(slides[slideIndex + 1].id)} className="next-slide-link" />
      }
    </nav>
  </>
}

function SlidePreviews({ slides, currentSlide, eventProgram }: SlideNavigationProps) {
  const container = React.useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState({ start: 0, end: 0 })

  useEffect(
    () => {
      const div = container.current
      const slide = document.getElementById(`slide-link-${currentSlide.id}`) // ?.scrollIntoView({ behavior: 'smooth'})
      if (!div || !slide) return

      div.scrollTo({ left: slide.offsetLeft + slide.offsetWidth / 2 - div.offsetWidth / 2, behavior: 'smooth' })
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
    for (let i = 0; i < children.length; i++) {
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
    setRendered({ start: start ?? 0, end: end ?? Infinity })
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

function SlideLink(
  { slide, eventProgram, current, placeholder }: { slide: EventSlideProps, eventProgram: EventProgramSettings, current: boolean, placeholder: boolean },
) {
  const linkToSlide = useLinkToSlide()

  return <Link to={linkToSlide(slide.id)} id={`slide-link-${slide.id}`} className={classNames('slide-link', { current })}>
    <SlideContainer className="grow inert" color="#eee">
      {placeholder
        ? <EventSlidePreview {...slide} eventProgram={eventProgram} />
        : <EventSlide {...slide} eventProgram={eventProgram} linkComponent={PreviewLink} />
      }
    </SlideContainer>
    <p className="slide-link-title">{slide.title}</p>
  </Link>
}

const PreviewLink = ({ children }: { children: React.ReactNode }) => <span>{children}</span>

interface SlideBoxProps {
  eventProgram: EventProgramSettings
  slide: EventSlideProps
}

function SlideBox({ eventProgram, slide }: SlideBoxProps) {
  return <Card noPadding id={slide.id}>
    <div className="flex flex-wrap">
      <SlideContainer className="grow inert" size="auto" color="#eee">
        <EventSlide {...slide} eventProgram={eventProgram} linkComponent="a" />
      </SlideContainer>
      <div className="eventSlideEditor">
        <EventSlideEditor {...slide} eventProgram={eventProgram} />
      </div>
    </div>
  </Card>
}
