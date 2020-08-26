import { gql, appendToListQuery, makeMutationHook, makeListQueryHook } from './Apollo';
import {sorted} from "utils/sorted"

export interface Dance {
  _id?: string
  name?: string,
  description?: string,
  remarks?: string,
  duration?: number,
  prelude?: string,
  formation?: string,
  category?: string,
  instructions?: string,
  deleted?: boolean
}

const danceFields = '_id, name, description, remarks, duration, prelude, formation, category, instructions, deleted';

const GET_DANCES = gql`
{
  dances {
    ${danceFields}
  }
}`;
export const useDances = makeListQueryHook(GET_DANCES, "dances");

export const useModifyDance = makeMutationHook(gql`
mutation modifyDance($id: ID!, $dance: DanceInput!) {
  modifyDance(id: $id, dance: $dance) {
    ${danceFields}
  }
}`, {
  parameterMapper: ({_id, __typename, deleted, ...dance}) => 
    ({variables: {id: _id, dance} })
});


export const useCreateDance = makeMutationHook(gql`
mutation createDance($dance: DanceInput!) {
  createDance(dance: $dance) {
    ${danceFields}
  }
}`, {
  parameterMapper: (dance) => ({variables: {dance}}),
  update: (cache, {data: {createDance}}) =>
    appendToListQuery(cache, GET_DANCES, createDance)
});

export const PATCH_DANCE = gql`
mutation patchDance($id: ID!, $dance: DancePatchInput!) {
  patchDance(id: $id, dance: $dance) {
    ${danceFields}
  }
}`;

export const useDeleteDance = makeMutationHook<[string]>(gql`
mutation deleteDance($id: ID!) {
  deleteDance(id: $id) {
    ${danceFields}
  }
}`, {
  parameterMapper: id => ({variables: {id}})
});


export function filterDances(dances, searchString) {
  return sorted(
    dances.filter(dance => filterDance(dance, searchString)),
    (a, b) => a.name.localeCompare(b.name)
  );
}

function filterDance(dance, search) {
  const lSearch = search.toLowerCase();
  const lName = dance.name.toLowerCase();
  return !dance.deleted && lName.indexOf(lSearch) !== -1;
}
