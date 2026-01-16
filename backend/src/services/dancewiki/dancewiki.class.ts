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
import { equals, uniq } from 'ramda'
import { Cache, createCache } from './utils/cache'
import { spamScore } from './utils/spamScore'
import { getSources } from './utils/getSources'
import { logger, withRequestLogging } from '../../requestLogger'

export type { Dancewiki, DancewikiData, DancewikiQuery }

export interface DancewikiServiceOptions {
  app: Application
}

export interface DancewikiParams extends Params<DancewikiQuery> {
  noThrowOnNotFound?: boolean
}

type StoredDanceWiki = Dancewiki

const DAY = 24 * 60 * 60 * 1000
const categoriesPageName = 'Tanssiohjeet'
const CURRENT_METADATA_VERSION = 1.002

const UNFETCHED_DANCE = {
  status: 'UNFETCHED' as const,
  spamScore: 0,
  _fetchedAt: null,
  instructions: null,
  categories: [],
  formations: [],
  sources: [],
  revision: null,
  metadataVersion: null,
}

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
      const page = await this.has(categoriesPageName)
        ? await this.get(categoriesPageName)
        : await this.create({ name: categoriesPageName})

      return getDanceCategorization(page.instructions ?? '')
    }, DAY)

    // Update list of pages hourly
    cron.schedule('0 * * * *', () => this.updatePageList())
    cron.schedule('*/5 * * * *', this.backgroundFetch.bind(this))
    setTimeout(() => this.backgroundFetch(), 0)
  }

  backgroundFetch = withRequestLogging('dancewikis', 'backgroundFetch', async(): Promise<void> => {
    logger.info('Updating dance wiki entries')
    const MAX_PAGES_TO_FETCH = 50

    const pageCount = await this.storageService.getModel().countAsync({})
    if (pageCount === 0) {
      await this.updatePageList()
    }
    if (!this.categories.isValid()) {
      await this.categories.get()
      await this.updatePageMetadata()
    }

    const unfetched = await this.storageService.find({ query: { _fetchedAt: null } })

    if (unfetched.length > 0) {
      const pagesToFetch = unfetched.slice(0, MAX_PAGES_TO_FETCH).map(page => page._id)
      logger.info(`${unfetched.length} unfetched wiki entries fetching ${pagesToFetch.length}`)
      await this.fetchPages(pagesToFetch)
      return
    }

    const lastWeek = new Date(new Date().valueOf() - 7 * DAY).toISOString()
    const stale = await this.storageService.find({ query: {
      _fetchedAt: { $lt: lastWeek },
      spamScore: { $lt: 1 },
      $limit: MAX_PAGES_TO_FETCH }
    })
    if (stale.length > 0) {
      const pagesToFetch = stale.map(page => page._id)
      logger.info(`fetching ${stale.length} stale wiki entries`)
      await this.fetchPages(pagesToFetch)
    }
  })

  updatePageList = withRequestLogging('dancewikis', 'updatePageList', async () => {
    logger.info('Updating dancewiki page list')
    const pagesInWiki = await getPageList()
    const pagesInStorage = await this.storageService.find()
    const existingPageNames = new Set(pagesInStorage.map(page => page._id))

    const pagesToCreate = pagesInWiki.filter(name => !existingPageNames.has(name))
    return Promise.all(
      pagesToCreate.map(name => {
        const data = {
          _id: name,
          name,
          ...UNFETCHED_DANCE,
        }
        data.spamScore = spamScore(data)
        this.storageService.create(data)
      })
    )
  })

  async updatePageMetadata() {
    const categoriesPage = await this.get(categoriesPageName)
    const categoriesTimestamp = categoriesPage.revision?.timestamp ?? ''
    const pagesToUpdate = (await this.storageService.find({
      query: {
        status: 'FETCHED',
      }
    })).filter(page =>
      (page._fetchedAt ?? '') < categoriesTimestamp || !page.metadataVersion || page.metadataVersion && page.metadataVersion < CURRENT_METADATA_VERSION
    )
    const pagesToStore = pagesToUpdate.map(page => {
      const updated = this.computeMetadata(page)
      if (equals(updated, page)) return null
      return updated
    }).filter(page => page !== null)
    if (pagesToStore.length > 0) {
      logger.info(`Updating metadata for ${pagesToStore.length} pages`)
      await Promise.all(pagesToStore.map(page => this.storageService.update(page.name, page)))
    }
  }

  async has(name: string) {
    const count = await this.storageService.getModel().countAsync({ name, status: { $ne: 'NOT_FOUND' }})
    return count > 0
  }

  async find(_params?: ServiceParams): Promise<Dancewiki[]> {
    const data = await this.storageService.find(_params)
    return data.map(page => this.addData(page))
  }

  async get(id: Id, _params?: ServiceParams): Promise<Dancewiki> {
    try {
      const result = await this.storageService.get(id, _params)
      return this.addData(result)
    } catch (e) {
      if (_params?.noThrowOnNotFound) {
        return {
          _id: String(id),
          name: String(id),
          ...UNFETCHED_DANCE,
          _fetchedAt: new Date().toISOString(),
          status: 'NOT_FOUND',
        }
      }
      throw e
    }
  }

  async update(id: string | null, data: DancewikiData, params?: ServiceParams): Promise<Dancewiki | Dancewiki[]> {
    if (id) {
      return this.create({ name: id}, params)
    }
    return this.create(data, params)
  }

  async create(data: DancewikiData, params?: ServiceParams): Promise<Dancewiki>
  async create(data: DancewikiData[], params?: ServiceParams): Promise<Dancewiki[]>
  async create(
    data: DancewikiData | DancewikiData[],
    _params?: ServiceParams
  ): Promise<Dancewiki | Dancewiki[]> {
    if (Array.isArray(data)) {
      const created = await this.fetchPages(data.map(p => p.name))
      return created.map(page => this.addData(page))
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
    const instructions = hasContents ? cleanupInstructions(await convertToMarkdown(contents)) : null
    const dataToCreate : StoredDanceWiki = this.computeMetadata({
      _id: page.title,
      name: page.title,
      status: hasContents ? 'FETCHED' : 'NOT_FOUND',
      _fetchedAt: now,
      instructions,
      revision: page.revision ?? null
    })

    const existing = await this.has(page.title)
    return existing
      ? await this.storageService.update(page.title, dataToCreate) as StoredDanceWiki
      : await this.storageService.create(dataToCreate)
  }

  computeMetadata(page: Omit<StoredDanceWiki, 'spamScore' | 'formations' | 'categories' | 'sources' | 'metadataVersion'>): StoredDanceWiki {
    const result = {
      ...page,
      spamScore: 0,
      formations: getFormations(page.instructions),
      categories: this.getCategories(page.name, page.instructions),
      sources: getSources(page.instructions),
      metadataVersion: CURRENT_METADATA_VERSION,
    }
    result.spamScore = spamScore(result)
    return result
  }

  addData(data: StoredDanceWiki): Dancewiki {
    return data
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
