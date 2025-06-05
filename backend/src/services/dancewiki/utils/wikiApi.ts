const wikiUrl = 'https://tanssi.dy.fi'

interface Page {
  title: string
  pageid: number
  revisions: Revision[]
}

interface Revision {
  revid: number,
  parentid: number,
  timestamp: string
  slots: {
    main: {
      '*': string
    }
  }
}

export interface ParsedPage {
  id: number
  title: string
  revision?: {
    id: number
    parent: number
    timestamp: string
    contents: string
  }
}

export async function getPageList(): Promise<string[]> {
  const baseUrl = `${wikiUrl}/api.php?action=query&list=allpages&aplimit=max&format=json`
  const results = []
  let continueToken : string | null = null;

  do {
    const url = continueToken ? `${baseUrl}&apcontinue=${encodeURIComponent(continueToken)}` : baseUrl
    const res = await(get(url))
    continueToken = res.continue?.apcontinue ?? null

    results.push(...res.query.allpages.map((page: Page) => page.title))
  } while(continueToken)
  
  return results
}

export async function getWikiPages(titles: string[]): Promise<ParsedPage[]> {
  const encodedTitle = titles.map(encodeURIComponent).join('|')
  const pages = await fetchWikiPages(encodedTitle)

  return pages.map(parsePage)
}

export async function getWikiPage(title: string | string[]): Promise<ParsedPage> {
  const encodedTitle = Array.isArray(title) ? title.map(encodeURIComponent).join('|') : encodeURIComponent(title)
  const [page] = await fetchWikiPages(encodedTitle)

  return parsePage(page)
}

async function fetchWikiPages(encodedTitle: string) {
  const url = `${wikiUrl}/api.php?action=query&prop=revisions&rvprop=ids|timestamp|content&rvslots=main&format=json&origin=*&titles=${encodedTitle}`
  // console.log(url)
  const res = await get(url)

  const { pages, normalized } = res.query
  const pageList = Object.values(pages) as Page[]
  if (!normalized) {
    return pageList
  }
  const replacements = Object.fromEntries(
    normalized.map(({from, to}: {from: string, to: string}) => [to, from])
  ) 

  return pageList.map(page => {
    if (page.title in replacements) {
      return {
        ...page,
        title: replacements[page.title]
      }
    }
    return page
  })
}

function get(url: string) {
  return fetch(url).then(res => res.json())
}

function parsePage(page: Page): ParsedPage {
  if (!page.pageid) {
    return {
      id: 0,
      title: page.title,
    }
  }
  const { revid, timestamp, parentid, slots }= page.revisions[0]

  return {
    id: page.pageid,
    title: page.title,
    revision: {
      id: revid,
      parent: parentid,
      timestamp,
      contents: slots.main['*'],
    },
  }
}
