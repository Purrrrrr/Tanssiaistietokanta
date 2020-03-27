import {titleCase} from './utils/titleCase'

export function getFormations(instructions) {
  //The formation is usually found in the first two parts of the instructions
  //The rest often contains words that are not the true formation
  //but match our guesses
  const firstParts = toParts(instructions).slice(0, 2).join(" ");

  const formations = [];
  for (const [guess, {regexes}]  of Object.entries(guesses)) {
    for (const regex of regexes) {
      const match = firstParts.match(regex);
      if (match) {
        formations.push({guess, length: match[0].length});
      }
    }
  }
  formations.sort((a,b) => b.length - a.length); //Longest match first

  return unique(
    formations.map(f => titleCase(f.guess))
  );
}

function toParts(markdown) {
  const parts = markdown.split(headerRegex).filter(text => text.trim().length > 0);
  return parts.length > 0 ? parts : [""];
}
const headerRegex = /\n((?=#+.+\n)|(?=.+\n=+\n)|(?=.+\n-+\n))/gm;

function unique(words) {
  return [...new Set(words)];
}

const possibleFillerWord = '[^ ]*';
const guesses = {
  'piiri': {
    regexes: [
      regex(wordPrefix('piiri')),
    ]
  },
  'paripiiri': {
    regexes: [
      regex(wordPrefix('parei'), wordPrefix('piiri')), //pareittain piirin kehällä/piirissä
      regex(wordPrefix('paripiiri')),
      regex(wordPrefix('parijonopiiri')),
    ]
  },
  'riveissä': {
    regexes: [
      regex(wordPrefix('rivi')),
      regex(wordPrefix('rivei'))
    ]
    //Kolmen henkilön rivissä 
    //kolmelle tanssijalle rivissä
  },
  'neljän parin neliö': {
    regexes: [
      regex(wordPrefix('(neljä|4)'), wordPrefix('pari'), wordPrefix('neliö'))
    ]
  },
  'neliö': {
    regexes: [
      regex(wordPrefix('neliö')),
    ]
  },
  'solatanssi': {
    regexes: [
      regex(wordPrefix('sola')),
      regex(word('solissa'))
    ] 
  },
  'bordonialainen solatanssi': {
    regexes: [
      regex(wordPrefix('bordonial'), wordPrefix('(sola|solissa)')),
    ] 
  },
  'progressiivinen solatanssi': {
    regexes: [
      regex(wordPrefix('progressii'), possibleFillerWord, wordPrefix('(sola|solissa)')),
    ] 
  },
  'kolmen parin jono': {
    regexes: [
      regex(wordPrefix('(kolme|3)'), wordPrefix('pari'), wordPrefix('(pari)?jono')),
    ] 
  },
  'neljän parin jono': {
    regexes: [
      regex(wordPrefix('(neljä|4)'), wordPrefix('pari'), wordPrefix('(pari)?jono')),
    ] 
  },
  'parijono': {
    regexes: [
      regex(wordPrefix('parijon')),
      regex(wordPrefix('pari'), wordPrefix('jono')),
    //neljän parin parijonossa
    ] 
  },
  'paritanssi': {
    regexes: [
      regex(wordPrefix('paritanssi')),
      regex(wordPrefix('yhdelle parille')),
    ] 
  },

/* Muuta:
  x paria
  x-y paria
  pitkissä riveissä?
*/
}

function word(word) {return `\\b${word}\\b`; }
function wordPrefix(word) {return `\\b${word}[^ ]*\\b`; }
function regex(...words) { return new RegExp(words.join(" *"), "ig"); }
