import { backendQueryHook, setupServiceUpdateFragment, entityCreateHook, entityDeleteHook, entityUpdateHook } from '../backend';

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
setupServiceUpdateFragment(
  "workshops",
  `fragment WorkshopFragment on Workshop {
    ${workshopFields}
  }`
);

const useWorkshopInternal = backendQueryHook(`
query getWorkshop($id: ID!) {
  workshop(id: $id) {
    ${workshopFields}
  }
}`);
export function useWorkshop(id) {
  const res = useWorkshopInternal({id});
  return [res.data ? res.data.workshop : null, res];
}

export const useCreateWorkshop = entityCreateHook('workshops', `
mutation createWorkshop($eventId: ID!, $workshop: WorkshopInput!) {
  createWorkshop(eventId: $eventId, workshop: $workshop) {
    ${workshopFields}
  }
}`, {
  parameterMapper: (eventId, workshop) => ({variables: {eventId, workshop: toWorkshopInput(workshop)}})
});

export const useModifyWorkshop = entityUpdateHook('workshops', `
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
export const useDeleteWorkshop = entityDeleteHook('workshops', `
mutation deleteWorkshop($id: ID!) {
  deleteWorkshop(id: $id) {
    ${workshopFields}
  }
}`, {
  parameterMapper: id => ({variables: {id}})
});
