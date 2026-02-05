import { writeFileSync } from 'fs'
import config from 'config'
import prompt from 'minimal-password-prompt'

async function main() {
  if (process.argv.length < 3) {
    console.error('Usage ts-node ./create-user.ts username')
    return
  }

  const username = process.argv[2]
  const password = await prompt(`Enter password for ${username}: `)
  const password2 = await prompt('Enter password again: ')

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
    JSON.stringify({ username, password }),
  )

  const host = config.get('host')
  const port = config.get('port')
  const serverUrl = `http://${host}:${port}`

  try {
    console.log(`Attempting to notify server at ${serverUrl} to create user...`)
    const result = await fetch(`${serverUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ createDefault: true }),
    })
    if (result.ok) {
      console.log(`User ${username} created successfully on server.`)
    } else {
      console.log(`Server responded with status ${result.status} and '${await result.text()}'. User ${username} will be created on next server start.`)
    }
  } catch (_error) {
    console.log(`Could not connect to server at ${serverUrl}. User ${username} will be created on next server start.`)
  }
}

main()
