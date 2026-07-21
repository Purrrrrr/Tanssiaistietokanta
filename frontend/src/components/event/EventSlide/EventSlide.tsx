import { useState } from 'react'

import { Dance } from 'types'
import type { DanceProgramItemSlideProps, DanceSetSlideProps, EventParentSlideProps, EventProgram, EventSlideProps, IntervalMusicSlideProps } from './types'

import FabricImageViewer from 'libraries/fabric/FabricImageViewer'
import { LinkComponentType, Slide, SlideNavigation, SlideNavigationList } from 'components/Slide'

import { renderDoc, TeachedIn } from './utils'

type WithCommonProps<X> = {
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
      const { eventProgram: program, slideStyleId } = eventProgram.introductions.program[props.itemIndex]
      if (!program) {
        console.error('No introduction program found for slide', props)
        return null
      }
      return <Slide
        id={id}
        title={props.title}
        slideStyleId={slideStyleId ?? eventProgram.slideStyleId}
        linkComponent={linkComponent}
        children={renderDoc(program.description)}
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
      danceSets, defaultIntervalMusic, slideStyleId: defaultSlideStyleId, ballroom,
    },
    danceSetIndex,
    id, title, linkComponent, next, parent,
  } = props

  const { intervalMusic } = danceSets[danceSetIndex]

  return <Slide
    id={id}
    title={title}
    children={renderDoc(
      intervalMusic?.description ?? defaultIntervalMusic?.description,
    )}
    slideStyleId={intervalMusic?.slideStyleId ?? defaultSlideStyleId}
    next={next}
    navigation={danceSetNavigation((next as DanceSetSlideProps | undefined) ?? parent)}
    additionalContent={<FormationDiagramsViewer formationDiagrams={getFormationDiagramsForBallroom(intervalMusic?.dance, ballroom?._id)} />}
    linkComponent={linkComponent}
  />
}

function DanceProgramItemSlide(props: WithCommonProps<DanceProgramItemSlideProps>) {
  const { id, next, title, linkComponent, eventProgram, danceSetIndex, itemIndex } = props
  const { type, dance, eventProgram: program, slideStyleId } = eventProgram.danceSets[danceSetIndex].program[itemIndex]

  const content = type === 'RequestedDance'
    ? {
      children: '',
    }
    : {
      children: renderDoc(dance?.description ?? program?.description),
      footer: dance?.teachedIn?.length
        ? <TeachedIn teachedIn={dance.teachedIn} />
        : undefined,
      additionalContent: <FormationDiagramsViewer formationDiagrams={getFormationDiagramsForBallroom(dance, eventProgram.ballroom?._id)} />,
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

function getFormationDiagramsForBallroom(dance?: Dance | null, ballroomId?: string | null) {
  if (!ballroomId) return undefined
  return dance?.formationDiagrams?.find(fd => fd.ballroom?._id === ballroomId)
}

function FormationDiagramsViewer({ formationDiagrams }: { formationDiagrams?: Dance['formationDiagrams'][0] }) {
  const [fullScreen, setFullScreen] = useState(false)

  if (!formationDiagrams?.diagram) return null

  const toggle = () => document.startViewTransition(() => setFullScreen(!fullScreen))

  return <button
    id="formation-instructions-viewer"
    onClick={toggle}
    className={`flex items-stretch justify-center [view-transition-name:photo] hover:outline-2 ${fullScreen ? 'absolute inset-[15cqh_4cqw_6cqh] z-50' : 'w-full mt-4'}`}>
    <FabricImageViewer
      className={`${fullScreen ? 'w-auto' : 'w-full'} border bg-white cursor-pointer`}
      diagram={formationDiagrams.diagram}
      backgroundDiagram={formationDiagrams.ballroom?.map ?? undefined} />
  </button>
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
