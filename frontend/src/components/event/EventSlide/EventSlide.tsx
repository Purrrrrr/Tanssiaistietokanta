import type { DanceProgramItemSlideProps, DanceSet, DanceSetSlideProps, EventProgram, EventProgramItem, EventSlideProps, IntervalMusicSlideProps } from './types'

import { LinkComponentType, Slide, SlideNavigation, SlideNavigationList } from 'components/Slide'

import { intervalMusicId } from './useEventSlides'
import { DefaultIntervalMusicTitle, intervalMusicTitle, markdown, programItemTitle, TeachedIn } from './utils'

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
        title={props.title}
        slideStyleId={slideStyleId ?? eventProgram.slideStyleId}
        linkComponent={linkComponent}
        children={markdown((item as EventProgramItem).description)}
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
    id, title, linkComponent, next
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
    next={next}
    navigation={danceSetNavigation(eventProgram, nextDanceSet ?? danceSet)}
    linkComponent={linkComponent}
  />
}

function DanceProgramItemSlide(props: WithCommonProps<DanceProgramItemSlideProps>) {
  const { id, next, title, linkComponent, eventProgram, eventProgram: { danceSets }, danceSetIndex, itemIndex } = props
  const { item, slideStyleId } = eventProgram.danceSets[danceSetIndex].program[itemIndex]
  const navigationDanceSet = next?.type === 'danceSet'
    ? danceSets[next.danceSetIndex]
    : danceSets[danceSetIndex]

  const content = item.__typename === 'RequestedDance'
    ? {
      children: ''
    }
    : {
      children: markdown(item.description ?? ''),
      footer: item.teachedIn?.length
        ? <TeachedIn teachedIn={item.teachedIn} />
        : undefined,
    }

  return <Slide
    id={id}
    title={title}
    linkComponent={linkComponent}
    slideStyleId={slideStyleId ?? eventProgram.slideStyleId}
    navigation={danceSetNavigation(eventProgram, navigationDanceSet)}
    next={next}
    {...content}
  />
}

function danceSetNavigation(eventProgram: EventProgram, danceSet: DanceSet): SlideNavigation | undefined {
  if (!danceSet) return undefined
  const items = danceSet.program.map(item => ({
    id: item._id,
    title: programItemTitle(item.item),
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
