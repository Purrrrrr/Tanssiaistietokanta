import { ID } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useCreateEventVolunteerAssignment, useDeleteEventVolunteerAssignment, useEventVolunteerAssignments, useSetEventVolunteerAssignmentWorkshopInstance } from 'services/eventVolunteerAssignments'
import { useEventVolunteers } from 'services/eventVolunteers'
import { useVolunteerNames } from 'services/volunteers'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs/selectors'
import { ItemList } from 'libraries/ui'
import { ModeButton, ModeSelector } from 'libraries/ui/ModeSelector'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'
import { workshopInstanceName } from 'services/workshops'

export interface VolunteerAssignmentEditorProps {
  id: string
  eventId: ID
  eventVersionId?: ID
  roleId: ID
  workshopId?: ID
  workshopVersionId?: ID
  workshopInstances?: { _id: ID, abbreviation?: string | null }[]
}

export function VolunteerAssignmentEditor({ id, eventId, eventVersionId, roleId, workshopId, workshopVersionId, workshopInstances }: VolunteerAssignmentEditorProps) {
  const t = useT('components.volunteerAssignmentSelector')
  const [currentAssignments = [], requestState1] = useEventVolunteerAssignments({ eventId, eventVersionId, roleId, workshopId, workshopVersionId })
  const [eventVolunteers = [], requestState2] = useEventVolunteers({ eventId })
  const [allVolunteers = [], requestState3] = useVolunteerNames()
  const [createAssignment] = useCreateEventVolunteerAssignment()
  const [setAssignmentWorkshopInstance] = useSetEventVolunteerAssignmentWorkshopInstance()
  const [deleteAssignment] = useDeleteEventVolunteerAssignment()

  useShowGlobalLoadingAnimation(requestState1.loading || requestState2.loading || requestState3.loading)
  const errors = [requestState1.error, requestState2.error, requestState3.error].filter(e => e != null)

  const assignedIds = new Set(currentAssignments.map(a => a.volunteer._id))
  const eventVolunteerIds = new Set(eventVolunteers.map(ev => ev.volunteer._id))

  const eventVolunteerOptions: VolunteerOption[] = eventVolunteers
    .filter(v => v.interestedIn.find(r => r._id === roleId))
    .map(ev => ev.volunteer)
    .filter(v => !assignedIds.has(v._id))

  const otherVolunteerOptions: VolunteerOption[] = allVolunteers
    .filter(v => !assignedIds.has(v._id) && !eventVolunteerIds.has(v._id))

  const getItems = (query: string) => {
    const q = query.trim().toLowerCase()
    const matches = (v: VolunteerOption) => !q || v.name.toLowerCase().includes(q)
    return {
      categories: [
        { title: t('eventVolunteers'), items: eventVolunteerOptions.filter(matches) },
        { title: t('allVolunteers'), items: otherVolunteerOptions.filter(matches) },
      ],
    }
  }

  const setInstanceId = async (assignmentId: ID, instanceId: ID | null) => {
    await setAssignmentWorkshopInstance({ id: assignmentId, workshopInstanceId: instanceId })
  }

  const onChange = async (newVolunteer: VolunteerOption) => {
    await createAssignment({
      eventVolunteerAssignment: { eventId, roleId, volunteerId: newVolunteer._id, workshopId },
    })
  }
  const readOnly = eventVersionId != null || workshopVersionId != null

  return <>
    <ItemList
      items={currentAssignments}
      emptyText={t('noVolunteers')}
      columns={workshopInstances ? 'grid-cols-[1fr_max-content_auto]' : 'grid-cols-[1fr_auto]'}>
      <ItemList.Header>
        <span>{t('name')}</span>
        {workshopInstances && <span>{t('instance')}</span>}
      </ItemList.Header>
      {currentAssignments.map(a => (
        <ItemList.Row key={a._id}>
          <span>{a.volunteer.name}</span>
          {workshopInstances && <ModeSelector>
            <ModeButton
              selected={a.workshopInstanceId == null}
              onClick={() => setInstanceId(a._id, null)}
            >
              {t('allInstances')}
            </ModeButton>
            {workshopInstances.map((instance, index) => (
              <ModeButton
                key={instance._id}
                selected={a.workshopInstanceId === instance._id}
                onClick={() => setInstanceId(a._id, instance._id)}
              >
                {workshopInstanceName(index, instance)}
              </ModeButton>
            ))}
          </ModeSelector>}
          {!readOnly &&
            <DeleteButton
              minimal
              iconOnly
              text={t('removeVolunteer')}
              onDelete={() => deleteAssignment({ id: a._id })}
              confirmTitle={t('removeVolunteerConfirmation.title')}
              confirmText={t('removeVolunteerConfirmation.text', { name: a.volunteer.name })}
            />
          }
        </ItemList.Row>
      ))}
    </ItemList>
    <AutocompleteInput<VolunteerOption>
      id={id}
      value={null}
      onChange={onChange}
      readOnly={readOnly}
      items={getItems}
      itemToString={v => v.name}
      placeholder={readOnly ? '' : t('addVolunteer')}
      noResultsText={t('noVolunteers')}
    />
    {errors.map((error, i) => <div key={i} className="text-red-500">{error.message}</div>)}
  </>
}

interface VolunteerOption { _id: string, name: string }
