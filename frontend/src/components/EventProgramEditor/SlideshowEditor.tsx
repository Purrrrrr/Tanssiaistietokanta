import React from 'react'
import deepEquals from 'fast-deep-equal'

import {Card, Flex} from 'libraries/ui'
import {EventSlide} from 'components/EventSlide/EventSlide'
import { EventSlideProps } from 'components/EventSlide/types'
import {useEventSlides} from 'components/EventSlide/useEventSlides'
import {SlideContainer} from 'components/Slide'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {useT} from 'i18n'

import {EventProgramSettings} from './types'

import { Field } from './components'
import { EventSlideEditor } from './components/EventSlideEditor'

import './EventProgramEditor.sass'
import '../Slide/slideStyles.scss'


export function SlideshowEditor({ value }: {value: EventProgramSettings}) {
  const t = useT('components.eventProgramEditor')
  const slides = useEventSlides(value)

  return <section className="eventProgramEditor">
    <div className="main-toolbar">
      <Field label="" inline path="slideStyleId" component={SlideStyleSelector} componentProps={{text: t('fields.eventDefaultStyle')}} />
    </div>
    {slides.map(slide => <SlideBox key={slide.id} eventProgram={value} slide={slide} />)}
  </section>
}

interface SlideBoxProps {
  eventProgram: EventProgramSettings
  slide: EventSlideProps
}

const SlideBox = React.memo(function SlideBox({eventProgram, slide}: SlideBoxProps) {
  return <Card>
    <Flex wrap spaced>
      <div className="flex-fill" style={{maxWidth: 600}}>
        <EventSlideEditor {...slide} eventProgram={eventProgram} />
      </div>
      <SlideContainer className="flex-fill" size={300} color="#eee">
        <EventSlide {...slide} eventProgram={eventProgram} />
      </SlideContainer>
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
