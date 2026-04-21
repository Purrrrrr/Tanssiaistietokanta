import * as L from 'partial.lenses'
import R from 'ramda'
import { MigrationFn } from '../umzug.context'
import { convertMarkdownToLexical } from '../utils/markdownToLexical'
import updateDatabase from '../utils/updateDatabase'

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('dances', (dance: Record<string, unknown>) => ({
    ...dance,
    description: toLexical(dance.description as string),
    instructions: toLexical(dance.instructions as string),
  }))
  await params.context.updateDatabase(
    'events',
    R.compose(
      L.modify(['program', 'introductions', 'program', L.elems, 'eventProgram', L.when(R.isNotNil), 'description'], toLexical),
      L.modify(['program', 'danceSets', L.elems, 'program', L.elems, 'eventProgram', L.when(R.isNotNil), 'description'], toLexical),
      L.modify(['program', 'danceSets', L.elems, 'intervalMusic', L.when(R.isNotNil), 'description'], toLexical),
      L.modify(['program', 'defaultIntervalMusic', 'description'], toLexical),
    ),
  )
  const wiki = params.context.getModel('dancewiki')
  await updateDatabase(wiki, ({ instructions, ...wikiPage }: Record<string, unknown>) => {
    const content = instructions ? convertMarkdownToLexical(instructions as string) : null
    return ({
      ...wikiPage,
      content,
      contentAsMarkdown: instructions,
    })
  })
  await params.context.updateDatabase('workshops', (workshop: Record<string, unknown>) => ({
    ...workshop,
    description: convertMarkdownToLexical((workshop.description as string) ?? ''),
    instances: (workshop.instances as { description: string }[]).map(R.omit(['description'])),
  }))
}

export const down: MigrationFn = async () => {}

function toLexical(markdown: string | null) {
  if (markdown == null) return null
  const fixedMarkdown = applyFixes(markdown ?? '')
  return convertMarkdownToLexical(fixedMarkdown)
}

function applyFixes(markdown: string): string {
  // Apply any necessary fixes to the markdown before parsing
  return markdown
    .replace(/^(#+)([^ #].*)$/gm, '$1 $2')
    .replace(/^\*\*\*(.*)\s+\*\*\*/gm, '***$1***')
}
