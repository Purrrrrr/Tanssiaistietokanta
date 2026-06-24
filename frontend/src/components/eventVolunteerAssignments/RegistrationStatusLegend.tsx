import { useT } from 'i18n'

import RegistrationStatusIcon from './RegistrationStatusIcon'
import { registrationStatuses } from './statuses'

export default function RegistrationStatusLegend() {
  const t = useT('domain.EventVolunteerAssignmentRegistrationStatus')
  return <div className="inline-flex flex-wrap gap-2">
    {registrationStatuses.map(status => <span key={status} className="flex items-center gap-1 w-max">
      <RegistrationStatusIcon status={status} /> =
      <span>{t(status)}</span>
    </span>)}
  </div>
}
