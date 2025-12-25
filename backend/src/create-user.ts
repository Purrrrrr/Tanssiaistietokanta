import { writeFileSync } from 'fs'
import prompt from 'minimal-password-prompt'

async function main() {
  if (process.argv.length < 3) {
    console.error('Usage ts-node ./create-user.ts username')
    return
  }
  
  const username = process.argv[2]
  const password = await prompt(`Enter password for ${username}: `)
  const password2 = await prompt(`Enter password again: `)

  if (password !== password2) {
    console.error('Passwords do not match!')
    return
  }
  if (password.trim() === '') {
    console.error('Password cannot be empty!')
    return
  }

  writeFileSync(
    './data/create-user.json', 
    JSON.stringify({ username, password })
  )

  console.log(`User ${username} will be created on next server start.`)
}

main()
