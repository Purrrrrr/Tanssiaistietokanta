import { Event, EventVolunteerAssignment, ID } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useEventRoles } from 'services/eventRoles'
import { useCreateEventVolunteerAssignment } from 'services/eventVolunteerAssignments'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs/selectors'
import { useT } from 'i18n'

interface AddVolunteerRoleSelectProps {
  id: string
  className?: string
  currentAssignments: EventVolunteerAssignment[]
  event: Pick<Event, '_id' | 'workshops'>
  volunteerId: ID
}

export function AddVolunteerRoleSelect({ id, currentAssignments, event, volunteerId, className }: AddVolunteerRoleSelectProps) {
  const { _id: eventId, workshops } = event
  const t = useT('components.volunteerAssignmentEditor')
  const [roles = [], requestState] = useEventRoles()
  const [createAssignment] = useCreateEventVolunteerAssignment()

  useShowGlobalLoadingAnimation(requestState.loading)

  const roleOptions: RoleOption[] = roles
    .flatMap(role => role.appliesToWorkshops
      ? workshops.map(workshop => ({
        _id: role._id,
        workshopId: workshop._id,
        name: `${role.name} (${workshop.name})`,
      }))
      : [{
        _id: role._id,
        name: role.name,
      }],
    )
    .filter((role: RoleOption) => !currentAssignments.some(
      a => a.volunteer._id === volunteerId && a.role._id === role._id && (!role.workshopId || a.workshop?._id === role.workshopId),
    ))

  const onChange = async (newRole: RoleOption) => {
    await createAssignment({
      eventVolunteerAssignment: {
        eventId: eventId,
        roleId: newRole._id,
        workshopId: newRole.workshopId,
        volunteerId,
        registrationStatus: 'None',
      },
    })
  }

  return <>
    <AutocompleteInput<RoleOption>
      id={id}
      containerClassname={className}
      value={null}
      onChange={onChange}
      items={roleOptions}
      itemToString={v => v.name}
      placeholder={t('addRole')}
      noResultsText={t('noRoles')}
    />
    {requestState.error && <div className="text-red-500">{requestState.error.message}</div>}
  </>
}

interface RoleOption { _id: string, name: string, workshopId?: string }
