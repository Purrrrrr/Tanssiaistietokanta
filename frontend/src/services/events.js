import { deleteJson, fetchJson, postJson, useAjax } from '../utils/ajax';

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

export function useEvents() {
  return useAjax("/events", []);
}
