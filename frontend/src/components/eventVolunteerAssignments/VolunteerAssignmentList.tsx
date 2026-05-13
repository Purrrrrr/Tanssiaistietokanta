import { useId } from 'react'

import { Event, EventVolunteerAssignment, ID } from 'types'

import { useSetEventVolunteerAssignmentRegistrationStatus, useSetEventVolunteerAssignmentWorkshopInstance } from 'services/eventVolunteerAssignments'

import { FormGroup, ItemList } from 'libraries/ui'
import { PageSection } from 'components/widgets/PageSection'
import { SelectionBox } from 'components/widgets/SelectionBox'
import { useT } from 'i18n'
import { useMultipleSelection } from 'utils/useMultipleSelection'

import { RegistrationStatusSelector } from './RegistrationStatusSelector'
import { RemoveAssignmentsButton } from './RemoveVolunteerAssignmentButton'
import { WorkshopInstanceSelector } from './WorkshopInstanceSelector'

export interface VolunteerAssignmentListProps {
  title: string
  mainColumn: 'role' | 'name'
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem'>
  assignments: EventVolunteerAssignment[]
  readOnly?: boolean
  workshopInstances?: { _id: ID, abbreviation?: string | null }[]
  children?: React.ReactNode
}

export function VolunteerAssignmentList({ title, mainColumn, event, assignments, readOnly, workshopInstances, children }: VolunteerAssignmentListProps) {
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
    introText={selected.length > 0 ? t(mainColumn == 'name' ? 'selectedVolunteers' : 'selectedRoles', { count: selected.length }) : undefined}
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
        confirmationType={mainColumn}
        text={t('removeSelected', { count: selected.length })}
        assignments={selected}
      />
    </>}
  >
    <ItemList
      items={assignments}
      emptyText={mainColumn === 'name' ? t('noVolunteers') : t('noRoles')}
      columns="grid-cols-[auto_1fr_max-content_max-content_auto]">
      <ItemList.Header>
        <SelectionBox {...selector.selectAllProps} />
        <span>{t(mainColumn)}</span>
        {workshopInstances && <span>{t('instance')}</span>}
        {eventRegistrationSystem !== 'None' && <span>{t('registrationStatus')}</span>}
      </ItemList.Header>
      {assignments.map(assignment => (
        <ItemList.Row key={assignment._id}>
          <SelectionBox {...selector.selectItemProps(assignment)} />
          {mainColumn === 'name'
            ? <span>{assignment.volunteer.name}</span>
            : <span>{assignment.role.name}{assignment.workshop && ` (${assignment.workshop.name})`}</span>
          }
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
              confirmationType={mainColumn}
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
