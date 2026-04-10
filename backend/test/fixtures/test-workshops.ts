import type { WorkshopsData } from '../../src/services/workshops/workshops.schema'
import { publicTestEvent, limitedTestEvent } from './test-events'

type WorkshopFixture = { _id: string } & WorkshopsData

export const publicEventWorkshop: WorkshopFixture = {
  _id: '',
  name: 'Public Event Workshop',
  eventId: '',
  abbreviation: 'PEW',
  description: 'A workshop for the public event',
  instances: [],
  instanceSpecificDances: false,
}

export const limitedEventWorkshop: WorkshopFixture = {
  _id: '',
  name: 'Limited Event Workshop',
  eventId: '',
  abbreviation: 'LEW',
  description: 'A workshop for the limited event',
  instances: [],
  instanceSpecificDances: false,
}

// Event IDs are not available at fixture definition time, so we set them in this function
export const initTestWorkshops = () => {
  publicEventWorkshop.eventId = publicTestEvent._id
  limitedEventWorkshop.eventId = limitedTestEvent._id
}

export const testWorkshops = [publicEventWorkshop, limitedEventWorkshop] as const
