import type { Id, Params, ServiceInterface } from '@feathersjs/feathers'

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
  noThrowOnNotFound?: boolean
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
    pendingPromise: Promise<DanceCategorization> | null
  } = {
    categories: null,
    fetchedAt: null,
    pendingPromise: null,
  }

  constructor(public options: DancewikiServiceOptions) {
    this.storageService = new NeDBService({ ...options, dbname: 'dancewiki' })
  }

  async find(_params?: ServiceParams): Promise<Dancewiki[]> {
    const params = this.fixParams(_params)
    if (_params?.updateFromWiki) {
      await this.updatePageList()
    }
    const data = await this.storageService.find(params)
    return await Promise.all(data.map(page => this.addData(page, _params)))
  }

  fixParams(_params?: ServiceParams): ServiceParams | undefined {
    if (_params?.query && ('name' in _params.query)) {
      const { name, ...query } = _params.query
      return this.fixParams({ ..._params, query: { 
        ...query,
        _id: name,
      }})
    }
    if (_params?.query?.$select?.includes('name')) {
      const { $select, ...query } = _params.query
      return { ..._params, query: { 
        ...query,
        $select: ['_id', ...$select],
      }}
    }
    return _params
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

      return this.addData(result, _params)
    } catch (e) {
      if (_params?.updateFromWiki && typeof id === 'string') {
        return await this.create({ name: id })
      }
      if (_params?.noThrowOnNotFound) {
        return {
          _id: String(id),
          _fetchedAt: new Date().toISOString(),
          name: String(id),
          status: 'NOT_FOUND',
          instructions: null,
          formations: [],
          categories: [],
        }
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

  async addData(data: StoredDanceWiki, params?: ServiceParams): Promise<Dancewiki> {
    const { originalInstructions, instructions, ...rest } = data
    const name = data._id
    const isSelected = (field: keyof Dancewiki) =>
      params?.query?.$select === undefined || params?.query?.$select?.includes(field)

    return {
      ...rest,
      name,
      status: isSelected('status') ?
        data._fetchedAt === null
          ? 'UNFETCHED'
          : instructions === null ? 'NOT_FOUND' : 'FETCHED'
        : 'UNFETCHED', // Just some default value
      instructions: isSelected('instructions') ? cleanupInstructions(instructions) : '',
      formations: isSelected('formations') ? getFormations(instructions) : [],
      categories: isSelected('categories')
        ? await this.getCategories(name, instructions)
        : [],
    }
  }

  private async getCategories(name: string, instructions: string | null) {
    // Prevent infinite loop when fetching the categories page itself
    const categoryCache = name === categoriesPage
      ? {}
      : await this.getCategoryCache()

    return uniq([
      ...getCategoriesFromContent(instructions),
      ...(categoryCache[name] ?? [])
    ])
  }

  private async getCategoryCache(): Promise<DanceCategorization> {
    const { categories, fetchedAt, pendingPromise } = this.categoryCache
    if (pendingPromise) return pendingPromise
    if (categories === null || !fetchedAt || fetchedAt.valueOf() < new Date().valueOf() - DAY) {
      this.categoryCache.pendingPromise = this.fetchCategoryCache()
      return this.categoryCache.pendingPromise
    }

    return categories
  }

  private async fetchCategoryCache(): Promise<DanceCategorization> {
    const page = await this.get(categoriesPage, { updateFromWiki: true } as ServiceParams)
    const categories = getDanceCategorization(page.instructions ?? '')
    this.categoryCache = {
      fetchedAt: new Date(), categories, pendingPromise: null,
    }
    return categories
  }

}

export const getOptions = (app: Application) => {
  return { app }
}
