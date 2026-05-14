import { Event, EventVolunteerAssignment, ID } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useEventRoles } from 'services/eventRoles'
import { useCreateEventVolunteerAssignment, useEventVolunteerAssignments } from 'services/eventVolunteerAssignments'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs/selectors'
import { useT } from 'i18n'

import { VolunteerAssignmentList } from './VolunteerAssignmentList'

export interface VolunteerRoleAssignmentEditorProps {
  id: string
  title: string
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem'>
  volunteerId: ID
}

export function VolunteerRoleAssignmentEditor({ title, id, event, volunteerId }: VolunteerRoleAssignmentEditorProps) {
  const { _id: eventId, _versionId: eventVersionId } = event
  const [currentAssignments = [], requestState] = useEventVolunteerAssignments({ eventId, eventVersionId, volunteerId })

  useShowGlobalLoadingAnimation(requestState.loading)
  const readOnly = eventVersionId != null

  return <VolunteerAssignmentList
    showRole
    assignments={currentAssignments}
    title={title}
    readOnly={readOnly}
    event={event}
  >
    {!readOnly &&
      <AddRoleSelect
        id={id}
        currentAssignments={currentAssignments}
        eventId={eventId}
        volunteerId={volunteerId}
      />
    }
    {requestState.error && <div className="text-red-500">{requestState.error.message}</div>}
  </VolunteerAssignmentList>
}

interface VolunteerSelectorProps {
  id: string
  currentAssignments: EventVolunteerAssignment[]
  eventId: ID
  volunteerId: ID
}

function AddRoleSelect({ id, currentAssignments, eventId, volunteerId }: VolunteerSelectorProps) {
  const t = useT('components.volunteerAssignmentEditor')
  const [roles = [], requestState] = useEventRoles()
  const [createAssignment] = useCreateEventVolunteerAssignment()

  useShowGlobalLoadingAnimation(requestState.loading)

  const assignedIds = new Set(currentAssignments.map(a => a.role._id))
  const roleOptions: RoleOption[] = roles
    .filter(v => !assignedIds.has(v._id) && !v.appliesToWorkshops)

  const getItems = (query: string) => {
    const q = query.trim().toLowerCase()
    const matches = (v: RoleOption) => !q || v.name.toLowerCase().includes(q)
    return roleOptions.filter(matches)
  }

  const onChange = async (newRole: RoleOption) => {
    await createAssignment({
      eventVolunteerAssignment: { eventId, roleId: newRole._id, volunteerId, registrationStatus: 'None' },
    })
  }

  return <>
    <AutocompleteInput<RoleOption>
      id={id}
      containerClassname="mb-6"
      value={null}
      onChange={onChange}
      items={getItems}
      itemToString={v => v.name}
      placeholder={t('addRole')}
      noResultsText={t('noRoles')}
    />
    {requestState.error && <div className="text-red-500">{requestState.error.message}</div>}
  </>
}

interface RoleOption { _id: string, name: string }
