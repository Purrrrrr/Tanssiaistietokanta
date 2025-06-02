import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Dancewiki, DancewikiData, DancewikiQuery } from './dancewiki.schema'
import { NeDBService } from '../../utils/NeDBService'
import { getPageList, getWikiPage } from './utils/wikiApi'
import convertToMarkdown from '../convert/pandoc'
import { cleanupInstructions } from './utils/cleanupInstructions'
import { DanceCategorization, getCategoriesFromContent, getDanceCategorization } from './utils/getCategories'
import { getFormations } from './utils/getFormations'
import { uniq } from 'ramda'

export type { Dancewiki, DancewikiData, DancewikiQuery }

export interface DancewikiServiceOptions {
  app: Application
}

export interface DancewikiParams extends Params<DancewikiQuery> {
  updateFromWiki?: boolean
}

interface StoredDanceWiki extends Pick<Dancewiki, '_id' | '_fetchedAt' | 'instructions'> {
  originalInstructions: string | null
}

const DAY = 24 * 60 * 60 * 1000
const categoriesPage = 'Tanssiohjeet'

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class DancewikiService<ServiceParams extends DancewikiParams = DancewikiParams>
  implements ServiceInterface<Dancewiki, DancewikiData, DancewikiParams, never>
{
  storageService: NeDBService<StoredDanceWiki, StoredDanceWiki, DancewikiParams, never>
  categoryCache: {
    categories: DanceCategorization | null
    fetchedAt: Date | null
  } = {
    categories: null,
    fetchedAt: null
  }

  constructor(public options: DancewikiServiceOptions) {
    this.storageService = new NeDBService({ ...options, dbname: 'dancewiki' })
  }

  async find(_params?: ServiceParams): Promise<Dancewiki[]> {
    if (_params?.updateFromWiki) {
      await this.updatePageList()
    }
    const data = await this.storageService.find(_params)
    return Promise.all(data.map(page => this.addData(page)))
  }

  async updatePageList() {
    const pagesInWiki = await getPageList()
    const pagesInStorage = await this.storageService.find()
    const existingPageNames = new Set(pagesInStorage.map(page => page._id))
    
    const pagesToCreate = pagesInWiki.filter(name => !existingPageNames.has(name))
    return Promise.all(
      pagesToCreate.map(name => this.storageService.create({
        _id: name,
        _fetchedAt: null,
        originalInstructions: null,
        instructions: null,
      }))
    )
  }

  async get(id: Id, _params?: ServiceParams): Promise<Dancewiki> {
    try {
      const result = await this.storageService.get(id, _params)
      if (_params?.updateFromWiki && result.instructions === null)  {
        throw new Error('initiate refetch')
      }

      return this.addData(result)
    } catch (e) {
      if (_params?.updateFromWiki && typeof id === 'string') {
        return await this.create({ name: id })
      }
      throw e
    }
  }

  async create(data: DancewikiData, params?: ServiceParams): Promise<Dancewiki>
  async create(data: DancewikiData[], params?: ServiceParams): Promise<Dancewiki[]>
  async create(
    data: DancewikiData | DancewikiData[],
    params?: ServiceParams
  ): Promise<Dancewiki | Dancewiki[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)))
    }
    const now = new Date().toISOString()

    const page = await getWikiPage(data.name)
    const dataToCreate : StoredDanceWiki = page
      ? {
        _id: page.title,
        _fetchedAt: now,
        originalInstructions: page.contents,
        instructions: await convertToMarkdown(page.contents),
      } : {
        _id: data.name,
        _fetchedAt: now,
        originalInstructions: null,
        instructions: null,
      }
    
    const existing = await this.storageService.find({ query: {_id: data.name}})
    const created = existing.length > 0
      ? await this.storageService.update(data.name, dataToCreate) as StoredDanceWiki
      : await this.storageService.create(dataToCreate)
    return this.addData(created)
  }

  async addData(data: StoredDanceWiki): Promise<Dancewiki> {
    const { originalInstructions, instructions, ...rest } = data
    const name = data._id
    const status = data._fetchedAt === null
      ? 'UNFETCHED'
      : instructions === null ? 'NOT_FOUND' : 'FETCHED'
    // Prevent infinite loop when fetching the categories page itself
    const categoryCache = name === categoriesPage
      ? {}
      : await this.getCategoryCache()

    return {
      ...rest,
      name,
      status,
      instructions: cleanupInstructions(instructions),
      formations: getFormations(instructions),
      categories: uniq([
        ...getCategoriesFromContent(instructions),
        ...(categoryCache[data._id] ?? [])
      ]),
    }
  }

  private async getCategoryCache(): Promise<DanceCategorization> {
    const { categories, fetchedAt } = this.categoryCache
    if (categories === null || !fetchedAt || fetchedAt.valueOf() < new Date().valueOf() - DAY) {
      const page = await this.get(categoriesPage, { updateFromWiki: true } as ServiceParams)
      this.categoryCache.categories = getDanceCategorization(page.instructions ?? '')
      return this.categoryCache.categories
    }

    return categories
  }

}

export const getOptions = (app: Application) => {
  return { app }
}
