import type { Id, Params, ServiceInterface } from '@feathersjs/feathers'
import cron from 'node-cron'

import type { Application } from '../../declarations'
import type { Dancewiki, DancewikiData, DancewikiQuery } from './dancewiki.schema'
import { NeDBService } from '../../utils/NeDBService'
import { getPageList, getWikiPage, getWikiPages, ParsedPage } from './utils/wikiApi'
import convertToMarkdown from '../convert/pandoc'
import { cleanupInstructions } from './utils/cleanupInstructions'
import { DanceCategorization, getCategoriesFromContent, getDanceCategorization } from './utils/getCategories'
import { getFormations } from './utils/getFormations'
import { uniq } from 'ramda'
import { Cache, createCache } from './utils/cache'

export type { Dancewiki, DancewikiData, DancewikiQuery }

export interface DancewikiServiceOptions {
  app: Application
}

export interface DancewikiParams extends Params<DancewikiQuery> {
  noThrowOnNotFound?: boolean
}

interface StoredDanceWiki extends Pick<Dancewiki, '_id' | 'name' | 'status' | '_fetchedAt' | 'instructions'> {
  originalInstructions: string | null
}

const DAY = 24 * 60 * 60 * 1000
const categoriesPage = 'Tanssiohjeet'

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class DancewikiService<ServiceParams extends DancewikiParams = DancewikiParams>
  implements ServiceInterface<Dancewiki, DancewikiData, DancewikiParams, never>
{
  storageService: NeDBService<StoredDanceWiki, StoredDanceWiki, DancewikiParams, never>
  categories : Cache<DanceCategorization>

  constructor(public options: DancewikiServiceOptions) {
    this.storageService = new NeDBService({
      ...options,
      dbname: 'dancewiki',
      id: 'name',
      indexes: [{
        fieldName: 'name',
        unique: true,
      }]
    })
    this.categories = createCache(async () => {
      const page = await this.has(categoriesPage)
        ? await this.get(categoriesPage)
        : await this.create({ name: categoriesPage})

      return getDanceCategorization(page.instructions ?? '')
    }, DAY)

    // Update list of pages daily
    cron.schedule('0 0 * * *', () => this.updatePageList())
    cron.schedule('0 */10 * * * *', this.backgroundFetch.bind(this))
  }

  async has(name: string) {
    const count = await this.storageService.getModel().countAsync({ name })
    return count > 0
  }
  
  async backgroundFetch(): Promise<void> {
    console.log('Updating dance wiki entries')
    const MAX_PAGES_TO_FETCH = 30

    const pageCount = await this.storageService.getModel().countAsync({})
    if (pageCount === 0) {
      await this.updatePageList()
    }

    if (!this.categories.isValid()) {
      await this.categories.get()
    }

    const unfetched = await this.storageService.find({ query: { _fetchedAt: null } })
    console.log(`${unfetched.length} unfetched wiki entries fetching ${Math.min(MAX_PAGES_TO_FETCH, unfetched.length)}`)
    
    if (unfetched.length > 0) {
      console.time('fetch')
      const pagesToFetch = unfetched.slice(0, MAX_PAGES_TO_FETCH).map(page => page._id)
      await this.fetchPages(pagesToFetch)
      console.timeEnd('fetch')
      console.log('pages fetched!')
      return
    }
  }

  async find(_params?: ServiceParams): Promise<Dancewiki[]> {
    const data = await this.storageService.find(_params)
    return await Promise.all(data.map(page => this.addData(page, _params)))
  }

  async updatePageList() {
    console.log('Updating dancewiki page list')
    const pagesInWiki = await getPageList()
    const pagesInStorage = await this.storageService.find()
    const existingPageNames = new Set(pagesInStorage.map(page => page._id))
    
    const pagesToCreate = pagesInWiki.filter(name => !existingPageNames.has(name))
    return Promise.all(
      pagesToCreate.map(name => this.storageService.create({
        _id: name,
        name,
        status: 'UNFETCHED',
        _fetchedAt: null,
        originalInstructions: null,
        instructions: null,
      }))
    )
  }

  async get(id: Id, _params?: ServiceParams): Promise<Dancewiki> {
    try {
      const result = await this.storageService.get(id, _params)
      return this.addData(result, _params)
    } catch (e) {
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
    _params?: ServiceParams
  ): Promise<Dancewiki | Dancewiki[]> {
    if (Array.isArray(data)) {
      const created = await this.fetchPages(data.map(p => p.name))
      return Promise.all(created.map(page => this.addData(page)))
    }
    const created = await this.fetchPage(data.name)
    return this.addData(created)
  }

  async fetchPage(name: string) {
    const page = await getWikiPage(name)
    return await this.storePage(page)
  }

  async fetchPages(names: string[]) {
    const pages = await getWikiPages(names)
    return await Promise.all(pages.map(page => this.storePage(page)))
  }

  async storePage(page: ParsedPage): Promise<StoredDanceWiki> {
    const now = new Date().toISOString()
    const hasContents = page.revision !== null
    const contents = page.revision?.contents ?? ''
    const dataToCreate : StoredDanceWiki = {
      _id: page.title,
      name: page.title,
      status: hasContents ? 'FETCHED' : 'NOT_FOUND',
      _fetchedAt: now,
      originalInstructions: contents,
      instructions: hasContents ? await convertToMarkdown(contents) : '',
    }
    
    const existing = await this.has(page.title)
    return existing
      ? await this.storageService.update(page.title, dataToCreate) as StoredDanceWiki
      : await this.storageService.create(dataToCreate)
  }

  addData(data: StoredDanceWiki, params?: ServiceParams): Dancewiki {
    const { originalInstructions, instructions, ...rest } = data
    const isSelected = (field: keyof Dancewiki) =>
      params?.query?.$select === undefined || params?.query?.$select?.includes(field)

    return {
      ...rest,
      instructions: isSelected('instructions') ? cleanupInstructions(instructions) : '',
      formations: isSelected('formations') ? getFormations(instructions) : [],
      categories: isSelected('categories')
        ? this.getCategories(data.name, instructions)
        : [],
    }
  }

  private getCategories(name: string, instructions: string | null) {
    const categoryCache = this.categories.getIfExists() ?? {}

    return uniq([
      ...getCategoriesFromContent(instructions),
      ...(categoryCache[name] ?? [])
    ])
  }

}

export const getOptions = (app: Application) => {
  return { app }
}
