import {getWikiPage} from './wikiApi'
import {parseMediawiki, getInternalLinks, stripLinks} from './format/mediawiki'

export async function getCategories(danceName, instructions) {
  const categoriesFromContent = getCategoriesFromContent(instructions)
  if (categoriesFromContent.length > 0) return categoriesFromContent

  return await getCategoriesFromDanceIndex()
    .then(danceCategories => danceCategories[danceName] ?? [])
}

const categoryTagRegex = /<Luokka:([^>]+)>/g
const categoryLinkRegex = /\[Luokka:([^\]]+)\]\(Luokka:.* "wikilink"\)/g

function getCategoriesFromContent(content) {
  const categoryTags = content.matchAll(categoryTagRegex)
  const categoryLinks = content.matchAll(categoryLinkRegex)

  return [...categoryTags, ...categoryLinks].map(match => match[1])
}

let categoryCache = null

function getCategoriesFromDanceIndex() {
  if (categoryCache) return Promise.resolve(categoryCache)
  return getWikiPage('Tanssiohjeet')
    .then(parsePage)
    .then(categories => {
      return categoryCache = categories
    })
}

function parsePage({contents}) {
  let cats = []
  const dances = {}

  parseMediawiki(contents).forEach(({type, content, depth}) => {
    if (type === 'header') {
      cats = cats.filter(cat => cat.depth < depth)
      cats.push({depth, content: stripLinks(content)})
    } else {
      getInternalLinks(content).forEach(({link}) => {
        dances[link] = cats.map(cat => cat.content)
      })
    }
  })
  return dances
}
