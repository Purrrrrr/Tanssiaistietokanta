import { useId } from 'react'
import { WorkshopLink } from 'routes/events/$eventId.{-$eventVersionId}/-components/WorkshopLink'

import { Event, EventVolunteerAssignment, ID } from 'types'

import { useSetEventVolunteerAssignmentRegistrationStatus, useSetEventVolunteerAssignmentWorkshopInstance } from 'services/eventVolunteerAssignments'

import { useMultipleSelection } from 'libraries/common/selection/useMultipleSelection'
import { Callout, FormGroup, ItemList, ToolbarContainer } from 'libraries/ui'
import { RoleTag } from 'components/eventVolunteers/RoleTag'
import { useT } from 'i18n'

import RegistrationStatusLegend from './RegistrationStatusLegend'
import RegistrationStatusSelector from './RegistrationStatusSelector'
import { RemoveAssignmentsButton } from './RemoveVolunteerAssignmentButton'
import { WorkshopInstanceSelector } from './WorkshopInstanceSelector'

export interface VolunteerAssignmentListProps {
  showName?: boolean
  showRole?: boolean
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem' | 'workshops'>
  assignments: EventVolunteerAssignment[]
  readOnly?: boolean
  children?: React.ReactNode
}

export function VolunteerAssignmentList({
  showName = false,
  showRole = false,
  event,
  assignments,
  readOnly,
  children,
}: VolunteerAssignmentListProps) {
  const id = useId()
  const { eventRegistrationSystem } = event
  const t = useT('components.volunteerAssignmentEditor')
  const status = useT('domain.eventVolunteer.shortEventVolunteerStatus')
  const [setAssignmentWorkshopInstance] = useSetEventVolunteerAssignmentWorkshopInstance()
  const [setAssignmentRegistrationStatus] = useSetEventVolunteerAssignmentRegistrationStatus()
  const { selected, ...selector } = useMultipleSelection(assignments)

  const setInstanceIds = async (assignment: EventVolunteerAssignment, instanceIds: ID[] | null) => {
    const workshopInstances = event.workshops.find(w => w._id === assignment.workshop?._id)?.instances ?? []
    const workshopInstanceIds = !instanceIds?.length
      ? null
      : instanceIds.length === workshopInstances.length
        ? null
        : instanceIds
    await setAssignmentWorkshopInstance({ id: assignment._id, workshopInstanceIds })
  }
  const hasWorkshops = assignments.some(a => a.workshop)
  const showWorkshops = showRole && hasWorkshops

  return <>
    {selected.length > 0 && (
      <ToolbarContainer className="justify-between">
        {t('selectedAssignments', { count: selected.length })}
        {!readOnly && <span>
          {eventRegistrationSystem !== 'None' && (
            <FormGroup inline label={t('setRegistrationStatus', { count: selected.length })} labelStyle="beside" labelFor={`${id}-registrationStatus-bulk`}>
              <RegistrationStatusSelector
                id={`${id}-registrationStatus-bulk`}
                value={selected.map(a => a.registrationStatus)}
                onChange={status => Promise.all(selected.map(a => setAssignmentRegistrationStatus({ id: a._id, registrationStatus: status })))}
                showText
              />
            </FormGroup>
          ) }
          <RemoveAssignmentsButton
            text={t('removeSelected', { count: selected.length })}
            assignments={selected}
          />
        </span>
        }
      </ToolbarContainer>
    )}
    <ItemList
      items={assignments}
      emptyText={t('noAssignments')}
      selection={selector}
      labelTranslator={t}
      columns={[
        {
          key: 'name',
          content: assignment => <span>
            {assignment.volunteer.name}
            {assignment.eventVolunteer.status !== 'Accepted' && ` (${status(assignment.eventVolunteer.status)})`}
          </span>,
          sortBy: a => a.volunteer.name,
          enabled: showName,
        }, {
          key: 'role',
          width: '1fr',
          content: assignment => <RoleTag role={assignment.role} />,
          sortBy: a => a.role.name,
          enabled: showRole,
        }, {
          key: 'workshop',
          width: '1fr',
          content: assignment => assignment.workshop && <WorkshopLink workshop={assignment.workshop} />,
          sortBy: a => a.workshop?.name,
          enabled: showWorkshops,
        }, {
          key: 'instance',
          width: 'max-content',
          content: assignment => <WorkshopInstanceSelector
            workshopInstances={event.workshops.find(w => w._id === assignment.workshop?._id)?.instances ?? []}
            value={assignment.workshopInstanceIds}
            readOnly={
              readOnly === true
                || assignment.registrationStatus === 'RegisteredToEventSystem'
                || assignment.registrationStatus === 'AcceptedRegistration'
            }
            onChange={ids => setInstanceIds(assignment, ids)}
          />,
          sortBy: a => [a.workshop?.name, a.workshopInstanceIds],
          enabled: hasWorkshops,
        }, {
          key: 'registrationStatus',
          width: 'max-content',
          content: assignment => <>
            <RegistrationStatusSelector
              id={`${id}-registrationStatus-${assignment._id}`}
              value={assignment.registrationStatus}
              onChange={registrationStatus =>
                setAssignmentRegistrationStatus({ id: assignment._id, registrationStatus })
              }
              disabled={readOnly}
            />
          </>,
          className: '-me-2',
          enabled: eventRegistrationSystem !== 'None',
        },
      ]}
      actions={assignment => !readOnly && <RemoveAssignmentsButton
        text={t('removeVolunteer')}
        iconOnly
        assignments={[assignment]}
      />}
    />
    <Callout title={t('legend')}>
      <RegistrationStatusLegend />
    </Callout>
    {children}
  </>
}
