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
  const {
    introductions,
    danceSets,
    slideStyleId: defaultStyleId = null,
    defaultIntervalMusic,
  } = event.program

  const eventHeader : SlideContent = {
    id: startSlideId,
    title: introductions.title ?? event.name,
    slideStyleId: introductions.titleSlideStyleId,
    type: 'Event',
  }

  const slides : SlideContent[] = [
    eventHeader,
    ...introductions.program.map(toProgramSlide),
    ...danceSets.flatMap(danceSet => toDanceSetSlides(danceSet, defaultIntervalMusic)),
  ]

  return slides.map((slide, index) => ({
    ...slide,
    slideStyleId: slide.slideStyleId ?? defaultStyleId,
    next: slide.navigation ? slides[index+1] : undefined,
  }))
}

function toDanceSetSlides(danceSet: DanceSet, defaultIntervalMusic: IntervalMusic): SlideContent[] {
  const {_id: id, title} = danceSet
  const navigation : SlideNavigation = {
    title,
    items: danceSet.program
      .map(item => ({
        id: item._id,
        title: item.item.__typename === 'RequestedDance' ? t`requestedDance` : item.item.name,
        hidden: 'showInLists' in item.item ? !item.item.showInLists : false,
        isPlaceholder: item.item.__typename === 'RequestedDance',
      }))
  }
  const program = [
    ...danceSet.program.map(toProgramSlide),
    ...intervalMusicSlide(danceSet, defaultIntervalMusic),
  ]
  program.forEach(item => {
    item.parentId = danceSet._id
    item.navigation = navigation
  })

  return [
    {
      id,
      title,
      slideStyleId: danceSet.titleSlideStyleId,
      type: 'DanceSet',
      slideContent: {
        type: 'navigation',
        value: navigation.items,
      }
    },
    ...program
  ]
}

function toProgramSlide({_id: id, item, slideStyleId}: ProgramRow): SlideContent {
  switch (item.__typename) {
    case 'RequestedDance':
      return {
        id, slideStyleId,
        type: 'RequestedDance',
        title: t`requestedDance`,
      }
    case 'Dance':
      return {
        id, slideStyleId,
        type: 'Dance',
        title: item.name,
        footer: item.teachedIn ? `${t`teachedInSet`} ${item.teachedIn.map(w => w.name).join(', ')}` : undefined,
        slideContent: {
          type: 'dance',
          value: item,
        }
      }
    case 'EventProgram':
      return {
        id, slideStyleId,
        type: 'EventProgram',
        title: item.name,
        slideContent: {
          type: 'text',
          value: item.description ?? '',
        }
      }
  }
}

function intervalMusicSlide(danceSet: DanceSet, defaultIntervalMusic: IntervalMusic): SlideContent[] {
  const {intervalMusic} = danceSet
  if (!intervalMusic || !intervalMusic.duration) return []

  const id = danceSet._id + '-intervalMusic'
  return [{
    id,
    slideStyleId: intervalMusic.slideStyleId,
    title: (intervalMusic.name ?? defaultIntervalMusic.name) || t`intervalMusic`,
    slideContent: {
      type: 'text',
      value: intervalMusic.description ?? defaultIntervalMusic.description ?? '',
    }
  }]
}
