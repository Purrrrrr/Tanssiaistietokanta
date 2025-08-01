export type EventSlideProps = TitleSlideProps | IntroductionSlideProps| DanceSetSlideProps | DanceProgramItemSlideProps | IntervalMusicSlideProps


export interface TitleSlideProps extends CommonSlideProps {
  id: ''
  type: 'title'
  parentId?: undefined
}

export interface DanceSetSlideProps extends CommonSlideProps {
  type: 'danceSet'
  parentId?: undefined
  danceSetIndex: number
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
}

export interface IntervalMusicSlideProps extends CommonSlideProps {
  type: 'intervalMusic'
  parentId: ID
  danceSetIndex: number
}

interface CommonSlideProps {
  id: ID
  title: string
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
    description?: string | null
    name?: string | null
    slideStyleId?: SlideStyleID
    showInLists?: boolean
  } | null
}

export interface DefaultIntervalMusic extends NameAndDescription {
  showInLists?: boolean
}

export interface EventProgramRow {
  _id: ID
  item: EventProgramItem | RequestedDance
  slideStyleId?: SlideStyleID
}

export interface EventProgramItem extends NameAndDescription {
  __typename: 'Dance' | 'EventProgram';
  teachedIn?: Workshop[]
  showInLists?: boolean
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
