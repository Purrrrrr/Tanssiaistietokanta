import { MigrationFn } from '../umzug.context'

const typeByName: Record<string, 'TEACHER' | 'ORGANIZER' | 'ASSISTANT_ORGANIZER' | 'BALL_HOST' | 'OTHER'> = {
  Opettaja: 'TEACHER',
  Apuopettaja: 'OTHER',
  Pääjärjestäjä: 'ORGANIZER',
  Orkesterivastaava: 'ASSISTANT_ORGANIZER',
  Juontaja: 'BALL_HOST',
  DJ: 'OTHER',
  Avustaja: 'OTHER',
}

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('eventRoles', (role: any) => {
    const type = typeByName[role.name]
    if (type !== undefined) {
      return { ...role, type }
    }
    return role
  })
}

export const down: MigrationFn = async _params => {}
