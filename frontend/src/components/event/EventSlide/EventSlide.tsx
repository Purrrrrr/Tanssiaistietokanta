import { DanceProgramItemSlideProps, DanceSet, DanceSetSlideProps, EventProgram, EventProgramItem, EventSlideProps, IntervalMusicSlideProps, RequestedDance, WithEventProgram } from './types'

import { LinkComponentType, Slide, SlideNavigation, SlideNavigationList, SlideProps } from 'components/Slide'

import { intervalMusicId } from './useEventSlides'
import { DefaultIntervalMusicTitle, intervalMusicTitle, linkToDanceSet, markdown, RequestedDancePlaceholder, TeachedIn } from './utils'

export type WithCommonProps<X> = {
  eventProgram: EventProgram
  linkComponent?: LinkComponentType
} & X

export function EventSlide(props: WithCommonProps<EventSlideProps>) {
  const { id, eventProgram, linkComponent } = props
  switch(props.type) {
    case 'title':
      return <Slide
        type="program-title"
        id={id}
        title={props.title}
        slideStyleId={eventProgram.introductions.titleSlideStyleId ?? eventProgram.slideStyleId}
        linkComponent={linkComponent}
      />
    case 'introduction': {
      const { item, slideStyleId } = eventProgram.introductions.program[props.itemIndex]
      return <Slide
        id={id}
        {...programItemContent(item)}
        slideStyleId={slideStyleId ?? eventProgram.slideStyleId}
        linkComponent={linkComponent}
      />
    }
    case 'danceSet':
      return <DanceSetSlide {...props} />
    case 'intervalMusic':
      return <IntervalMusicSlide {...props} />
    case 'programItem':
      return <DanceProgramItemSlide {...props} />
  }
}

function DanceSetSlide({ id, title, eventProgram, danceSetIndex, linkComponent }: WithCommonProps<DanceSetSlideProps>) {
  const danceSet = eventProgram.danceSets[danceSetIndex]
  const navigation = danceSetNavigation(eventProgram, danceSet)
  return <Slide
    id={id}
    title={title}
    children={
      <SlideNavigationList items={navigation?.items ?? []} linkComponent={linkComponent}
      />
    }
    slideStyleId={danceSet.titleSlideStyleId ?? eventProgram.slideStyleId}
  />
}

function IntervalMusicSlide(props: WithCommonProps<IntervalMusicSlideProps>) {
  const {
    eventProgram: {
      danceSets, defaultIntervalMusic, slideStyleId: defaultSlideStyleId
    },
    eventProgram,
    danceSetIndex,
    id, title, linkComponent
  } = props

  const danceSet = danceSets[danceSetIndex]
  const nextDanceSet = danceSets[danceSetIndex + 1]
  const { intervalMusic } = danceSet

  return <Slide
    id={id}
    title={title}
    children={markdown(
      intervalMusic?.description ?? defaultIntervalMusic?.description ?? ''
    )}
    slideStyleId={intervalMusic?.slideStyleId ?? defaultSlideStyleId}
    next={linkToDanceSet(nextDanceSet)}
    navigation={danceSetNavigation(eventProgram, nextDanceSet ?? danceSet)}
    linkComponent={linkComponent}
  />
}

function DanceProgramItemSlide(props: WithCommonProps<DanceProgramItemSlideProps>) {
  const { id, linkComponent, eventProgram, danceSetIndex, itemIndex } = props
  const item = eventProgram.danceSets[danceSetIndex].program[itemIndex]

  return <Slide
    id={id}
    linkComponent={linkComponent}
    slideStyleId={item.slideStyleId ?? eventProgram.slideStyleId}
    {...programItemContent(item.item)}
    {...getNavigationLinks(props)}
  />
}

function getNavigationLinks(props: WithEventProgram<DanceProgramItemSlideProps> ): Pick<SlideProps, 'next' | 'navigation'> {
  const { eventProgram, eventProgram: {danceSets}, danceSetIndex: programSetIndex, itemIndex } = props

  const danceSet = danceSets[programSetIndex]
  const isLastProgramItem = itemIndex === danceSet.program.length - 1

  if (isLastProgramItem) {
    if (danceSet.intervalMusic) {
      return {
        navigation: danceSetNavigation(eventProgram, danceSet),
        next: {
          id: intervalMusicId(danceSet._id),
          title: intervalMusicTitle(eventProgram, danceSet) ?? <DefaultIntervalMusicTitle />
        }
      }
    } else {
      const nextDanceSet = danceSets[programSetIndex + 1]
      return {
        next: linkToDanceSet(nextDanceSet),
        navigation: danceSetNavigation(eventProgram, nextDanceSet ?? danceSet),
      }
    }
  }

  const next = danceSet.program[itemIndex + 1]
  return {
    navigation: danceSetNavigation(eventProgram, danceSet),
    next: {
      id: next._id,
      title: programItemContent(next.item).title,
    }
  }
}

function danceSetNavigation(eventProgram: EventProgram, danceSet: DanceSet): SlideNavigation | undefined {
  if (!danceSet) return undefined
  const items = danceSet.program.map(item => ({
    id: item._id,
    title: programItemContent(item.item).title,
    hidden: item.item.__typename === 'EventProgram' && item.item.showInLists === false
  }))
  if (danceSet.intervalMusic) {
    const showIntervalMusic  = danceSet.intervalMusic.description
      ? danceSet.intervalMusic.showInLists
      : eventProgram.defaultIntervalMusic.showInLists

    if (showIntervalMusic) {
      items.push({
        id: intervalMusicId(danceSet._id),
        title: intervalMusicTitle(eventProgram, danceSet) ?? <DefaultIntervalMusicTitle />,
        hidden: false,
      })
    }
  }

  return {
    title: danceSet.title,
    items
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
