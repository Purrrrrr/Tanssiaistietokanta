import { MigrationFn } from '../umzug.context'
import { convertMarkdownToLexical } from '../utils/markdownToLexical'

// ── Migration ─────────────────────────────────────────────────────────────────

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('dances', (dance: Record<string, unknown>) => ({
    ...dance,
    description: toLexical(dance.description as string),
    instructions: toLexical(dance.instructions as string),
  }))
  // await params.context.updateDatabase('workshops', (workshop: Record<string, unknown>) => ({
  //   ...workshop,
  //   description: convertMarkdownToLexical((workshop.description as string) ?? ''),
  // }))
}

export const down: MigrationFn = async () => {}

function toLexical(markdown: string) {
  const fixedMarkdown = applyFixes(markdown ?? '')
  return convertMarkdownToLexical(fixedMarkdown)
}

function applyFixes(markdown: string): string {
  // Apply any necessary fixes to the markdown before parsing
  return markdown
    .replace(/^(#+)([^ #].*)$/gm, '$1 $2')
    .replace(/^\*\*\*(.*)\s+\*\*\*/gm, '***$1***')
}
