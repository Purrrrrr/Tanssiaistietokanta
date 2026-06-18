import { Event, EventVolunteerAssignment, ID } from 'types'

import { useCreateEventVolunteerAssignment } from 'services/eventVolunteerAssignments'

import { type RoleOption, VolunteerRoleSelect } from './VolunteerRoleSelect'

interface AddVolunteerRoleSelectProps {
  id: string
  className?: string
  currentAssignments: EventVolunteerAssignment[]
  event: Pick<Event, '_id' | 'workshops'>
  volunteerId: ID
}

export function AddVolunteerRoleSelect({ id, currentAssignments, event, volunteerId, className }: AddVolunteerRoleSelectProps) {
  const { _id: eventId, workshops } = event
  const [createAssignment] = useCreateEventVolunteerAssignment()

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

  return <VolunteerRoleSelect
    id={id}
    className={className}
    onChange={onChange}
    workshops={workshops}
    currentAssignments={currentAssignments}
    volunteerId={volunteerId}
  />
}
