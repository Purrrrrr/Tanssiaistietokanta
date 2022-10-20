import { setupServiceUpdateFragment, backendQueryHook, entityListQueryHook, entityCreateHook, entityDeleteHook, entityUpdateHook } from '../backend'

const eventFields = `
_id, name 
program {
  introductions {
    _id
    item {
      __typename
      ... on ProgramItem {
        _id
        name
        duration
        description
      }
      ... on EventProgram {
        showInLists
      }
    }
    slideStyleId
  }
  danceSets {
    _id
    name
    program {
      _id
      item {
        __typename
        ... on ProgramItem {
          _id
          name
          duration
          description
        }
        ... on EventProgram {
          showInLists
        }
      }
      slideStyleId
    }
    intervalMusicDuration
  }
  slideStyleId
}
workshops {
  _id
  name
  abbreviation
  description
  teachers
  dances {
    _id, name
  }
}
`

setupServiceUpdateFragment(
  'events',
  `fragment EventFragment on Event {
    ${eventFields}
  }`
)

export interface SlideStyleDefinition {
  name: string
  styleName: string
  color: string
  background: string
}
export interface SlideStyle extends SlideStyleDefinition {
  id: string | null
}

export const defaultSlideStyle =  {styleName: 'default', id: 'default', name: 'Valkoinen', background: '#fff', color: '#000', default: true}
const customStyles = [
  { styleName: 'dark', name: 'Tumma', background: '#000', color: '#fff' },
  { styleName: 'flower-title1', name: 'Kukka iso 1', background: '#F681BD', color: '#000' },
  { styleName: 'flower-title2', name: 'Kukka iso 2', background: '#C31C6D', color: '#000' },
  { styleName: 'flower-title3', name: 'Kukka iso 3', background: '#DF2300', color: '#000' },
  { styleName: 'flower-title4', name: 'Kukka iso 4', background: '#DC3D5F', color: '#000' },
  { styleName: 'flower-title5', name: 'Kukka iso 5', background: '#F37ECF', color: '#000' },
  { styleName: 'flower-title6', name: 'Kukka iso 6', background: '#DC4B8E', color: '#000' },
  { styleName: 'flower-frame1', name: 'Kukka reunus 1', background: '#B980A0', color: '#000' },
  { styleName: 'flower-frame2', name: 'Kukka reunus 2', background: '#DC918C', color: '#000' },
  { styleName: 'flower-frame3', name: 'Kukka reunus 3', background: '#97278D', color: '#000' },
  { styleName: 'flower-frame4', name: 'Kukka reunus 4', background: '#FEC900', color: '#000' },
  { styleName: 'flower-frame5', name: 'Kukka reunus 5', background: '#FE6BBA', color: '#000' },
  { styleName: 'flower-frame6', name: 'Kukka reunus 6', background: '#F02735', color: '#000' },
  { styleName: 'flower-frame7', name: 'Kukka reunus 7', background: '#DC91CB', color: '#000' },
].map(style => ({...style, id: style.styleName}))

interface UseEventSlideStylesOptions {
  useStyleInheritance?: boolean
  inheritedStyleId?: string | null
  inheritedStyleName?: string
}

export function useEventSlideStyles({
  useStyleInheritance,
  inheritedStyleId,
  inheritedStyleName,
} : UseEventSlideStylesOptions) : SlideStyle[] {
  if (useStyleInheritance) {
    const inheritedStyle = customStyles.find(s => s.id === inheritedStyleId) ?? defaultSlideStyle
    const name = inheritedStyleName
      ? `${inheritedStyleName} (${inheritedStyle.name})`
      : inheritedStyle.name

    return [
      { ...inheritedStyle, name, id: null },
      defaultSlideStyle,
      ...customStyles
    ]
  }
  return [
    defaultSlideStyle,
    ...customStyles
  ]
}

const useEventInternal = backendQueryHook(`
query getEvent($id: ID!) {
  event(id: $id) {
    ${eventFields}
  }
}`)
export function useEvent(id) {
  const res = useEventInternal({id})
  return [res.data ? res.data.event : null, res]
}

export const useEvents = entityListQueryHook('events', `
query getEvents {
  events {
    _id, name
  }
}`)

export const useCreateEvent = entityCreateHook('events', `
mutation createEvent($event: EventInput!) {
  createEvent(event: $event) {
    ${eventFields}
  }
}`, {
  parameterMapper: (event) => ({variables: {event}}),
})

export interface ModifyEventInput {
  _id?: string,
  name: string,
  [key: string]: unknown
}

export const useModifyEvent = entityUpdateHook('events', `
mutation modifyEvent($id: ID!, $event: EventInput!) {
  modifyEvent(id: $id, event: $event) {
    ${eventFields}
  }
}`, {
  parameterMapper: ({_id, __typename, ...event} : ModifyEventInput) =>
    ({variables: {id: _id, event: toEventInput(event)} })
})

function toEventInput({name}) {
  return { name }
}

export const useModifyEventProgram = entityUpdateHook('events', `
mutation modifyEventProgram($id: ID!, $program: ProgramInput!) {
  modifyEventProgram(id: $id, program: $program) {
    ${eventFields}
  }
}`, {
  parameterMapper: (eventId, {_id, __typename, ...program}) =>
    ({variables: {id: eventId, program} })
})

export const useDeleteEvent = entityDeleteHook('events', `
mutation deleteEvent($id: ID!) {
  deleteEvent(id: $id) {
    ${eventFields}
  }
}`, {
  parameterMapper: id => ({variables: {id}})
})
