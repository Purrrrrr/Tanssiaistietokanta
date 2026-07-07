// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'

import { classRegistry, StaticCanvas } from 'fabric'
import { JSDOM } from 'jsdom'
import { Arrowline } from './Arrowline'

classRegistry.setClass(Arrowline)

type Diagram = string
interface DiagramData {
  data: object
  width: number
  height: number
  hash: string
}
type DiagramQuery = any

export type { Diagram, DiagramData, DiagramQuery }

export interface DiagramServiceOptions {
  app: Application
}

export interface DiagramParams extends Params<DiagramQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class DiagramService<ServiceParams extends DiagramParams = DiagramParams>
implements ServiceInterface<Diagram, DiagramData, ServiceParams> {
  constructor(public options: DiagramServiceOptions) {}

  async get(_id: Id, _params?: ServiceParams): Promise<Diagram> {
    return ''
  }

  async create(data: DiagramData, params?: ServiceParams): Promise<Diagram>
  async create(data: DiagramData[], params?: ServiceParams): Promise<Diagram[]>
  async create(data: DiagramData | DiagramData[], params?: ServiceParams): Promise<Diagram | Diagram[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)))
    }

    return fabricJsonToSvg(data)
  }
}

export async function fabricJsonToSvg(
  fabricJson: DiagramData,
): Promise<string> {
  // Fabric requires a DOM in Node
  const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>')

  global.window = window as any
  global.document = window.document as any

  const canvas = new StaticCanvas(undefined, {
    width: fabricJson.width,
    height: fabricJson.height,
  })
  await canvas.loadFromJSON(fabricJson.data)

  return canvas.toSVG()
}

export const getOptions = (app: Application) => {
  return { app }
}
