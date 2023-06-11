// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers'
import { Middleware } from '@feathersjs/koa'
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { koaMiddleware } from "@as-integrations/koa";
// import schema from "./graphql.schema";
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeResolvers } from '@graphql-tools/merge'
import { logger } from '../../logger'

import type { Application } from '../../declarations'

type Graphql = any
type GraphqlData = any
type GraphqlPatch = any
type GraphqlQuery = any

export type { Graphql, GraphqlData, GraphqlPatch, GraphqlQuery }

export interface GraphqlServiceOptions {
  app: Application
  schema: string
  path: string
}

export interface GraphqlParams extends Params<GraphqlQuery> {}

export const graphqlServiceMiddleware : Middleware<Application> = async (ctx, next) => {
  const service = ctx.app.service('graphql')
  if (!service) return await next()
  const middleware = await service.getMiddleware()
  await middleware(ctx, next)
}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class GraphqlService<ServiceParams extends GraphqlParams = GraphqlParams>
  implements ServiceInterface<Graphql, GraphqlData, ServiceParams, GraphqlPatch>
{
  private apolloMiddleware : Middleware<any>
  private innerApolloMiddlewarePromise : ResolvablePromise<Middleware<any>>
  private apolloServerPromise: ResolvablePromise<ApolloServer>
  private resolveApolloServer: (server: ApolloServer) => void = () => {}
  private schema: string

  constructor(public options: GraphqlServiceOptions) {
    this.schema = options.schema
    const pathRegex = new RegExp(`^${options.path}(/.*')?$`)
    this.apolloMiddleware = async (ctx, next) => {
      if (pathRegex.test(ctx.request.url)) {
        const innerApolloMiddleware = await this.innerApolloMiddlewarePromise
        await innerApolloMiddleware(ctx, next)
        return
      }
      await next();
    }
    this.apolloServerPromise = makePromise()
    this.innerApolloMiddlewarePromise = makePromise()
    this.resolveApolloServer = (server) => {
      this.apolloServerPromise.resolve(server)
      this.innerApolloMiddlewarePromise.resolve(koaMiddleware(server, {
        context: async ({ ctx }) => ({ token: ctx.headers.token }),
      }))
    }
  }

  async find(_params?: ServiceParams): Promise<Graphql> {
    if (!_params) throw new Error('Params needed')
    const {query, ...contextValue} = _params
    const server = await this.apolloServerPromise
    const res = await server.executeOperation(query, { contextValue })
    const { body } = res
    if (body.kind === 'single') {
      if (body.singleResult.errors) {
        body.singleResult.errors.forEach(logger.error.bind(logger))
      }
      return body.singleResult
    }
    throw new Error('Can\'t handle result body of type '+body.kind)
  }

  async getMiddleware(_params?: ServiceParams): Promise<Middleware> {
    return this.apolloMiddleware
  }

  async setup(app: Application, path: string): Promise<void> {
    const resolvers = this.getResolvers(app)
    const context = ({
      req = {headers: {}},
      context = {}
    }) => ({
      headers: req.headers,
      ...context,
      provider: 'graphql'
    })

    // Set up Apollo Server
    const server = new ApolloServer({
      typeDefs: this.schema,
      resolvers,
      logger,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer: app.server })],
    });
    await server.start();
    this.resolveApolloServer(server)
  }

  getResolvers(app: any) {
    const extension = app.get('importExtension')
    const resolvers = loadFilesSync(`${__dirname}/../**/*.resolvers.${extension}`)
    function applyContext(importedResolvers: any) {
      if (typeof(importedResolvers) === 'function') {
        return importedResolvers(app)
      }
      return importedResolvers
    }

    return mergeResolvers(resolvers.map(applyContext))
  }
}

interface ResolvablePromise<T> extends Promise<T> {
  resolve(t: T): void
}

function makePromise<T>(): ResolvablePromise<T> {
  let resolve
  const promise = new Promise<T>(resolveFn => {
    resolve = resolveFn
  }) as ResolvablePromise<T>
  promise.resolve = resolve as any
  return promise
}

export const getOptions = (app: Application, path: string, schema: string) => {
  return { app, path, schema }
}
