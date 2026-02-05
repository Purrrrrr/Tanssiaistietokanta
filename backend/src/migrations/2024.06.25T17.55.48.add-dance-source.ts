import { MigrationFn } from '../umzug.context'

const sourceRegex = / +\([^)]+\d{4}\)/

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('dances',
    (dance: any) => {
      const description = dance.description ?? ''
      const source = description
        ?.split
        ?.('\n\n')[0].match(sourceRegex)?.[0] ?? ''

      return {
        ...dance,
        description: source ? description.replace(source, '') : description,
        source: source.trim().replace(/[()]/g, ''),
      }
    },
  )
}

export const down: MigrationFn = async () => {}
