import { useId } from 'react'

import { EventRegistrationSystem, EventVolunteerAssignment, EventVolunteerRegistrationStatus, ID } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useCreateEventVolunteerAssignment, useDeleteEventVolunteerAssignment, useEventVolunteerAssignments, useSetEventVolunteerAssignmentRegistrationStatus, useSetEventVolunteerAssignmentWorkshopInstance } from 'services/eventVolunteerAssignments'
import { useEventVolunteers } from 'services/eventVolunteers'
import { useVolunteerNames } from 'services/volunteers'
import { workshopInstanceName } from 'services/workshops'

import { AutocompleteInput, Select } from 'libraries/formsV2/components/inputs/selectors'
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
  eventRegistrationSystem?: EventRegistrationSystem
}

export function VolunteerAssignmentEditor({ id, eventId, eventVersionId, roleId, workshopId, workshopVersionId, workshopInstances, eventRegistrationSystem = 'None' }: VolunteerAssignmentEditorProps) {
  const t = useT('components.volunteerAssignmentSelector')
  const [currentAssignments = [], requestState1] = useEventVolunteerAssignments({ eventId, eventVersionId, roleId, workshopId, workshopVersionId })
  const [eventVolunteers = [], requestState2] = useEventVolunteers({ eventId })
  const [allVolunteers = [], requestState3] = useVolunteerNames()
  const [createAssignment] = useCreateEventVolunteerAssignment()
  const [setAssignmentWorkshopInstance] = useSetEventVolunteerAssignmentWorkshopInstance()
  const [setAssignmentRegistrationStatus] = useSetEventVolunteerAssignmentRegistrationStatus()
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
      eventVolunteerAssignment: { eventId, roleId, volunteerId: newVolunteer._id, workshopId, registrationStatus: 'None' },
    })
  }
  const readOnly = eventVersionId != null || workshopVersionId != null

  return <>
    <ItemList
      items={currentAssignments}
      emptyText={t('noVolunteers')}
      columns="grid-cols-[1fr_max-content_max-content_auto]">
      <ItemList.Header>
        <span>{t('name')}</span>
        {workshopInstances && <span>{t('instance')}</span>}
        {eventRegistrationSystem !== 'None' && <span>{t('registrationStatus')}</span>}
      </ItemList.Header>
      {currentAssignments.map(assignment => (
        <ItemList.Row key={assignment._id}>
          <span>{assignment.volunteer.name}</span>
          <WorkshopInstanceSelector
            workshopInstances={workshopInstances ?? []}
            assignment={assignment}
            readOnly={readOnly}
            setInstanceIds={setInstanceIds}
          />
          {eventRegistrationSystem !== 'None' &&
            <RegistrationStatusSelector
              registrationStatus={assignment.registrationStatus}
              setRegistrationStatus={registrationStatus =>
                setAssignmentRegistrationStatus({ id: assignment._id, registrationStatus })
              }
              disabled={readOnly}
            />
          }
          {!readOnly &&
            <DeleteButton
              className="col-start-4"
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
      containerClassname="mb-6"
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

function WorkshopInstanceSelector({ workshopInstances, readOnly, assignment, setInstanceIds }: {
  workshopInstances: {
    _id: ID
    abbreviation?: string | null
  }[]
  readOnly?: boolean
  assignment: EventVolunteerAssignment
  setInstanceIds: (id: ID, instanceIds: ID[] | null) => void
}) {
  const disabled = readOnly === true
    || assignment.registrationStatus === 'RegisteredToEventSystem'
    || assignment.registrationStatus === 'AcceptedRegistration'
  const t = useT('components.volunteerAssignmentSelector')
  return workshopInstances && workshopInstances.length > 1 && <ModeSelector>
    <ModeButton
      disabled={disabled}
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
          disabled={disabled}
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
  </ModeSelector>
}

function RegistrationStatusSelector({ registrationStatus, setRegistrationStatus, disabled }: {
  registrationStatus: EventVolunteerRegistrationStatus
  setRegistrationStatus: (registrationStatus: EventVolunteerRegistrationStatus) => void
  disabled?: boolean
}) {
  const t = useT('domain.EventVolunteerAssignmentRegistrationStatus')
  return <Select<EventVolunteerRegistrationStatus>
    minimal
    id={useId()}
    readOnly={disabled}
    value={registrationStatus}
    onChange={setRegistrationStatus}
    items={['None', 'RegisteredToEventSystem', 'AcceptedRegistration', 'InformedToOrganizers']}
    itemToString={t}
  />
}

interface VolunteerOption { _id: string, name: string }
