import { useState } from 'react'

import { Event, EventVolunteerAssignment, Workshop } from 'types'
import { NewValue } from 'libraries/forms/types'

import { formFor } from 'libraries/forms'
import { Card, DialogCloseButton, FormGroup, H2, ItemList } from 'libraries/ui'
import { Trash } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'

import { AddAssignmentTargetSelector, AssignmentTarget } from './AddAssignmentTargetSelector'
import { AddAssignmentWorkshopSelector } from './AddAssignmentWorkshopSelector'
import { VolunteerRoleSelect } from './VolunteerRoleSelect'
import { VolunteerSelect } from './VolunteerSelect'
// import { WorkshopInstanceSelector } from './WorkshopInstanceSelector'

interface FormData {
  target: AssignmentTarget | null
  workshop: Workshop | null
  assignments: AssignmentData[]
}
type AssignmentData = Pick<EventVolunteerAssignment, 'volunteer' | 'workshop' | 'role' | 'workshopInstanceIds'>

const emptyFormData: FormData = {
  target: null,
  workshop: null,
  assignments: [],
}

const { Form, Field, useAppendToList, RemoveItemButton } = formFor<FormData>()

export function AddVolunteerAssignmentForm({ event, currentAssignments, onClose }: {
  currentAssignments: EventVolunteerAssignment[]
  event: Pick<Event, '_id' | '_versionId' | 'workshops' | 'eventRegistrationSystem'>
  onClose: () => void
}) {
  const t = useT('components.addVolunteerAssignmentForm')
  const [data, setData] = useState<FormData>(emptyFormData)
  const { target } = data

  const onDataChange = (newData: NewValue<FormData>) => {
    const updatedData = typeof newData === 'function' ? newData(data) : newData
    const clearAssignments = !target || (updatedData.target?._id !== target._id)
    const clearWorkshop = !(updatedData.target?.__typename === 'EventRole'
        && updatedData.target.appliesToWorkshops)
    setData({
      target: updatedData.target,
      workshop: clearWorkshop ? null : updatedData.workshop,
      assignments: clearAssignments ? [] : updatedData.assignments,
    })
  }

  return <Card className="relative">
    <H2>{t('title')}</H2>
    <DialogCloseButton
      className="absolute top-3 right-3"
      aria-label={useTranslation('common.close')}
      onClick={() => { setData(emptyFormData); onClose() }}
    />
    {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    <Form value={data} onChange={onDataChange}>
      <div className="flex gap-3">
        <Field
          containerClassName="grow max-w-1/2"
          path="target"
          label={t('chooseAssignmentTarget')}
          component={AddAssignmentTargetSelector}
          componentProps={{ eventId: event._id, eventVersionId: event._versionId }} />
        {target?.__typename === 'EventRole' && target.appliesToWorkshops && (
          <Field
            containerClassName="grow"
            label={t('workshop')}
            path="workshop"
            component={AddAssignmentWorkshopSelector}
            componentProps={{ workshops: event.workshops }} />
        )}
      </div>
      <AssignmentList formData={data} currentAssignments={currentAssignments} event={event} />
    </Form>
  </Card>
}

function AssignmentList({ formData, currentAssignments, event }: {
  formData: FormData
  currentAssignments: EventVolunteerAssignment[]
  event: Pick<Event, '_id' | 'workshops'>
}) {
  const t = useT('components.addVolunteerAssignmentForm')
  const add = useAppendToList('assignments')

  const { target, workshop, assignments } = formData
  if (!target) return null
  if (target.__typename === 'EventRole' && target.appliesToWorkshops && !workshop) return null

  const allAssignments = [...currentAssignments, ...assignments]
  return <FormGroup label={t('assignmentsToAdd')} labelFor="add-volunteer-role">
    <ItemList items={assignments} emptyText={t('noAssignmentsAdded')} columns="grid-cols-[auto_max-content_max-content]">
      {assignments.map((a, i) => <ItemList.Row key={i}>
        <span>
          {target.__typename === 'EventRole' // TODO: nicer formatting
            ? a.volunteer.name
            : (a.workshop ? `${a.role.name} - ${a.workshop.name}` : a.role.name)
          }
        </span>
        <RemoveItemButton minimal icon={<Trash />} path="assignments" index={i} tooltip={t('deleteAssignment')} />
      </ItemList.Row>)}
    </ItemList>
    {target.__typename === 'Volunteer' && (
      <VolunteerRoleSelect
        id="add-volunteer-role"
        currentAssignments={allAssignments}
        workshops={event.workshops}
        onChange={({ workshop, ...role }) => add({
          role,
          workshop,
          volunteer: target,
        })}
        volunteerId={target._id}
      />
    )}
    {target.__typename === 'EventRole' && (
      <VolunteerSelect
        id="add-volunteer"
        eventId={event._id}
        roleId={target._id}
        workshopId={workshop?._id}
        currentAssignments={allAssignments}
        onChange={volunteer => add({
          volunteer,
          role: target,
          workshop,
        })} />
    )}
  </FormGroup>
}
