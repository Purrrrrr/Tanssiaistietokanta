import {FetchResult} from '@apollo/client'
import {print} from 'graphql'
import io from 'socket.io-client'

import { ServiceName } from './types'

import createDebug from 'utils/debug'

import devConfig from '../devConfig'

const debug = createDebug('graphql')

const isProd = process.env.NODE_ENV === 'production'

export const socket = isProd
  ? io('/', {path: '/api/socket.io'})
  : io(devConfig.backendUrl)

export function makeFeathersRequest<T>(
  service: ServiceName | 'channel-connections' | 'graphql',
  verb: 'find' | 'create' | 'remove',
  query: unknown,
) {
  return new Promise<T>((resolve, reject) =>
    socket.emit(verb, service, query, (err: unknown, res: T) => err ? reject(err) : resolve(res))
  )
}

type R = FetchResult<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>

export async function runGraphQlQuery({query, variables}) : Promise<FetchResult<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>> {
  debug('GraphQL query: %s\nVariables: %O', print(query), variables)
  const result = await makeFeathersRequest<R>('graphql', 'find', {query, variables})
  if (debug.enabled) {
    Object.keys(result).forEach(
      key => Object.keys(result[key]).forEach(
        dataKey => debug('%s.%s: %O', key, dataKey, result[key][dataKey])
      )
    )
  }
  return result
}
