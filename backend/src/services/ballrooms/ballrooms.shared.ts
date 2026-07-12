import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Ballrooms, BallroomsData, BallroomsPatch, BallroomsQuery, BallroomsService } from './ballrooms.class'

export type { Ballrooms, BallroomsData, BallroomsPatch, BallroomsQuery }

export type BallroomsClientService = Pick<BallroomsService<Params<BallroomsQuery>>, (typeof ballroomsMethods)[number]>

export const ballroomsPath = 'ballrooms'

export const ballroomsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const ballroomsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(ballroomsPath, connection.service(ballroomsPath), {
    methods: ballroomsMethods,
  })
}

declare module '../../client' {
  interface ServiceTypes {
    [ballroomsPath]: BallroomsClientService
  }
}
