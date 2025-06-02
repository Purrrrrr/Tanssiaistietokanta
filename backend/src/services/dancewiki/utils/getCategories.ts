import {getLinkedInternalPages, getHeaderData, stripLinks} from './markdownUtils'

const categoryTagRegex = /<Luokka:([^>]+)>/g
const categoryLinkRegex = /\[Luokka:([^\]]+)\]\(Luokka:.* "wikilink"\)/g

export function getCategoriesFromContent(content: string | null) {
  if (content === null) return []
  const categoryTags = content.matchAll(categoryTagRegex)
  const categoryLinks = content.matchAll(categoryLinkRegex)

  return [...categoryTags, ...categoryLinks].map(match => match[1])
}

export function getDanceCategorization(indexPageContents: String) {
  let currentCategories : CategoryHeading[] = []
  const danceCategorization : DanceCategorization = {}

  for (const part of indexPageContents.split(/\n+/)) {
    const header = getHeaderData(part)
    if (header) {
      const { level, content } = header
      currentCategories = [
        ...currentCategories.filter(category => category.level < level),
        {
          level,
          content: stripLinks(content)
        }
      ]
    } else {
      // Normal text content
      for (const danceName of getLinkedInternalPages(part)) {
        danceCategorization[danceName] = currentCategories.map(category => category.content)
      }
    }
  }

  return danceCategorization
}

export type DanceCategorization = Record<string, string[]>

interface CategoryHeading {
  level: number
  content: string
}
