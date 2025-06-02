import {titleCase} from './titleCase'

export function getFormations(instructions: string | null) {
  if (!instructions) return []
  //The formation is usually found in the first two parts of the instructions
  //The rest often contains words that are not the true formation
  //but match our guesses
  const firstParts = toParts(instructions).slice(0, 2).join(' ')

  const formations = []
  for (const [formationGuess, regexes] of Object.entries(formationRegexes)) {
    for (const regex of regexes) {
      const match = firstParts.match(regex)
      if (match) {
        formations.push({guess: formationGuess, length: match[0].length})
      }
    }
  }
  formations.sort((a, b) => b.length - a.length) //Longest match first

  return unique(
    formations.map(f => titleCase(f.guess))
  )
}

function toParts(markdown: string) {
  const parts = markdown.split(headerRegex).filter(text => text.trim().length > 0)
  return parts.length > 0 ? parts : ['']
}
const headerRegex = /\n((?=#+.+\n)|(?=.+\n=+\n)|(?=.+\n-+\n))/gm

function unique(words: string[]) {
  return [...new Set(words)]
}

const possibleFillerWord = '[^ ]*'
const formationRegexes = {
  'piiri': [
    regex(wordPrefix('piiri')),
  ],
  'paripiiri': [
    regex(wordPrefix('parei'), wordPrefix('piiri')), //pareittain piirin kehällä/piirissä
    regex(wordPrefix('paripiiri')),
    regex(wordPrefix('parijonopiiri')),
  ],
  'riveissä': [
    regex(wordPrefix('rivi')),
    regex(wordPrefix('rivei'))
  ],
  //Kolmen henkilön rivissä
  //kolmelle tanssijalle rivissä
  'neljän parin neliö': [
    regex(wordPrefix('(neljä|4)'), wordPrefix('pari'), wordPrefix('neliö'))
  ],
  'neliö': [
    regex(wordPrefix('neliö')),
  ],
  'solatanssi': [
    regex(wordPrefix('sola')),
    regex(word('solissa'))
  ],
  'bordonialainen solatanssi': [
    regex(wordPrefix('bordonial'), '(sola|solissa)'),
  ],
  'progressiivinen solatanssi': [
    regex(wordPrefix('progressii'), possibleFillerWord, wordPrefix('(sola|solissa)')),
  ],
  'kolmen parin jono': [
    regex(wordPrefix('(kolme|3)'), wordPrefix('pari'), wordPrefix('(pari)?jono')),
  ],
  'neljän parin jono': [
    regex(wordPrefix('(neljä|4)'), wordPrefix('pari'), wordPrefix('(pari)?jono')),
  ],
  'parijono': [
    regex(wordPrefix('parijon')),
    regex(wordPrefix('pari'), wordPrefix('jono')),
    //neljän parin parijonossa
  ],
  'paritanssi': [
    regex(wordPrefix('paritanssi')),
    regex(wordPrefix('yhdelle parille')),
  ],
/* Muuta:
  x paria
  x-y paria
  pitkissä riveissä?
*/
}

function word(word: string) {return `\\b${word}\\b` }
function wordPrefix(word: string) {return `\\b${word}[^ ]*\\b` }
function regex(...words: string[]) { return new RegExp(words.join(' *'), 'ig') }
