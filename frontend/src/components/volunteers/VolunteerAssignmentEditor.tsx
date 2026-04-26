import { ID } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useCreateEventVolunteerAssignment, useDeleteEventVolunteerAssignment, useEventVolunteerAssignments, useSetEventVolunteerAssignmentWorkshopInstance } from 'services/eventVolunteerAssignments'
import { useEventVolunteers } from 'services/eventVolunteers'
import { useVolunteerNames } from 'services/volunteers'
import { workshopInstanceName } from 'services/workshops'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs/selectors'
import { ItemList } from 'libraries/ui'
import { ModeButton, ModeSelector } from 'libraries/ui/ModeSelector'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

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

  const setInstanceIds = async (assignmentId: ID, instanceIds: ID[] | null) => {
    const workshopInstanceIds = !instanceIds?.length
      ? null
      : instanceIds.length === workshopInstances?.length
        ? null
        : instanceIds
    await setAssignmentWorkshopInstance({ id: assignmentId, workshopInstanceIds })
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
      {currentAssignments.map(assignment => (
        <ItemList.Row key={assignment._id}>
          <span>{assignment.volunteer.name}</span>
          {workshopInstances && <ModeSelector>
            <ModeButton
              selected={assignment.workshopInstanceIds == null}
              onClick={() => setInstanceIds(assignment._id, null)}
            >
              {t('allInstances')}
            </ModeButton>
            {workshopInstances.map((instance, index) => {
              const selected = assignment.workshopInstanceIds?.includes(instance._id) ?? false
              return (
                <ModeButton
                  key={instance._id}
                  selected={selected}
                  onClick={() => setInstanceIds(
                    assignment._id,
                    selected
                      ? assignment.workshopInstanceIds?.filter(id => id !== instance._id) ?? null
                      : [...(assignment.workshopInstanceIds ?? []), instance._id],
                  )}
                >
                  {workshopInstanceName(index, instance)}
                </ModeButton>
              )
            })}
          </ModeSelector>}
          {!readOnly &&
            <DeleteButton
              minimal
              iconOnly
              text={t('removeVolunteer')}
              onDelete={() => deleteAssignment({ id: assignment._id })}
              confirmTitle={t('removeVolunteerConfirmation.title')}
              confirmText={t('removeVolunteerConfirmation.text', { name: assignment.volunteer.name })}
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
