import io from 'socket.io-client';
import feathers from '@feathersjs/client';

const socket = io('http://localhost:8082/');
const app = (feathers as unknown as Function)();

app.configure(feathers.socketio(socket));
app.configure(feathers.authentication());

export default app
// @ts-ignore
window.feathers = app

const graphQLService = app.service('graphql')

export async function runGraphQlQuery({query, variables}) {
  return await graphQLService.find({query: {query, variables}})
}