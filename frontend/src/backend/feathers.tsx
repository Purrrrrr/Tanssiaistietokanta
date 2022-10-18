import {FetchResult} from '@apollo/client'
import io from 'socket.io-client'
import feathers from '@feathersjs/client'

const isProd = process.env.NODE_ENV === 'production'

export const socket = isProd
  ? io('/', {path: '/api/socket.io'})
  : io('http://localhost:8082/')
// eslint-disable-next-line @typescript-eslint/ban-types
const app = (feathers as unknown as Function)()

app.configure(feathers.socketio(socket))
app.configure(feathers.authentication())

export default app

const graphQLService = app.service('graphql')

export async function runGraphQlQuery({query, variables}) : Promise<FetchResult<any, any, any>> {
  return await graphQLService.find({query: {query, variables}})
}
