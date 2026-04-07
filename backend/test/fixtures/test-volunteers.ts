import type { VolunteersData } from '../../src/services/volunteers/volunteers.schema'

type VolunteerFixture = { _id: string } & VolunteersData

export const canonicalVolunteer: VolunteerFixture = {
  _id: '',
  name: 'Canonical Volunteer',
}

export const duplicateVolunteer: VolunteerFixture = {
  _id: '',
  name: 'Duplicate Volunteer',
  duplicatedBy: 'some-id',
}

export const initTestVolunteers = () => {
  duplicateVolunteer.duplicatedBy = canonicalVolunteer._id
}

export const testVolunteers = [canonicalVolunteer, duplicateVolunteer] as const
