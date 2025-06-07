import { stripLinks } from "./markdownUtils"

export function getSources(instructions: string | null) {
  if (!instructions) return []

  return Array.from(
    stripLinks(instructions)
      .matchAll(/((d')?(kirja|[\p{Script=Latn}&&\p{Uppercase}])\p{Script=Latn}+[,\-\n ]+)+\(?\d{4,4}\)?/vg)
  ).map(match => match[0].replace(/[, \n]+/g, ' ').replace(/[()[\]]/g, ''))
}
