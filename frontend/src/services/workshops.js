import { gql, useQuery, makeFragmentCache, makeMutationHook, makeListQueryHook, appendToListQuery } from './Apollo';

const workshopFields = `
  _id, name, deleted
  dances {
    _id
    name
  }
`;

const GET_WORKSHOP = gql`
query getWorkshop($id: ID!) {
  workshop(id: $id) {
    ${workshopFields}
  }
}`;
const getWorkshopFromCache = makeFragmentCache("Workshop", gql`
  fragment workshop on Workshop {
    ${workshopFields}
  }
`);
export function useWorkshop(id) {
  const fragment = getWorkshopFromCache(id);
  const res = useQuery(GET_WORKSHOP, {variables: {id}, skip: !!fragment});
  return [fragment || (res.data ? res.data.workshop : null), res];
}

const GET_WORKSHOPS = gql`
{
  workshops {
    ${workshopFields}
  }
}`;
export const useWorkshops = makeListQueryHook(GET_WORKSHOPS, "workshops");

export const useCreateWorkshop = makeMutationHook(gql`
mutation createWorkshop($eventId: ID!, $workshop: WorkshopInput!) {
  createWorkshop(eventId: $eventId, workshop: $workshop) {
    ${workshopFields}
  }
}`, {
  parameterMapper: (eventId, workshop) => 
    ({variables: {eventId, workshop: toWorkshopInput(workshop)}}),
  update: (cache, {data}) =>
    appendToListQuery(cache, GET_WORKSHOPS, data.createWorkshop)
});

export const useModifyWorkshop = makeMutationHook(gql`
mutation modifyWorkshop($id: ID!, $workshop: WorkshopInput!) {
  modifyWorkshop(id: $id, workshop: $workshop) {
    ${workshopFields}
  }
}`, {
  parameterMapper: ({_id, __typename, deleted, ...workshop}) => 
    ({variables: {id: _id, workshop: toWorkshopInput(workshop)} })
});

function toWorkshopInput({name, dances}) {
  return {
    name,
    danceIds: dances.map(({_id}) => _id)
  };
}

export const useDeleteWorkshop = makeMutationHook(gql`
mutation deleteWorkshop($id: ID!) {
  deleteWorkshop(id: $id) {
    ${workshopFields}
  }
}`, {
  parameterMapper: id => ({variables: {id}})
});
