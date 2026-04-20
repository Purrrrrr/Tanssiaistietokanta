import { MigrationFn } from '../umzug.context'
import { convertMarkdownToLexical } from '../utils/markdownToLexical'

// ── Migration ─────────────────────────────────────────────────────────────────

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('dances', (dance: Record<string, unknown>) => ({
    ...dance,
    description: toLexical(dance.description as string),
    oldDescription: dance.description, // Preserve original markdown in case we need to revert
    instructions: toLexical(dance.instructions as string),
    oldInstructions: dance.instructions, // Preserve original markdown in case we need to revert
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
    .replace(/^(#+)(\S.*)$/gm, '$1 $2')
    .replace(/^\*\*\*(.*)\s+\*\*\*/gm, '***$1***')
}
