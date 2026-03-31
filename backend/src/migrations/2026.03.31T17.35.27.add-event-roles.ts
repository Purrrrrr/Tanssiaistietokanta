import { SkipAccessControl } from '../services/access/hooks'
import { MigrationFn } from '../umzug.context'

const initialRoles = [
  { name: 'Opettaja', description: 'Opettaa tansseja tanssipajassa', appliesToWorkshops: true, order: 1 },
  { name: 'Apuopettaja', description: 'Avustaa opettajia tanssin opettamisessa mm. ohjailemalla tanssijoita', appliesToWorkshops: true, order: 2 },
  { name: 'Pääjärjestäjä', description: 'Organisoi ja kokoaa tapahtumatiimin, hoitaa kommunikaation eri osapuolten välillä ja delegoi tarvittaessa', appliesToWorkshops: false, order: 3 },
  { name: 'Juontaja', description: 'Juontaa tanssiaiset', appliesToWorkshops: false, order: 4 },
  { name: 'DJ', description: 'Vastaa musiikin soittamisesta tanssiaisissa', appliesToWorkshops: false, order: 5 },
  { name: 'Avustaja', description: 'Ohjelmanjuoksija joka avustaa tapahtuman järjestelyissä', appliesToWorkshops: false, order: 6 },
]

export const up: MigrationFn = async params => {
  const { context } = params
  const eventRolesService = context.getService('eventRoles') as any

  for (const role of initialRoles) {
    await eventRolesService.create(role, { [SkipAccessControl]: true })
  }
}

export const down: MigrationFn = async _params => {}
