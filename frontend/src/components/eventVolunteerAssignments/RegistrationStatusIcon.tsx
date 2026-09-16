import { EventVolunteerRegistrationStatus } from '@/types'

import { Icon } from '@/libraries/ui'

const statusIcons: Record<EventVolunteerRegistrationStatus, React.ReactNode> = {
  None: <Icon icon="newPerson" className="text-gray-400" />,
  RegisteredToEventSystem: <Icon icon="envelope" className="text-yellow-500" />,
  AcceptedRegistration: <Icon icon="tickCircle" className="text-green-600" />,
  InformedToOrganizers: <Icon icon="tickCircle" className="text-blue-500" />,
  RegistrationCancelled: <Icon icon="cross" className="text-red-800" />,
}

export default function RegistrationStatusIcon({ status }: { status?: EventVolunteerRegistrationStatus | null }) {
  return statusIcons[status ?? 'None']
}
