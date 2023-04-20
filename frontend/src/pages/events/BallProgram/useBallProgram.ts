import {useMemo} from 'react'

import {backendQueryHook, graphql} from 'backend'
import {useCallbackOnEventChanges} from 'services/events'

import {t} from './strings'

type BallProgramData = ReturnType<typeof useBallProgram>
export type Event = NonNullable<NonNullable<BallProgramData['data']>['event']>
export type ProgramSettings = NonNullable<Event['program']>
export type DanceSet = ProgramSettings['danceSets'][number]
export type IntroProgramRow = ProgramSettings['introductions']['program']
export type DanceProgramRow = DanceSet['program']
export type ProgramRow = (ProgramSettings['introductions'] | DanceSet)['program'][number]
export type ProgramRowItem = ProgramRow['item']
export type Dance = Extract<ProgramRowItem, {__typename: 'Dance'}>
export type EventProgram = Extract<ProgramRowItem, {__typename: 'EventProgram'}>
type IntervalMusic = ProgramSettings['defaultIntervalMusic']

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
  isHeader: boolean
  item?: ProgramRowItem | { __typename: 'IntervalMusic', description: string }
  parent: SlideRef | null
  program?: SlideContent[]
  showInLists: boolean
}

interface SlideRef {
  _id: string
  name: string
}

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
      defaultIntervalMusic {
        name
        description
      }
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
      danceSets {
        __typename
        _id
        title
        titleSlideStyleId
        intervalMusic {
          name
          description
          duration
          slideStyleId
        }
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

export function getSlides(event: Event) : Slide[] {
  const {
    introductions,
    danceSets,
    slideStyleId: defaultStyleId = null,
    defaultIntervalMusic,
  } = event.program

  const eventHeader : SlideContent = headerSlide({
    __typename: 'Event',
    _id: startSlideId,
    name: introductions.title ?? event.name,
    slideStyleId: introductions.titleSlideStyleId,
  })

  const slides : SlideContent[] = [
    eventHeader,
    ...introductions.program.map(toProgramSlide),
    ...danceSets.flatMap(danceSet => toDanceSetSlides(danceSet, defaultIntervalMusic)),
  ]

  slides.forEach((slide, index) => {
    if (!slide.slideStyleId) {
      slide.slideStyleId = defaultStyleId
    }
  })
  return addNavigation(slides)
}

function toDanceSetSlides({title: name, ...danceSet}: DanceSet, defaultIntervalMusic: IntervalMusic): SlideContent[] {
  const program = [
    ...danceSet.program.map(toProgramSlide),
    ...intervalMusicSlide(danceSet, defaultIntervalMusic),
  ]
  const danceSetSlide = headerSlide({
    ...danceSet,
    name,
    program,
  })
  program.forEach(item => {
    if (item.__typename === 'IntervalMusic') return
    item.program = program
    item.parent = danceSetSlide
  })

  return [danceSetSlide, ...program]
}

function toProgramSlide({_id, item, slideStyleId}: ProgramRow): SlideContent {
  return programSlide({
    __typename: item.__typename,
    name: item.__typename === 'RequestedDance' ? t`requestedDance` : item.name,
    showInLists: 'showInLists' in item ? item.showInLists : true,
    item,
    _id,
    slideStyleId,
  })
}

function intervalMusicSlide(danceSet, defaultIntervalMusic: IntervalMusic): SlideContent[] {
  const {intervalMusic} = danceSet
  if ((intervalMusic?.duration ?? 0) > 0) {
    const description = intervalMusic?.description ?? defaultIntervalMusic.description ?? ''
    return [programSlide({
      __typename: 'IntervalMusic',
      _id: danceSet._id + '-intervalMusic',
      name: (intervalMusic?.name ?? defaultIntervalMusic?.name) || t`intervalMusic`,
      item: { __typename: 'IntervalMusic', description },
      slideStyleId: intervalMusic.slideStyleId,
      showInLists: false,
    })]
  }
  return []
}

function programSlide(props: Omit<SlideContent, 'parent' | 'isHeader'>): SlideContent {
  return {
    ...props,
    parent: null,
    isHeader: false,
  }
}
function headerSlide(
  props: Omit<SlideContent, 'showInLists' | 'isHeader' | 'parent'>
): SlideContent {
  return {
    ...props,
    showInLists: true,
    isHeader: true,
    parent: null,
  }
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
