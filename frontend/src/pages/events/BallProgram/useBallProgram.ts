import {useMemo} from 'react'

import {SlideNavigation, SlideProps} from 'components/Slide'

import {t} from './strings'
import {useBallProgramQuery} from './useBallProgramQuery'

type BallProgramData = ReturnType<typeof useBallProgramQuery>
type Event = NonNullable<NonNullable<BallProgramData['data']>['event']>
type ProgramSettings = NonNullable<Event['program']>
type DanceSet = ProgramSettings['danceSets'][number]
type ProgramRow = (ProgramSettings['introductions'] | DanceSet)['program'][number]
type Dance = Extract<ProgramRow['item'], {__typename: 'Dance'}>
type IntervalMusic = ProgramSettings['defaultIntervalMusic']

export interface SlideContent extends SlideProps {
  parentId?: string
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

export function useBallProgramSlides(eventId: string) : [SlideContent[] | null, Omit<BallProgramData, 'data'> ]{
  const {data, ...rest} = useBallProgramQuery({eventId})

  const program = useMemo(() => data?.event ? getSlides(data.event) : null, [data])

  return [program, rest]
}

export const startSlideId = ''

export function getSlides(event: Event) : SlideContent[] {
  const { introductions, slideStyleId: defaultStyleId = null } = event.program

  const slides : SlideContent[] = [
    eventHeaderSlide(event),
    ...introductions.program.map(item => toProgramSlide(startSlideId, item)),
    ...danceSetSlides(event),
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
  }
}

function danceSetSlides(event: Event): SlideContent[] {
  const { danceSets, defaultIntervalMusic } = event.program

  let previousIntervalMusic : SlideContent | undefined

  return danceSets.flatMap(danceSet => {
    const navigation = danceSetNavigation(danceSet)
    if (previousIntervalMusic) previousIntervalMusic.navigation = navigation

    const titleSlide = danceSetTitleSlide(danceSet, navigation)
    const danceSlides = danceSet.program.map(item => toProgramSlide(danceSet._id, item, navigation))
    const intervalMusic = intervalMusicSlide(danceSet, defaultIntervalMusic)

    return intervalMusic
      ? [titleSlide, ...danceSlides, previousIntervalMusic = intervalMusic]
      : [titleSlide, ...danceSlides]
  })
}

function danceSetNavigation(danceSet: DanceSet): SlideNavigation {
  const {title} = danceSet
  return {
    title,
    items: danceSet.program
      .map(item => ({
        id: item._id,
        title: item.item.__typename === 'RequestedDance' ? t`requestedDance` : item.item.name,
        hidden: 'showInLists' in item.item ? !item.item.showInLists : false,
        isPlaceholder: item.item.__typename === 'RequestedDance',
      }))
  }
}

function danceSetTitleSlide(danceSet: DanceSet, navigation: SlideNavigation): SlideContent {
  const {_id: id, title} = danceSet

  return {
    id,
    title,
    slideStyleId: danceSet.titleSlideStyleId,
    type: 'DanceSet',
    slideContent: {
      type: 'navigation',
      value: navigation.items,
    }
  }
}

function toProgramSlide(parentId: string, {_id: id, item, slideStyleId}: ProgramRow, navigation?: SlideNavigation): SlideContent {
  const common = { id, slideStyleId, navigation, parentId, type: item.__typename }
  switch (item.__typename) {
    case 'RequestedDance':
      return {
        ...common,
        type: 'RequestedDance',
        title: t`requestedDance`,
      }
    case 'Dance':
      return {
        ...common,
        title: item.name,
        footer: item.teachedIn ? `${t`teachedInSet`} ${item.teachedIn.map(w => w.name).join(', ')}` : undefined,
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

function intervalMusicSlide(danceSet: DanceSet, defaultIntervalMusic: IntervalMusic): SlideContent | undefined {
  const {intervalMusic} = danceSet
  if (!intervalMusic || !intervalMusic.duration) return undefined

  const id = danceSet._id + '-intervalMusic'
  return {
    id,
    parentId: danceSet._id,
    slideStyleId: intervalMusic.slideStyleId,
    title: (intervalMusic.name ?? defaultIntervalMusic.name) || t`intervalMusic`,
    slideContent: {
      type: 'text',
      value: intervalMusic.description ?? defaultIntervalMusic.description ?? '',
    }
  }
}
