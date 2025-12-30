// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { existsSync, readFileSync, unlinkSync } from 'fs'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  userDataValidator,
  userPatchValidator,
  userQueryValidator,
  userResolver,
  userExternalResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver
} from './users.schema'

import type { Application } from '../../declarations'
import { User, UserService, getOptions } from './users.class'
import { userPath, userMethods } from './users.shared'
import { titleCase } from '../dancewiki/utils/titleCase'
import { disallow } from 'feathers-hooks-common'

export * from './users.class'
export * from './users.schema'

export const createUserFile = './data/create-user.json'
type CreateUser = Pick<User, 'username' | 'password'>

async function initializeFirstUser(userService: UserService, throwOnMissingFile = false) {
  if (!existsSync(createUserFile)) {
    if (throwOnMissingFile) {
      throw new Error(`Initial user creation file ${createUserFile} not found`)
    }
    return
  }
  const users = await userService.find({ query: { $limit: 1 } })
  if (users.length > 0) {
    console.log('Users already exist. Skipping initial user creation.')
    throw new Error('Users already exist')
  }

  const fileContents = readFileSync(createUserFile, 'utf-8')
  const { username, password } = JSON.parse(fileContents) as CreateUser
  console.log(`Creating initial user '${username}' from ${createUserFile}`)

  if (!username || !password) {
    console.error(`create-user.json must contain both 'username' and 'password' fields`)
    throw new Error('Invalid create-user.json file')
  }

  const result = await userService.create({
    name: titleCase(username),
    username,
    password
  })

  console.log(`User '${username}' created. Deleting ${createUserFile}`)
  unlinkSync(createUserFile)
  return result
}

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app: Application) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(userPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(userExternalResolver), schemaHooks.resolveResult(userResolver)],
      find: [authenticate('jwt')],
      get: [authenticate('jwt')],
      create: [
        async (ctx, next) => {
          const createDefault = ctx.data && 'createDefault' in ctx.data
          if (createDefault) {
            ctx.result = await initializeFirstUser(ctx.service, true)
            return
          }
          return next()
        },
      ],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')]
    },
    before: {
      all: [schemaHooks.validateQuery(userQueryValidator), schemaHooks.resolveQuery(userQueryResolver)],
      find: [],
      get: [],
      create: [disallow('external'), schemaHooks.validateData(userDataValidator), schemaHooks.resolveData(userDataResolver)],
      patch: [schemaHooks.validateData(userPatchValidator), schemaHooks.resolveData(userPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })

  initializeFirstUser(app.service('users'))
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [userPath]: UserService
  }
}
