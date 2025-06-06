export function getHeaderData(text: string) {
  let match = text.match(HEADER_REGEX_1)
  if (match) {
    return {
      level: 1,
      content: match[1].trim()
    }
  }
  match = text.match(HEADER_REGEX_2)
  if (match) {
    return {
      level: 2,
      content: match[1].trim()
    }
  }
  match = text.match(HEADER_REGEX_HASH)
  if (match) {
    //Return header level
    return {
      level: match[1].length,
      content: match[2].trim(),
    }
  }
  return null
}

/** Returns names of the pages that are linked to in the text */
export function getLinkedInternalPages(text: string) {
  return Array.from(text.matchAll(INTERNAL_LINK_REGEX))
    .map(match => match[1])
}

export function stripLinks(text: string): string {
  return text.replace(INTERNAL_LINK_REGEX, (_, linkText) => {
    return linkText
  }).replace(EXTERNAL_LINK_REGEX, (_, link, linkText) => {
    return linkText || link
  })
}

const HEADER_REGEX_1 = /^([^#].*)\n===+$/
const HEADER_REGEX_2 = /^([^#].*)\n---+$/
const HEADER_REGEX_HASH = /^(#+) *\[?([^\n[\]]*[^\n[\]: ])/
const INTERNAL_LINK_REGEX = /\[([^\]]+)\]\(.* "wikilink"\)/g
const EXTERNAL_LINK_REGEX = /\[([^ \]]+)( [^\]]+)?\]/g
