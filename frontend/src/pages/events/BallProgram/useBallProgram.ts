import {useMemo} from 'react'

import {backendQueryHook, graphql} from 'backend'
import {useCallbackOnEventChanges} from 'services/events'

import {t} from './strings'

import './BallProgram.sass'

type BallProgramData = ReturnType<typeof useBallProgram>
export type Event = NonNullable<NonNullable<BallProgramData['data']>['event']>
export type EventProgram = NonNullable<Event['program']>
export type DanceSet = EventProgram['danceSets'][number]
export type IntroProgramRow = EventProgram['introductions']['program']
export type DanceProgramRow = DanceSet['program']
export type ProgramRow = (EventProgram['introductions'] | DanceSet)['program'][number]

export function useBallProgramSlides(eventId) : [Slide[] | null, Omit<BallProgramData, 'data'> ]{
  const {data, ...rest} = useBallProgram({eventId})

  const program = useMemo(() => data?.event ? getSlides(data.event) : null, [data])

  return [program, rest]
}

export const startSlideId = ''

export const useBallProgram = backendQueryHook(graphql(`
query BallProgram($eventId: ID!) {
  event(id: $eventId) {
    _id
    name
    program {
      slideStyleId
      introductions {
        title
        titleSlideStyleId
        program {
          _id
          slideStyleId
          item {
            __typename
            ... on ProgramItem {
              name
            }
          }
        }
      }
      danceSets {
        __typename
        _id
        title
        titleSlideStyleId
        intervalMusicDuration
        intervalMusicSlideStyleId
        program {
          _id
          slideStyleId
          item {
            __typename
            ... on ProgramItem {
              name
              description
            }
            ... on Dance {
              _id
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
  useCallbackOnEventChanges(variables.eventId, refetch)
})

export interface Slide extends SlideContent {
  index: number
  previous: SlideRef | null
  next: SlideRef | null
}
export interface SlideContent {
  __typename: string
  _id: string
  slideStyleId?: string | null
  name: string
  program?: SlideContent[]
  showInLists: boolean
}

interface SlideRef {
  _id: string
  name: string
}

export function getSlides(event: Event) : Slide[] {
  const {
    introductions,
    danceSets,
    slideStyleId: defaultStyleId = null
  } = event.program

  const eventHeader : SlideContent = {
    __typename: 'Event',
    _id: startSlideId,
    name: introductions.title ?? event.name,
    slideStyleId: introductions.titleSlideStyleId,
    showInLists: true,
  }

  const slides : SlideContent[] = [
    eventHeader,
    ...introductions.program.map(toProgramSlide),
    ...danceSets.flatMap(toDanceSetSlides),
  ]

  slides.forEach((slide, index) => {
    if (!slide.slideStyleId) {
      slide.slideStyleId = defaultStyleId
    }
  })
  return addNavigation(slides)
}

function toDanceSetSlides({title: name, ...danceSet}: DanceSet): SlideContent[] {
  const program = [
    ...danceSet.program.map(toProgramSlide),
    ...intervalMusicSlide(danceSet),
  ]
  return [
    {
      ...danceSet,
      name,
      program,
      showInLists: true,
    },
    ...program,
  ]
}

function toProgramSlide({_id, item, slideStyleId}: ProgramRow): SlideContent {
  return {
    name: '',
    showInLists: true,
    ...item,
    _id,
    slideStyleId,
  }
}

function intervalMusicSlide(danceSet): SlideContent[] {
  if (danceSet.intervalMusicDuration > 0) {
    return [{
      __typename: 'EventProgram',
      _id: danceSet._id + '-intervalMusic',
      name: t`intervalMusic`,
      showInLists: false,
      slideStyleId: danceSet.intervalMusicSlideStyleId,
    }]
  }
  return []
}

function addNavigation(slides: SlideContent[]): Slide[] {
  const getSlide = (i) => {
    if (i >= slides.length || i < 0) return null
    const {name, _id} = slides[i]
    return {
      _id, name
    }
  }

  return slides.map((slide, index) => ({
    ...slide,
    index,
    previous: getSlide(index-1),
    next: getSlide(index+1)
  }))
}
