import { createMigration } from './umzug'

function main() {
  if (process.argv.length < 3) {
    console.error('Usage node ./create-migration.js migration-name')
    return
  }

  let filename = process.argv[2]

  if (!filename.endsWith('.ts')) {
    filename = filename + '.ts'
  }

  createMigration(filename)
}

main()
