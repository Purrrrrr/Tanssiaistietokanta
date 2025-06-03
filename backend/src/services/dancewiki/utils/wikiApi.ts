const wikiUrl = 'https://tanssi.dy.fi'

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

export async function getWikiPage(title: string): Promise<ParsedPage | null> {
  const encodedTitle = encodeURIComponent(title)
  const url = `${wikiUrl}/api.php?action=query&prop=revisions&titles=${encodedTitle}&rvprop=content&continue=&format=json&origin=*`
  const res = await get(url)

  const { pages } = res.query
  const page = Object.values(pages)[0] as Page

  if (!page.pageid) {
    return null
  }
  return {
    title: page.title,
    contents: page.revisions[0]['*']
  }
}

function get(url: string) {
  return fetch(url).then(res => res.json())
}

interface Page {
  title: string
  pageid: string
  revisions: {
    '*': string
  }[]
}

export interface ParsedPage {
  title: string
  contents: string
}
