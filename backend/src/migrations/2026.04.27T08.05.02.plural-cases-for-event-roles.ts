import { MigrationFn } from '../umzug.context'

const pluralByName: Record<string, string> = {
  Opettaja: 'Opettajat',
  Apuopettaja: 'Apuopettajat',
  Pääjärjestäjä: 'Pääjärjestäjät',
  Orkesterivastaava: 'Orkesterivastaavat',
  Juontaja: 'Juontajat',
  DJ: 'DJ:t',
  Avustaja: 'Avustajat',
}

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('eventRoles', ({ name, plural: pluralCount, ...role }: any) => {
    const plural = pluralByName[name]
    return {
      pluralCount,
      plural: plural ?? name,
      name,
      ...role,
    }
  })
}

export const down: MigrationFn = async _params => {}
