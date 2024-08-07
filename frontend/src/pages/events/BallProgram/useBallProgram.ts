import {useMemo} from 'react'

import { DanceSetPath, ProgramItemPath } from 'components/EventProgramEditor/types'
import {SlideLink, SlideNavigation, SlideProps} from 'components/Slide'
import {Translator, useT} from 'i18n'

import {useBallProgramQuery} from './useBallProgramQuery'

type BallProgramData = ReturnType<typeof useBallProgramQuery>
type Event = NonNullable<NonNullable<BallProgramData['data']>['event']>
type ProgramSettings = NonNullable<Event['program']>
type DanceSet = ProgramSettings['danceSets'][number]
type ProgramRow = (ProgramSettings['introductions'] | DanceSet)['program'][number]
type Dance = Extract<ProgramRow['item'], {__typename: 'Dance'}>
type IntervalMusic = ProgramSettings['defaultIntervalMusic']

export interface SlideContent extends SlideProps {
  parent?: SlideLink
  editorData: EditorData
  slideContent?: {
    type: 'text'
    value: string
  } | {
    type: 'navigation'
    value: SlideNavigation['items']
  } | {
    type: 'dance'
    value: Dance
  }
}

export type EditorData = ProgramItemData | {
  type: 'DanceSet' | 'IntervalMusic',
  path: DanceSetPath,
} | {
  type: 'Event', path: ''
}

export interface ProgramItemData {
  type: 'ProgramItem',
  //itemType: ProgramRow['item']['__typename']
  path: ProgramItemPath,
}

type T = Translator<'pages.events.ballProgram'>

export const startSlideId = ''

export function useBallProgramSlides(eventId: string) : [SlideContent[] | null, Omit<BallProgramData, 'data'> & BallProgramData['data'] ]{
  const {data, ...rest} = useBallProgramQuery({eventId})
  const t = useT('pages.events.ballProgram')

  const program = useMemo(() => data?.event ? getSlides(data.event, t) : null, [data, t])

  return [program, {...data, ...rest}]
}

function getSlides(event: Event, t: T) : SlideContent[] {
  const { introductions, slideStyleId: defaultStyleId = null } = event.program

  const header = eventHeaderSlide(event)
  const slides : SlideContent[] = [
    header,
    ...introductions.program.map((item, index) => toProgramSlide({_id: startSlideId, title: header.title}, item, `introductions.program.${index}`, t)),
    ...danceSetSlides(event, t),
  ]

  return slides.map((slide, index) => ({
    ...slide,
    slideStyleId: slide.slideStyleId ?? defaultStyleId,
    next: slide.navigation ? slides[index+1] : undefined,
  }))
}

function eventHeaderSlide(event: Event): SlideContent {
  const { introductions } = event.program

  return {
    id: startSlideId,
    title: introductions.title ?? event.name,
    slideStyleId: introductions.titleSlideStyleId,
    type: 'Event',
    editorData: {
      type: 'Event',
      path: '',
    }
  }
}

function danceSetSlides(event: Event, t: T): SlideContent[] {
  const { danceSets, defaultIntervalMusic } = event.program

  let previousIntervalMusic : SlideContent | undefined

  return danceSets.flatMap((danceSet, setIndex) => {
    const navigation = danceSetNavigation(danceSet, t)
    if (previousIntervalMusic) previousIntervalMusic.navigation = navigation

    const titleSlide = danceSetTitleSlide(danceSet, navigation, setIndex)
    const danceSlides = danceSet.program.map((item, itemIndex) =>
      toProgramSlide(danceSet, item, `danceSets.${setIndex}.program.${itemIndex}`, t, navigation))
    const intervalMusic = intervalMusicSlide(danceSet, defaultIntervalMusic, setIndex, t)

    return intervalMusic
      ? [titleSlide, ...danceSlides, previousIntervalMusic = intervalMusic]
      : [titleSlide, ...danceSlides]
  })
}

function danceSetNavigation(danceSet: DanceSet, t: T): SlideNavigation {
  const {title} = danceSet
  return {
    title,
    items: danceSet.program
      .map(item => ({
        id: item._id,
        title: item.item.__typename === 'RequestedDance' ? t('requestedDance') : item.item.name,
        hidden: 'showInLists' in item.item ? !item.item.showInLists : false,
        isPlaceholder: item.item.__typename === 'RequestedDance',
      }))
  }
}

function danceSetTitleSlide(danceSet: DanceSet, navigation: SlideNavigation, index: number): SlideContent {
  const {_id: id, title} = danceSet

  return {
    id,
    title,
    slideStyleId: danceSet.titleSlideStyleId,
    type: 'DanceSet',
    editorData: {
      type: 'DanceSet',
      path: `danceSets.${index}`,
    },
    slideContent: {
      type: 'navigation',
      value: navigation.items,
    }
  }
}

function toProgramSlide(parent: {_id: string, title: string}, {_id: id, item, slideStyleId}: ProgramRow, path: ProgramItemPath, t: T, navigation?: SlideNavigation): SlideContent {
  const common = {
    id, slideStyleId, navigation, type: item.__typename,
    parent: {id: parent._id, title: parent.title},
    editorData: { type: 'ProgramItem' as const, path },
  }
  switch (item.__typename) {
    case 'RequestedDance':
      return {
        ...common,
        type: 'RequestedDance',
        title: t('requestedDance'),
      }
    case 'Dance':
      return {
        ...common,
        title: item.name,
        footer: item.teachedIn.length ?
          `${t('teachedInSet')} ${teachedIn(item)}`
          : undefined,
        slideContent: {
          type: 'dance',
          value: item,
        }
      }
    case 'EventProgram':
      return {
        ...common,
        title: item.name,
        slideContent: {
          type: 'text',
          value: item.description ?? '',
        }
      }
  }
}

function teachedIn(dance: Dance): string {
  return dance.teachedIn.map(
    ({workshop, instances}) => instances
      ? `${workshop.name} (${instances.map(i => i.abbreviation).join('/')})`
      : workshop.name
  ).join(', ')
}

function intervalMusicSlide(danceSet: DanceSet, defaultIntervalMusic: IntervalMusic, setIndex: number, t: T): SlideContent | undefined {
  const {intervalMusic} = danceSet
  if (!intervalMusic || !intervalMusic.duration) return undefined

  const id = danceSet._id + '-intervalMusic'
  return {
    id,
    parent: {id: danceSet._id, title: danceSet.title},
    slideStyleId: intervalMusic.slideStyleId,
    title: (intervalMusic.name ?? defaultIntervalMusic.name) || t('intervalMusic'),
    editorData: {
      type: 'IntervalMusic',
      path: `danceSets.${setIndex}`,
    },
    slideContent: {
      type: 'text',
      value: intervalMusic.description ?? defaultIntervalMusic.description ?? '',
    }
  }
}
