export type EventSlideProps = TitleSlideProps | IntroductionSlideProps| DanceSetSlideProps | DanceProgramItemSlideProps | IntervalMusicSlideProps


export interface TitleSlideProps {
  id: ''
  type: 'title'
}

export interface DanceSetSlideProps {
  id: ID
  type: 'danceSet'
  danceSetIndex: number
}

export interface IntroductionSlideProps {
  id: ID
  type: 'introduction'
  itemIndex: number
}

export interface DanceProgramItemSlideProps {
  id: ID
  type: 'programItem'
  danceSetIndex: number
  itemIndex: number
}

export interface IntervalMusicSlideProps {
  id: ID
  type: 'intervalMusic'
  danceSetIndex: number
}

export type WithEventProgram<X> = { eventProgram: EventProgram } & X

type ID = string
type SlideStyleID = string | null

export interface EventProgram {
  introductions: Introductions
  danceSets: DanceSet[]
  slideStyleId?: SlideStyleID
  defaultIntervalMusic: NameAndDescription
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
    description?: string | null
    name?: string | null
    slideStyleId?: SlideStyleID
  } | null
}

export interface EventProgramRow {
  _id: ID
  item: EventProgramItem | RequestedDance
  slideStyleId?: SlideStyleID
}

export interface EventProgramItem extends NameAndDescription {
  __typename: 'Dance' | 'EventProgram';
  teachedIn?: Workshop[]
}

export interface Workshop {
  workshop: { name: string }
  instances?: {abbreviation: string}[]
}

export interface RequestedDance {
  __typename: 'RequestedDance';
}

export interface NameAndDescription {
  name?: string | null
  description?: string | null
}
