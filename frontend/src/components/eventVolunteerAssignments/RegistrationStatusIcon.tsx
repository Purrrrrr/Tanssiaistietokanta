import { EventVolunteerRegistrationStatus } from 'types'

import { Cross, Envelope, NewPerson, TickCircle } from 'libraries/ui/icons'

const statusIcons: Record<EventVolunteerRegistrationStatus, React.ReactNode> = {
  None: <NewPerson className="text-gray-400" />,
  RegisteredToEventSystem: <Envelope className="text-yellow-500" />,
  AcceptedRegistration: <TickCircle className="text-green-600" />,
  InformedToOrganizers: <TickCircle className="text-blue-500" />,
  RegistrationCancelled: <Cross className="text-red-800" />,
}

export default function RegistrationStatusIcon({ status }: { status?: EventVolunteerRegistrationStatus | null }) {
  return statusIcons[status ?? 'None']
}
