export function titleCase(word: string) {
  return word[0].toUpperCase() + word.slice(1)
}

export function isTitlecase(word: string) {
  return word[0].match(uppercase)
}

const uppercase = /^[A-Z]/
