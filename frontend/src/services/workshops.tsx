import { gql, makeMutationHook, useQuery } from './Apollo';

const workshopFields = `
  _id, eventId
  name
  abbreviation
  description
  teachers
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
export function useWorkshop(id) {
  const res = useQuery(GET_WORKSHOP, {variables: {id}});
  return [res.data ? res.data.workshop : null, res];
}

export const CREATE_WORKSHOP = gql`
mutation createWorkshop($eventId: ID!, $workshop: WorkshopInput!) {
  createWorkshop(eventId: $eventId, workshop: $workshop) {
    ${workshopFields}
  }
}`;
export const useCreateWorkshop= makeMutationHook(CREATE_WORKSHOP, {
  parameterMapper: (eventId, workshop) => ({variables: {eventId, workshop: toWorkshopInput(workshop)}})
});

export const useModifyWorkshop = makeMutationHook(gql`
mutation modifyWorkshop($id: ID!, $workshop: WorkshopInput!) {
  modifyWorkshop(id: $id, workshop: $workshop) {
    ${workshopFields}
  }
}`, {
  parameterMapper: (workshop) => 
    ({variables: {id: workshop._id, workshop: toWorkshopInput(workshop)} })
});

export function toWorkshopInput({name, abbreviation, description, teachers, dances}) {
  return {
    name, abbreviation, description, teachers,
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
