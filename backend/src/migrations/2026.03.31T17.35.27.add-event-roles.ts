import { SkipAccessControl } from '../services/access/hooks'
import { MigrationFn } from '../umzug.context'

const initialRoles = [
  { name: 'Opettaja', description: 'Opettaa tansseja tanssipajassa', appliesToWorkshops: true },
  { name: 'Apuopettaja', description: 'Avustaa opettajia tanssin opettamisessa mm. ohjailemalla tanssijoita', appliesToWorkshops: true },
  { name: 'DJ', description: 'Vastaa musiikin soittamisesta tanssiaisissa', appliesToWorkshops: false },
  { name: 'Avustaja', description: 'Ohjelmanjuoksija joka avustaa tapahtuman järjestelyissä', appliesToWorkshops: false },
  { name: 'Pääjärjestäjä', description: 'Organisoi ja kokoaa tapahtumatiimin, hoitaa kommunikaation eri osapuolten välillä ja delegoi tarvittaessa', appliesToWorkshops: false },
  { name: 'Juontaja', description: 'Juontaa tanssiaiset', appliesToWorkshops: false },
]

export const up: MigrationFn = async params => {
  const { context } = params
  const eventRolesService = context.getService('eventRoles') as any

  for (const role of initialRoles) {
    await eventRolesService.create(role, { [SkipAccessControl]: true })
  }
}

export const down: MigrationFn = async _params => {}
