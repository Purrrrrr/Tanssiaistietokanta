import { deleteJson, fetchJson, postJson, useAjax } from '../utils/ajax';
import { gql, useQuery } from './Apollo';

const eventFields = `
_id, name, deleted
program {
  name
  dance{
    _id
  }
}
`;

const GET_EVENTS = gql`
{
  events {
    ${eventFields}
  }
}
`;

export function useEvents() {
  const result = useQuery(GET_EVENTS);
  return [result.data ? result.data.events : [], result];
}

export function getEvents() {
  return fetchJson('/events');
}

export function getEvent(id) {
  return fetchJson('/events/'+id);
}

export function createEvent(event) {
  return postJson('/events', event);
}

export function deleteEvent(id) {
  return deleteJson('/events/'+id);
}
