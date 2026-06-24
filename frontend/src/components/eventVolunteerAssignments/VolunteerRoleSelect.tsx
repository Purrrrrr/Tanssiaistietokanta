import { Event, EventRole, EventVolunteerAssignment, ID, Workshop } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useEventRoles } from 'services/eventRoles'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs/selectors'
import { Hat } from 'libraries/ui/icons'
import { useT } from 'i18n'

interface VolunteerRoleSelectProps {
  id: string
  className?: string
  onChange: (newRole: RoleOption) => void
  currentAssignments: Pick<EventVolunteerAssignment, 'volunteer' | 'workshop' | 'role'>[]
  workshops: Event['workshops']
  volunteerId: ID
}

export function VolunteerRoleSelect({ id, onChange, currentAssignments, workshops, volunteerId, className }: VolunteerRoleSelectProps) {
  const t = useT('components.volunteerAssignmentEditor')
  const [roles = [], requestState] = useEventRoles()

  useShowGlobalLoadingAnimation(requestState.loading)

  const roleOptions: RoleOption[] = roles
    .flatMap(role => role.appliesToWorkshops
      ? workshops.map(workshop => ({
        ...role,
        workshop,
        workshopId: workshop._id,
        displayName: `${role.name} (${workshop.name})`,
      }))
      : [role],
    )
    .filter((role: RoleOption) => !currentAssignments.some(
      a => a.volunteer._id === volunteerId && a.role._id === role._id && (!role.workshopId || a.workshop?._id === role.workshopId),
    ))

  return <>
    <AutocompleteInput<RoleOption>
      id={id}
      containerClassname={className}
      value={null}
      onChange={onChange}
      items={roleOptions}
      itemToString={v => v.displayName ?? v.name}
      itemIcon={() => <Hat className="text-lime-600" />}
      placeholder={t('addRole')}
      noResultsText={t('noRoles')}
    />
    {requestState.error && <div className="text-red-500">{requestState.error.message}</div>}
  </>
}

export interface RoleOption extends EventRole { workshop?: Workshop | null, workshopId?: string, displayName?: string }
