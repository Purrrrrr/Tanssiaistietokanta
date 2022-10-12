import { setupServiceUpdateFragment, backendQueryHook, entityListQueryHook, entityCreateHook, entityDeleteHook, entityUpdateHook } from '../backend';

const eventFields = `
_id, name 
program {
  introductions {
    _id
    name
    duration
    description
    showInLists
    slideStyleId
  }
  danceSets {
    _id
    name
    program {
      __typename
      ... on ProgramItem {
        _id
        name
        duration
        description
        slideStyleId
      }
      ... on EventProgram {
        showInLists
      }
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
`;

setupServiceUpdateFragment(
  "events",
  `fragment EventFragment on Event {
    ${eventFields}
  }`
)

export interface SlideStyle {
  default?: boolean
  name: string
  id: string | null
  color: string
  background: string
};

const defaultStyle =  {id: null, name: 'Valkoinen', background: '#fff', color: '#000', default: true};
const customStyles = [
  {id: 'dark', name: 'Tumma', background: '#000', color: '#fff'},
];

interface UseEventSlideStylesOptions {
  useStyleInheritance?: boolean
  inheritedStyleId?: string
  inheritedStyleName?: string
}

export function useEventSlideStyles({
  useStyleInheritance,
  inheritedStyleId,
  inheritedStyleName,
} : UseEventSlideStylesOptions) : SlideStyle[] {
  if (useStyleInheritance) {
    const inheritedStyle = customStyles.find(s => s.id === inheritedStyleId) ?? defaultStyle
    const name = inheritedStyleName
      ? `${inheritedStyleName} (${inheritedStyle.name})`
      : inheritedStyle.name

    return [
      { ...inheritedStyle, name, id: null, },
      {...defaultStyle, id: 'default'},
      ...customStyles
    ]
  }
  return [
    defaultStyle,
    ...customStyles
  ]
}

const useEventInternal = backendQueryHook(`
query getEvent($id: ID!) {
  event(id: $id) {
    ${eventFields}
  }
}`);
export function useEvent(id) {
  const res = useEventInternal({id});
  return [res.data ? res.data.event : null, res];
}

export const useEvents = entityListQueryHook('events', `
query getEvents {
  events {
    _id, name
  }
}`);

export const useCreateEvent = entityCreateHook('events', `
mutation createEvent($event: EventInput!) {
  createEvent(event: $event) {
    ${eventFields}
  }
}`, {
  parameterMapper: (event) => ({variables: {event}}),
});

export interface ModifyEventInput {
  _id?: string,
  name: string,
  [key: string]: any
}

export const useModifyEvent = entityUpdateHook('events', `
mutation modifyEvent($id: ID!, $event: EventInput!) {
  modifyEvent(id: $id, event: $event) {
    ${eventFields}
  }
}`, {
  parameterMapper: ({_id, __typename, ...event} : ModifyEventInput) =>
    ({variables: {id: _id, event: toEventInput(event)} })
});

function toEventInput({name}) {
  return { name };
}

export const useModifyEventProgram = entityUpdateHook('events', `
mutation modifyEventProgram($id: ID!, $program: ProgramInput!) {
  modifyEventProgram(id: $id, program: $program) {
    ${eventFields}
  }
}`, {
  parameterMapper: (eventId, {_id, __typename, ...program}) =>
    ({variables: {id: eventId, program} })
});

export const useDeleteEvent = entityDeleteHook('events', `
mutation deleteEvent($id: ID!) {
  deleteEvent(id: $id) {
    ${eventFields}
  }
}`, {
  parameterMapper: id => ({variables: {id}})
});
