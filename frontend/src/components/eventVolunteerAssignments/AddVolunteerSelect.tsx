import { EventVolunteerAssignment, ID } from 'types'

import { useCreateEventVolunteerAssignment } from 'services/eventVolunteerAssignments'

import { VolunteerSelect } from './VolunteerSelect'

interface VolunteerSelectorProps {
  id: string
  currentAssignments: EventVolunteerAssignment[]
  eventId: ID
  roleId: ID
  workshopId?: ID
  className?: string
}

export function AddVolunteerSelect({ id, currentAssignments, eventId, roleId, workshopId, className }: VolunteerSelectorProps) {
  const [createAssignment] = useCreateEventVolunteerAssignment()
  const onChange = async (newVolunteer: VolunteerOption) => {
    await createAssignment({
      eventVolunteerAssignment: { eventId, roleId, volunteerId: newVolunteer._id, workshopId, registrationStatus: 'None' },
    })
  }

  return <VolunteerSelect
    id={id}
    className={className}
    currentAssignments={currentAssignments}
    eventId={eventId}
    roleId={roleId}
    workshopId={workshopId}
    onChange={onChange}
  />
}

interface VolunteerOption { _id: string, name: string }
