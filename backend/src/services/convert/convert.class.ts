// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Convert, ConvertData, ConvertQuery } from './convert.schema'

import pandoc from './pandoc'

export type { Convert, ConvertData, ConvertQuery }

export interface ConvertServiceOptions {
  app: Application
}

export interface ConvertParams extends Params<ConvertQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ConvertService<ServiceParams extends ConvertParams = ConvertParams>
implements ServiceInterface<Convert, ConvertData, ServiceParams> {
  constructor(public options: ConvertServiceOptions) {}

  async find(_params?: ServiceParams): Promise<Convert> {
    if (_params?.query === undefined) throw new Error('Query needed')
    const { input, inputFormat, outputFormat } = _params.query
    return await pandoc(input, inputFormat, outputFormat)
  }

  async create(data: ConvertData): Promise<Convert> {
    const { input, inputFormat, outputFormat } = data
    return await pandoc(input, inputFormat, outputFormat)
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
