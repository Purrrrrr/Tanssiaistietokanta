import type { Params, ServiceInterface } from '@feathersjs/feathers'
import { Middleware } from '@feathersjs/koa'
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { koaMiddleware } from "@as-integrations/koa";
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeResolvers } from '@graphql-tools/merge'
import { logger } from '../../logger'

import type { Application } from '../../declarations'
import { ErrorWithStatus } from '../../hooks/addErrorStatusCode';
import { GraphQLError } from 'graphql';
import { addLogData } from '../../requestLogger';
import { withAccessParams } from '../access/hooks';

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

export const graphqlServiceMiddleware = (): Middleware<Application> => {
  let middleware: Middleware<Application> | undefined
  return async (ctx, next) => {
    if (middleware === undefined) {
      middleware = await ctx.app.service('graphql')?.getMiddleware()
      if (middleware === null) {
        middleware = (_, next) => next()
      }
    }
    await middleware(ctx, next)
  }
}

export class GraphqlService<ServiceParams extends GraphqlParams = GraphqlParams>
  implements ServiceInterface<Graphql, GraphqlData, ServiceParams, GraphqlPatch>
{
  private apolloMiddleware: Middleware<any>
  private apolloServerPromise: Promise<ApolloServer>
  private resolveApolloServer: (server: ApolloServer) => void = () => {}

  constructor(public options: GraphqlServiceOptions) {
    const { promise, resolve } = Promise.withResolvers<ApolloServer>()
    this.apolloServerPromise = promise
    this.resolveApolloServer = resolve

    const pathRegex = new RegExp(`^${options.path}(/.*')?$`)
    const innerMiddleWarePromise = this.apolloServerPromise.then(server =>
      koaMiddleware(server, {
        context: async ({ ctx }) => ({ token: ctx.headers.token }),
      })
    )
    this.apolloMiddleware = async (ctx, next) => {
      if (pathRegex.test(ctx.request.url)) {
        const innerApolloMiddleware = await innerMiddleWarePromise
        await innerApolloMiddleware(ctx, next)
        return
      }
      await next();
    }
  }

  async find(_params?: ServiceParams): Promise<Graphql> {
    if (!_params) throw new Error('Params needed')
    const {query, ...contextValue} = _params
    addLogData('graphqlQuery', this.getQueryName(query))
    addLogData('variables', query.variables)
    const server = await this.apolloServerPromise
    const res = await withAccessParams({ user: _params.user }, () => server.executeOperation(query, { contextValue }))
    const { body } = res
    if (body.kind === 'single') {
      if (body.singleResult.errors) {
        addLogData('graphqlErrors', body.singleResult.errors)
      }
      return body.singleResult
    }
    throw new Error('Can\'t handle result body of type '+body.kind)
  }

  private getQueryName(query: any): string | null {
    if (typeof query === 'string') {
      const match = query.match(/(query|mutation|subscription)\s+([a-zA-Z0-9_]+)/)
      if (match && match[2]) {
        return match[2]
      }
      return null
    }
    
    const operation = query?.query?.definitions?.find(
      (def: any) => def.kind === "OperationDefinition"
    )

    return operation?.name?.value ?? null
  }

  async getMiddleware(_params?: ServiceParams): Promise<Middleware> {
    return this.apolloMiddleware
  }

  async setup(app: Application, _path: string): Promise<void> {
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
      typeDefs: this.options.schema,
      formatError: (formattedError, error) => {
        if (error instanceof GraphQLError) {
          const { originalError } = error
          if (originalError instanceof ErrorWithStatus) {
            return originalError.result
          }
        }
        return formattedError
      },
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

export const getOptions = (app: Application, path: string, schema: string) => {
  return { app, path, schema }
}
