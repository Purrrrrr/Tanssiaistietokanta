export function getHeaderData(text: string) {
  const match = text.match(HEADER_REGEX)
  if (match) {
    //Return header level
    return {
      level: match[1].length,
      content: match[2],
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

const HEADER_REGEX = /^(=+)([^=\n]([^\n]*[^=\n])?)\1$/
const INTERNAL_LINK_REGEX = /\[\[([^\]]+)\]\]/g
const EXTERNAL_LINK_REGEX = /\[([^ \]]+)( [^\]]+)?\]/g
