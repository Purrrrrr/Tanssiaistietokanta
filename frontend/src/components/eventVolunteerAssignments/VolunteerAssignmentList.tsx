import { useId } from 'react'

import { Event, EventVolunteerAssignment, EventVolunteerRegistrationStatus, ID } from 'types'

import { useSetEventVolunteerAssignmentRegistrationStatus, useSetEventVolunteerAssignmentWorkshopInstance } from 'services/eventVolunteerAssignments'
import { workshopInstanceName } from 'services/workshops'

import { Select } from 'libraries/formsV2/components/inputs/selectors'
import { FormGroup, ItemList } from 'libraries/ui'
import { ModeButton, ModeSelector } from 'libraries/ui/ModeSelector'
import { PageSection } from 'components/widgets/PageSection'
import { SelectionBox } from 'components/widgets/SelectionBox'
import { useT, useTranslation } from 'i18n'
import { useMultipleSelection } from 'utils/useMultipleSelection'

import { RemoveAssignmentsButton } from './RemoveVolunteerAssignmentButton'

export interface VolunteerAssignmentEditorProps {
  title: string
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem'>
  assignments: EventVolunteerAssignment[]
  readOnly?: boolean
  workshopInstances?: { _id: ID, abbreviation?: string | null }[]
  children?: React.ReactNode
}

export function VolunteerAssignmentList({ title, event, assignments, readOnly, workshopInstances, children }: VolunteerAssignmentEditorProps) {
  const id = useId()
  const { eventRegistrationSystem } = event
  const t = useT('components.volunteerAssignmentEditor')
  const [setAssignmentWorkshopInstance] = useSetEventVolunteerAssignmentWorkshopInstance()
  const [setAssignmentRegistrationStatus] = useSetEventVolunteerAssignmentRegistrationStatus()
  const { selected, ...selector } = useMultipleSelection(assignments)

  const setInstanceIds = async (assignmentId: ID, instanceIds: ID[] | null) => {
    const workshopInstanceIds = !instanceIds?.length
      ? null
      : instanceIds.length === workshopInstances?.length
        ? null
        : instanceIds
    await setAssignmentWorkshopInstance({ id: assignmentId, workshopInstanceIds })
  }

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
      items={assignments}
      emptyText={t('noVolunteers')}
      columns="grid-cols-[auto_1fr_max-content_max-content_auto]">
      <ItemList.Header>
        <SelectionBox {...selector.selectAllProps} />
        <span>{t('name')}</span>
        {workshopInstances && <span>{t('instance')}</span>}
        {eventRegistrationSystem !== 'None' && <span>{t('registrationStatus')}</span>}
      </ItemList.Header>
      {assignments.map(assignment => (
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
    {children}
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
