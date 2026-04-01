import { MigrationFn } from '../umzug.context'

const pluralByName: Record<string, string> = {
  Opettaja: 'opettajaa',
  Apuopettaja: 'apuopettajaa',
  Pääjärjestäjä: 'pääjärjestäjää',
  Orkesterivastaava: 'orkesterivastaavaa',
  Juontaja: 'juontajaa',
  DJ: 'DJ:itä',
  Avustaja: 'avustajaa',
}

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('eventRoles', (role: any) => {
    const plural = pluralByName[role.name]
    if (plural !== undefined) {
      return { ...role, plural }
    }
    return role
  })
}

export const down: MigrationFn = async _params => {}
