import { gql, appendToListQuery, makeMutationHook, makeListQueryHook } from './Apollo';
import {sorted} from "../utils/sorted"

const danceFields = '_id, name, description, remarks, duration, prelude, formation, deleted';

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


export const useDeleteDance = makeMutationHook(gql`
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