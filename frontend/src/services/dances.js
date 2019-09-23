import { gql, useQuery, useMutation } from './Apollo';

const danceFields = '_id, name, description, remarks, duration, prelude, formation deleted';

const GET_DANCES = gql`
{
  dances {
    ${danceFields}
  }
}
`;

const MODIFY_DANCE = gql`
mutation modifyDance($id: ID!, $dance: DanceModification!) {
  modifyDance(id: $id, dance: $dance) {
    ${danceFields}
  }
}
`;

const CREATE_DANCE = gql`
mutation createDance($dance: DanceModification!) {
  createDance(dance: $dance) {
    ${danceFields}
  }
}
`;

const DELETE_DANCE = gql`
mutation deleteDance($id: ID!) {
  deleteDance(id: $id) {
    ${danceFields}
  }
}
`;

export function useDances() {
  const result = useQuery(GET_DANCES);
  return [result.data ? result.data.dances : [], result];
}

export function useCreateDance(args) {
  const [createDance, data] = useMutation(CREATE_DANCE, {...args, update: updateCache});

  return [(dance) => createDance({variables: {dance}}), data];
}

export function useDeleteDance(args) {
  const [deleteDance, data] = useMutation(DELETE_DANCE, args);

  return [(id) => deleteDance({variables: {id}}), data];
}

export function useModifyDance(args) {
  const [modifyDance, data] = useMutation(MODIFY_DANCE, args);

  return [({_id, __typename, deleted, ...dance}) => modifyDance({variables: {id: _id, dance} }), data];
}

function updateCache(cache, {data: {createDance}}) {
  const { dances } = cache.readQuery({ query: GET_DANCES });
  cache.writeQuery({
    query: GET_DANCES,
    data: { dances: [...dances, createDance] },
  });

}
