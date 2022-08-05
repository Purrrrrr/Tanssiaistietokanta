const { createMigration }= require('./src/umzug')

if (process.argv.length < 3) {
  console.error('Usage node ./create-migration.js migration-name')
  return
}

let filename = process.argv[2]

if (!filename.endsWith('.js')) {
  filename = filename + '.js'
}

createMigration(filename)
