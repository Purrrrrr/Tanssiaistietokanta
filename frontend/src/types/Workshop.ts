import { Dance } from './Dance'

export interface Workshop {
  _id: string
  eventId: string
  name: string
  abbreviation?: string
  description?: string
  teachers?: string
  dances: Dance[]
}
