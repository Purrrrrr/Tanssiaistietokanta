import { gql, makeListQueryHook, makeMutationHook, useQuery } from './Apollo';

const eventFields = `
_id, name, deleted
program {
  introductions {
    name
    duration
  }
  danceSets {
    name
    program {
      __typename
      ... on NamedProgram {
        name
        duration
      }
      ... on Dance {
        _id
      }
    }
  }
}
workshops {
  _id, name
}
`;

const GET_EVENT = gql`
query getEvent($id: ID!) {
  event(id: $id) {
    ${eventFields}
  }
}`;
export function useEvent(id) {
  const res = useQuery(GET_EVENT, {variables: {id}});
  return [res.data ? res.data.event : null, res];
}

const GET_EVENTS = gql`
query getEvents {
  events {
    _id, name
  }
}`;
export const useEvents = makeListQueryHook(GET_EVENTS, "events");

export const useCreateEvent = makeMutationHook(gql`
mutation createEvent($event: EventInput!) {
  createEvent(event: $event) {
    ${eventFields}
  }
}`, {
  parameterMapper: (event) => ({variables: {event}}),
});

export const useModifyEvent = makeMutationHook(gql`
mutation modifyEvent($id: ID!, $event: EventInput!) {
  modifyEvent(id: $id, event: $event) {
    ${eventFields}
  }
}`, {
  parameterMapper: ({_id, __typename, deleted, ...event}) =>
    ({variables: {id: _id, event: toEventInput(event)} })
});

function toEventInput({name}) {
  return { name };
}

export const useModifyEventProgram = makeMutationHook(gql`
mutation modifyEventProgram($id: ID!, $program: ProgramInput!) {
  modifyEventProgram(id: $id, program: $program) {
    ${eventFields}
  }
}`, {
  parameterMapper: (eventId, {_id, __typename, ...program}) =>
    ({variables: {id: eventId, program} })
});

export const useDeleteEvent = makeMutationHook(gql`
mutation deleteEvent($id: ID!) {
  deleteEvent(id: $id) {
    ${eventFields}
  }
}`, {
  parameterMapper: id => ({variables: {id}})
});
