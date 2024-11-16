export type EventSlideProps = TitleSlideProps | IntroductionSlideProps| DanceSetSlideProps | DanceProgramItemSlideProps | IntervalMusicSlideProps


export interface TitleSlideProps {
  id: ''
  type: 'title'
  parentId?: undefined
}

export interface DanceSetSlideProps {
  id: ID
  type: 'danceSet'
  parentId?: undefined
  danceSetIndex: number
}

export interface IntroductionSlideProps {
  id: ID
  type: 'introduction'
  parentId: ''
  itemIndex: number
}

export interface DanceProgramItemSlideProps {
  id: ID
  type: 'programItem'
  parentId: ID
  danceSetIndex: number
  itemIndex: number
}

export interface IntervalMusicSlideProps {
  id: ID
  type: 'intervalMusic'
  parentId: ID
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
  instances?: {abbreviation: string}[] | null
}

export interface RequestedDance {
  __typename: 'RequestedDance';
}

export interface NameAndDescription {
  name?: string | null
  description?: string | null
}
