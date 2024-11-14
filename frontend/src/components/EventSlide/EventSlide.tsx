import { Slide, SlideLink, SlideNavigation, SlideNavigationList, SlideProps } from 'components/Slide'

import { DanceProgramItemSlideProps, DanceSet, DanceSetSlideProps, EventProgramItem, EventSlideProps, IntervalMusicSlideProps, RequestedDance, WithEventProgram } from './types'

import { intervalMusicId } from './useEventSlides'
import { intervalMusicTitle, markdown, RequestedDancePlaceholder, TeachedIn } from './utils'

export function EventSlide(props: WithEventProgram<EventSlideProps>) {
  const { eventProgram } = props
  switch(props.type) {
    case 'title':
      return <Slide
        type="program-title"
        id={props.id}
        title={eventProgram.introductions.title}
        slideStyleId={eventProgram.introductions.titleSlideStyleId ?? eventProgram.slideStyleId}
      />
    case 'introduction': {
      const { item, slideStyleId } = eventProgram.introductions.program[props.itemIndex]
      return <Slide
        id={props.id}
        {...programItemContent(item)}
        slideStyleId={slideStyleId ?? eventProgram.slideStyleId}
      />
    }
    case 'danceSet':
      return <DanceSetSlide {...props} eventProgram={eventProgram} />
    case 'intervalMusic':
      return <Slide {...intervalMusicSlideProps(props)} />
    case 'programItem':
      return <Slide
        id={props.id}
        {...danceProgramItemSlideProps(props)}
      />
  }
}

function DanceSetSlide({ eventProgram, danceSetIndex }: WithEventProgram<DanceSetSlideProps> ) {
  const danceSet = eventProgram.danceSets[danceSetIndex]
  return <Slide
    id={danceSet._id}
    title={danceSet.title}
    children={
      <SlideNavigationList
        currentItem={danceSet._id}
        items={danceSetNavigation(danceSet)?.items ?? []}
      />
    }
    slideStyleId={danceSet.titleSlideStyleId ?? eventProgram.slideStyleId}
  />
}

function intervalMusicSlideProps(props: WithEventProgram<IntervalMusicSlideProps> ): SlideProps {
  const {
    eventProgram: {
      danceSets, defaultIntervalMusic, slideStyleId: defaultSlideStyleId
    },
    danceSetIndex,
  } = props

  const danceSet = danceSets[danceSetIndex]
  const nextDanceSet = danceSets[danceSetIndex + 1]
  const { intervalMusic } = danceSet

  return {
    id: props.id,
    title: intervalMusicTitle(props.eventProgram, danceSetIndex),
    children: markdown(
      intervalMusic?.description ?? defaultIntervalMusic?.description ?? ''
    ),
    slideStyleId: intervalMusic?.slideStyleId ?? defaultSlideStyleId,
    next: linkToDanceSet(nextDanceSet),
    navigation: danceSetNavigation(nextDanceSet ?? danceSet),
  }
}

function danceProgramItemSlideProps(props: WithEventProgram<DanceProgramItemSlideProps> ): Omit<SlideProps, 'id'> {
  const { eventProgram, danceSetIndex, itemIndex } = props
  const nav = getNavigationLinks(props)
  const item = eventProgram.danceSets[danceSetIndex].program[itemIndex]

  return {
    ...programItemContent(item.item),
    ...nav,
    slideStyleId: item.slideStyleId ?? eventProgram.slideStyleId
  }
}

function getNavigationLinks(props: WithEventProgram<DanceProgramItemSlideProps> ): Pick<SlideProps, 'next' | 'navigation'> {
  const { eventProgram, eventProgram: {danceSets}, danceSetIndex: programSetIndex, itemIndex } = props

  const danceSet = danceSets[programSetIndex]
  const isLastProgramItem = itemIndex === danceSet.program.length - 1

  if (isLastProgramItem) {
    if (danceSet.intervalMusic) {
      return {
        navigation: danceSetNavigation(danceSet),
        next: {
          id: intervalMusicId(danceSet._id),
          title: intervalMusicTitle(eventProgram, programSetIndex)
        }
      }
    } else {
      const nextDanceSet = danceSets[programSetIndex + 1]
      return {
        next: linkToDanceSet(nextDanceSet),
        navigation: danceSetNavigation(nextDanceSet ?? danceSet),
      }
    }
  }

  const next = danceSet.program[itemIndex + 1]
  return {
    navigation: danceSetNavigation(danceSet),
    next: {
      id: next._id,
      title: programItemContent(next.item).title,
    }
  }
}

function linkToDanceSet(danceSet?: DanceSet | null): SlideLink | undefined {
  if (!danceSet) return undefined
  return {
    id: danceSet._id,
    title: danceSet.title
  }
}

function danceSetNavigation(danceSet?: DanceSet | null): SlideNavigation | undefined {
  if (!danceSet) return undefined
  return {
    title: danceSet.title,
    items: danceSet.program.map(item => ({
      id: item._id,
      title: programItemContent(item.item).title,
    }))
  }
}

function programItemContent(item: EventProgramItem | RequestedDance): Pick<SlideProps, 'title' | 'children' | 'footer'> {
  if (item.__typename === 'RequestedDance') {
    return {
      title: <RequestedDancePlaceholder />,
      children: ''
    }
  }

  return {
    title: item.name ?? '',
    children: markdown(item.description ?? ''),
    footer: item.teachedIn?.length ? <TeachedIn teachedIn={item.teachedIn} /> : undefined,
  }
}
