import { getHeaderData } from "./markdownUtils";
import { ParsedPage } from "./wikiApi";

const suscpiciousWords = new RegExp(
  [
    'penis',
    'services',
    'crypto',
    'gambling',
    'casino',
    'locksmith',
    'Kansas',
    'security',
    'secure',
    'offer',
    'enhance',
    'professional',
    'quality',
    'emergency',
    'hack',
    '^[ \\p{Letter}]{2,}\\d+',
    'industrial',
    'client',
    'tech',
    'dryer',
    'machine',
    'advanced',
    'electromec',
    'investing',
    'glock',
    'mining',
    'weed',
    'cheat',
    'roxicodone',
    'manufacture',
    'marijuana',
    // Non latin letters
    '[\\P{Script=Latn}&&\\p{Letter}]',
  ].join('|'),
  'vi'
)

interface PageToScore {
  name: string
  instructions: string | null
  revision?: ParsedPage['revision'] 
}

export function spamScore(page: PageToScore): number {
  const { name, instructions, revision } = page
  const onlyOneRevision = revision?.parent === 0

  const text = (name+'\n\n'+(instructions ?? ''))
  const parts = text.split(/\n\n/)
  const headingCount = parts.filter(getHeaderData).length

  let score = 0
  if (onlyOneRevision) {
    score += 0.2
  }
  if (headingCount === 0) {
    score += 0.2
  }
  const countsInTitle = countSuspicious(name)
  const countsInContents = countSuspicious(instructions ?? '')

  score += countsInTitle.quotinent * 50
  score += countsInContents.quotinent * 50
    
  // console.log({
  //   title: name,
  //   onlyOneRevision, headingCount, countsInContents, countsInTitle, score
  // })

  return score
}

function countSuspicious(text: string) {

  const words = text.split(/\s+/)
  const wordCount = words.length
  const suscpiciousWordCount = words.reduce(
    (count, word) => {
      const match = word.match(suscpiciousWords)
      // if (match) console.log(match)
      return match ? count + 1 : count
    },
    0,
  )

  return {
    wordCount, suscpiciousWordCount,
    quotinent: wordCount > 0 ? suscpiciousWordCount / wordCount : 0,
  }
}
