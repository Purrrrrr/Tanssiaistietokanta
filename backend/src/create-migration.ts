import { createMigration } from './umzug'

function main() {
  if (process.argv.length < 3) {
    console.error('Usage ts-node ./create-migration.ts migration-name [production|test]')
    return
  }

  let filename = process.argv[2]
  const type = process.argv[3]

  if (!filename.endsWith('.ts')) {
    filename = filename + '.ts'
  }

  createMigration(filename, type === 'test' ? 'test' : 'production')
}

main()
