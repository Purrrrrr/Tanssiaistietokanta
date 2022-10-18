export function parseMediawiki(markdown) {
  return markdown.split(/\n+/).map(parseParagraph)
}

function parseParagraph(paragraph) {
  const header = paragraph.match(HEADER_REGEX)
  if (header) {
    const [, equalSigns, content] = header
    return {
      type: 'header',
      depth: equalSigns.length,
      content
    }
  }
  
  return {
    type: 'other',
    content: paragraph,
  }
}

export function getInternalLinks(text) {
  return Array.from(text.matchAll(INTERNAL_LINK_REGEX)).map(match => ({
    link: match[1]
  }))
}

export function stripLinks(text) {
  return text.replace(INTERNAL_LINK_REGEX, (_, linkText) => {
    return linkText
  }).replace(EXTERNAL_LINK_REGEX, (_, link, linkText) => {
    return linkText || link 
  })
}

const HEADER_REGEX = /^(=+)([^=\n]([^\n]*[^=\n])?)\1$/
const INTERNAL_LINK_REGEX = /\[\[([^\]]+)\]\]/g
const EXTERNAL_LINK_REGEX = /\[([^ \]]+)( [^\]]+)?\]/g
