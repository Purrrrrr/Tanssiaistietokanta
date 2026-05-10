import { Event, EventVolunteerAssignment, EventVolunteerRegistrationStatus, ID } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useCreateEventVolunteerAssignment, useEventVolunteerAssignments, useSetEventVolunteerAssignmentRegistrationStatus, useSetEventVolunteerAssignmentWorkshopInstance } from 'services/eventVolunteerAssignments'
import { useEventVolunteers } from 'services/eventVolunteers'
import { workshopInstanceName } from 'services/workshops'

import { AutocompleteInput, Select } from 'libraries/formsV2/components/inputs/selectors'
import { FormGroup, ItemList } from 'libraries/ui'
import { ModeButton, ModeSelector } from 'libraries/ui/ModeSelector'
import { PageSection } from 'components/widgets/PageSection'
import { SelectionBox } from 'components/widgets/SelectionBox'
import { useT, useTranslation } from 'i18n'
import { useMultipleSelection } from 'utils/useMultipleSelection'

import { RemoveAssignmentsButton } from './RemoveVolunteerAssignmentButton'

export interface VolunteerAssignmentEditorProps {
  id: string
  title: string
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem'>
  roleId: ID
  workshopId?: ID
  workshopVersionId?: ID
  workshopInstances?: { _id: ID, abbreviation?: string | null }[]
}

export function VolunteerAssignmentEditor({ title, id, event, roleId, workshopId, workshopVersionId, workshopInstances }: VolunteerAssignmentEditorProps) {
  const { _id: eventId, _versionId: eventVersionId, eventRegistrationSystem } = event
  const t = useT('components.volunteerAssignmentEditor')
  const [currentAssignments = [], requestState1] = useEventVolunteerAssignments({ eventId, eventVersionId, roleId, workshopId, workshopVersionId })
  const [eventVolunteers = [], requestState2] = useEventVolunteers({ eventId })
  const [createAssignment] = useCreateEventVolunteerAssignment()
  const [setAssignmentWorkshopInstance] = useSetEventVolunteerAssignmentWorkshopInstance()
  const [setAssignmentRegistrationStatus] = useSetEventVolunteerAssignmentRegistrationStatus()
  const { selected, ...selector } = useMultipleSelection(currentAssignments)

  useShowGlobalLoadingAnimation(requestState1.loading || requestState2.loading)
  const errors = [requestState1.error, requestState2.error].filter(e => e != null)

  const assignedIds = new Set(currentAssignments.map(a => a.volunteer._id))

  const eventVolunteerOptions: VolunteerOption[] = eventVolunteers
    .filter(v => v.interestedIn.find(r => r._id === roleId) && v.status === 'Accepted')
    .map(ev => ev.volunteer)
    .filter(v => !assignedIds.has(v._id))

  const getItems = (query: string) => {
    const q = query.trim().toLowerCase()
    const matches = (v: VolunteerOption) => !q || v.name.toLowerCase().includes(q)
    return eventVolunteerOptions.filter(matches)
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

  return <PageSection
    title={title}
    introText={selected.length > 0 ? t('selectedVolunteers', { count: selected.length }) : undefined}
    toolbar={selected.length > 0 && !readOnly && <>
      {eventRegistrationSystem !== 'None' && (
        <FormGroup inline label={t('setRegistrationStatus', { count: selected.length })} labelStyle="beside" labelFor={`${id}-registrationStatus-bulk`}>
          <RegistrationStatusSelector
            id={`${id}-registrationStatus-bulk`}
            onChange={status => Promise.all(selected.map(a => setAssignmentRegistrationStatus({ id: a._id, registrationStatus: status })))}
          />
        </FormGroup>
      ) }
      <RemoveAssignmentsButton
        text={t('removeSelectedVolunteers', { count: selected.length })}
        assignments={selected}
      />
    </>}
  >
    <ItemList
      items={currentAssignments}
      emptyText={t('noVolunteers')}
      columns="grid-cols-[auto_1fr_max-content_max-content_auto]">
      <ItemList.Header>
        <SelectionBox {...selector.selectAllProps} />
        <span>{t('name')}</span>
        {workshopInstances && <span>{t('instance')}</span>}
        {eventRegistrationSystem !== 'None' && <span>{t('registrationStatus')}</span>}
      </ItemList.Header>
      {currentAssignments.map(assignment => (
        <ItemList.Row key={assignment._id}>
          <SelectionBox {...selector.selectItemProps(assignment)} />
          <span>{assignment.volunteer.name}</span>
          <WorkshopInstanceSelector
            workshopInstances={workshopInstances ?? []}
            assignment={assignment}
            readOnly={readOnly}
            setInstanceIds={setInstanceIds}
          />
          {eventRegistrationSystem !== 'None' &&
            <RegistrationStatusSelector
              id={`${id}-registrationStatus-${assignment._id}`}
              value={assignment.registrationStatus}
              onChange={registrationStatus =>
                setAssignmentRegistrationStatus({ id: assignment._id, registrationStatus })
              }
              disabled={readOnly}
            />
          }
          {!readOnly &&
            <RemoveAssignmentsButton
              text={t('removeVolunteer')}
              className="col-start-5"
              iconOnly
              assignments={[assignment]}
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
  </PageSection>
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
  const t = useT('components.volunteerAssignmentEditor')
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

const statuses: EventVolunteerRegistrationStatus[] = ['None', 'RegisteredToEventSystem', 'AcceptedRegistration', 'InformedToOrganizers']

function RegistrationStatusSelector({ id, value, onChange, disabled }: {
  id: string
  value?: EventVolunteerRegistrationStatus
  onChange: (registrationStatus: EventVolunteerRegistrationStatus) => void
  disabled?: boolean
}) {
  const t = useT('domain.EventVolunteerAssignmentRegistrationStatus')
  const choose = useTranslation('components.volunteerAssignmentEditor.chooseStatus')
  return <Select<EventVolunteerRegistrationStatus | null>
    minimal
    id={id}
    readOnly={disabled}
    value={value ?? null}
    onChange={status => status && onChange(status)}
    items={value ? statuses : [null, ...statuses]}
    itemToString={status => status ? t(status) : choose}
  />
}

interface VolunteerOption { _id: string, name: string }
