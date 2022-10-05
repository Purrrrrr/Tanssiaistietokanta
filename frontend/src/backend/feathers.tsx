import {FetchResult} from "@apollo/client";
import io from 'socket.io-client';
import feathers from '@feathersjs/client';

export const socket = io('/', {path: '/api/socket.io'});
const app = (feathers as unknown as Function)();

app.configure(feathers.socketio(socket));
app.configure(feathers.authentication());

export default app
// @ts-ignore
window.feathers = app

const graphQLService = app.service('graphql')

export async function runGraphQlQuery({query, variables}) : Promise<FetchResult<any, any, any>> {
  return await graphQLService.find({query: {query, variables}})
}
