import { deleteJson } from 'utils/ajax';
import { gql, useQuery, makeMutationHook, makeListQueryHook, appendToListQuery } from './Apollo';

const eventFields = `
_id, name, deleted
program {
  name
  type
  dance{
    _id
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
{
  events {
    ${eventFields}
  }
}`;
export const useEvents = makeListQueryHook(GET_EVENTS, "events");

export const useCreateEvent = makeMutationHook(gql`
mutation createEvent($event: EventInput!) {
  createEvent(event: $event) {
    ${eventFields}
  }
}`, {
  parameterMapper: (event) => ({variables: {event: toEventInput(event)}}),
  update: (cache, {data}) =>
    appendToListQuery(cache, GET_EVENTS, data.createEvent)
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

function toEventInput({name, program}) {
  return {
    name,
    program: program.map(toProgramItemInput)
  };
}

function toProgramItemInput({name, type, dance}) {
  return {
    name, type, danceId: dance ? dance._id : null
  };
}

export const useDeleteEvent = makeMutationHook(gql`
mutation deleteEvent($id: ID!) {
  deleteEvent(id: $id) {
    ${eventFields}
  }
}`, {
  parameterMapper: id => ({variables: {id}})
});

export function deleteEvent(id) {
  return deleteJson('/events/'+id);
}
