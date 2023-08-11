import {useMemo} from 'react'

import {SlideNavigation, SlideProps} from 'components/Slide'

import {t} from './strings'
import {useBallProgramQuery} from './useBallProgramQuery'

type BallProgramData = ReturnType<typeof useBallProgramQuery>
type Event = NonNullable<NonNullable<BallProgramData['data']>['event']>
type ProgramSettings = NonNullable<Event['program']>
type DanceSet = ProgramSettings['danceSets'][number]
type ProgramRow = (ProgramSettings['introductions'] | DanceSet)['program'][number]
type ProgramRowItem = ProgramRow['item']
type Dance = Extract<ProgramRowItem, {__typename: 'Dance'}>
type IntervalMusic = ProgramSettings['defaultIntervalMusic']

export interface Slide extends SlideContent {
  previousId: string | null
  nextId: string | null
}
export interface SlideContent {
  id: string
  parentId?: string
  slideStyleId?: string | null

  slide: SlideProps
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

export function useBallProgramSlides(eventId) : [Slide[] | null, Omit<BallProgramData, 'data'> ]{
  const {data, ...rest} = useBallProgramQuery({eventId})

  const program = useMemo(() => data?.event ? getSlides(data.event) : null, [data])

  return [program, rest]
}

export const startSlideId = ''


export function getSlides(event: Event) : Slide[] {
  const {
    introductions,
    danceSets,
    slideStyleId: defaultStyleId = null,
    defaultIntervalMusic,
  } = event.program

  const eventHeader : SlideContent = {
    id: startSlideId,
    slideStyleId: introductions.titleSlideStyleId,
    slide: {
      id: startSlideId,
      title: introductions.title ?? event.name,
      type: 'Event',
    }
  }

  const slides : SlideContent[] = [
    eventHeader,
    ...introductions.program.map(toProgramSlide),
    ...danceSets.flatMap(danceSet => toDanceSetSlides(danceSet, defaultIntervalMusic)),
  ]

  slides.forEach((slide) => {
    if (!slide.slideStyleId) {
      slide.slideStyleId = defaultStyleId
    }
  })
  return addNavigation(slides)
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
    item.slide.navigation = navigation
  })

  return [
    {
      id,
      slideStyleId: danceSet.titleSlideStyleId,
      slide: {
        id,
        title,
        type: 'DanceSet',
      },
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
        slide: {
          id,
          title: t`requestedDance`,
        }
      }
    case 'Dance':
      return {
        id, slideStyleId,
        slide: {
          id,
          title: item.name,
          footer: item.teachedIn ? `${t`teachedInSet`} ${item.teachedIn.map(w => w.name).join(', ')}` : undefined,
        },
        slideContent: {
          type: 'dance',
          value: item,
        }
      }
    case 'EventProgram':
      return {
        id, slideStyleId,
        slide: {
          id,
          title: item.name,
        },
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
    slide: {
      id,
      title: (intervalMusic.name ?? defaultIntervalMusic.name) || t`intervalMusic`,
    },
    slideContent: {
      type: 'text',
      value: intervalMusic.description ?? defaultIntervalMusic.description ?? '',
    }
  }]
}

function addNavigation(slides: SlideContent[]): Slide[] {
  const getSlide = (i: number) => {
    if (i >= slides.length || i < 0) return undefined
    const {slide: {title}, id} = slides[i]
    return { id, title }
  }

  return slides.map((slide, index) => ({
    ...slide,
    previousId: getSlide(index-1)?.id ?? null,
    nextId: getSlide(index+1)?.id ?? null,
    slide: {
      ...slide.slide,
      next: slide.slide.navigation ? getSlide(index+1) : undefined,
    }
  }))
}
