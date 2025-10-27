import type { DanceProgramItemSlideProps, DanceSetSlideProps, EventParentSlideProps, EventProgram, EventProgramItem, EventSlideProps, IntervalMusicSlideProps } from './types'

import { LinkComponentType, Slide, SlideNavigation, SlideNavigationList } from 'components/Slide'

import { markdown, TeachedIn } from './utils'

export type WithCommonProps<X> = {
  eventProgram: EventProgram
  linkComponent?: LinkComponentType
} & X

export function EventSlide(props: WithCommonProps<EventSlideProps>) {
  const { id, eventProgram, linkComponent } = props
  switch (props.type) {
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

function DanceSetSlide(props: WithCommonProps<DanceSetSlideProps>) {
  const { id, title, eventProgram, danceSetIndex, linkComponent } = props
  const danceSet = eventProgram.danceSets[danceSetIndex]
  return <Slide
    id={id}
    title={title}
    children={
      <SlideNavigationList items={danceSetNavigation(props)?.items ?? []} linkComponent={linkComponent}
      />
    }
    slideStyleId={danceSet.titleSlideStyleId ?? eventProgram.slideStyleId}
  />
}

function IntervalMusicSlide(props: WithCommonProps<IntervalMusicSlideProps>) {
  const {
    eventProgram: {
      danceSets, defaultIntervalMusic, slideStyleId: defaultSlideStyleId,
    },
    danceSetIndex,
    id, title, linkComponent, next, parent,
  } = props

  const { intervalMusic } = danceSets[danceSetIndex]

  return <Slide
    id={id}
    title={title}
    children={markdown(
      intervalMusic?.description ?? defaultIntervalMusic?.description ?? '',
    )}
    slideStyleId={intervalMusic?.slideStyleId ?? defaultSlideStyleId}
    next={next}
    navigation={danceSetNavigation((next as DanceSetSlideProps | undefined) ?? parent)}
    linkComponent={linkComponent}
  />
}

function DanceProgramItemSlide(props: WithCommonProps<DanceProgramItemSlideProps>) {
  const { id, next, title, linkComponent, eventProgram, danceSetIndex, itemIndex } = props
  const { item, slideStyleId } = eventProgram.danceSets[danceSetIndex].program[itemIndex]

  const content = item.__typename === 'RequestedDance'
    ? {
      children: '',
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
    navigation={danceSetNavigation(next?.parent)}
    next={next}
    {...content}
  />
}

function danceSetNavigation(parent?: EventParentSlideProps): SlideNavigation | undefined {
  if (!parent) return undefined
  return {
    title: parent.title,
    items: parent.children.map(item => ({
      id: item.id,
      title: item.title,
      hidden: !item.showInLists,
    })),
  }
}
