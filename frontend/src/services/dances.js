import { postJson, putJson, deleteJson, useAjax } from '../utils/ajax';

export function createDance(dance) {
  return postJson('/dances', dance);
}

export function modifyDance(id, {_id, ...dance}) {
  return putJson('/dances/'+id, dance);
}

export function deleteDance(id) {
  return deleteJson('/dances/'+id);
}

export function useDances() {
  return useAjax("/dances", []);
}
