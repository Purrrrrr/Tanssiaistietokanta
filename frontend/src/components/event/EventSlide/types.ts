import { Dance } from 'types'

import { MinifiedDocumentContent } from 'libraries/lexical'

export type EventSlideProps = TitleSlideProps | IntroductionSlideProps | DanceSetSlideProps | DanceProgramItemSlideProps | IntervalMusicSlideProps
export type EventParentSlideProps = TitleSlideProps | DanceSetSlideProps

export interface TitleSlideProps extends CommonSlideProps {
  id: ''
  type: 'title'
  parentId?: undefined
  children: IntroductionSlideProps[]
}

export interface DanceSetSlideProps extends CommonSlideProps {
  type: 'danceSet'
  parentId?: undefined
  danceSetIndex: number
  children: (DanceProgramItemSlideProps | IntervalMusicSlideProps)[]
}

export interface IntroductionSlideProps extends CommonSlideProps {
  type: 'introduction'
  parentId: ''
  itemIndex: number
}

export interface DanceProgramItemSlideProps extends CommonSlideProps {
  type: 'programItem'
  parentId: ID
  danceSetIndex: number
  itemIndex: number
  showInLists: boolean
}

export interface IntervalMusicSlideProps extends CommonSlideProps {
  type: 'intervalMusic'
  parentId: ID
  danceSetIndex: number
  showInLists: boolean
}

interface CommonSlideProps {
  id: ID
  title: string
  next?: EventSlideProps
  parent?: EventParentSlideProps
}

export type WithEventProgram<X> = { eventProgram: EventProgram } & X

type ID = string
type SlideStyleID = string | null

export interface EventProgram {
  introductions: Introductions
  danceSets: DanceSet[]
  slideStyleId?: SlideStyleID
  defaultIntervalMusic: DefaultIntervalMusic
}

interface Introductions {
  title: string
  titleSlideStyleId?: SlideStyleID
  program: EventProgramRow[]
}

export interface DanceSet {
  _id: ID
  title: string
  titleSlideStyleId?: SlideStyleID
  program: EventProgramRow[]
  intervalMusic?: {
    description?: MinifiedDocumentContent | null
    name?: string | null
    slideStyleId?: SlideStyleID
    showInLists?: boolean
  } | null
}

export interface DefaultIntervalMusic {
  name?: string | null
  description?: MinifiedDocumentContent | null
  showInLists?: boolean
}

export interface EventProgramRow {
  _id: ID
  type: 'Dance' | 'EventProgram' | 'RequestedDance'
  dance?: (Omit<Dance, 'wikipage'> & { teachedIn?: Workshop[] }) | null
  eventProgram?: EventProgramData | null
  slideStyleId?: SlideStyleID
}

interface EventProgramData {
  name: string
  description?: MinifiedDocumentContent | null
  showInLists: boolean
}

export interface Workshop {
  workshop: { name: string }
  instances?: { abbreviation: string }[] | null
}

export interface RequestedDance {
  __typename: 'RequestedDance'
}
