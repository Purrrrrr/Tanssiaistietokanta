import * as L from 'partial.lenses'
import R from 'ramda'
import { MigrationFn } from '../umzug.context'
import { convertMarkdownToLexical } from '../utils/markdownToLexical'

// ── Migration ─────────────────────────────────────────────────────────────────

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
  // await params.context.updateDatabase('workshops', (workshop: Record<string, unknown>) => ({
  //   ...workshop,
  //   description: convertMarkdownToLexical((workshop.description as string) ?? ''),
  // }))
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
