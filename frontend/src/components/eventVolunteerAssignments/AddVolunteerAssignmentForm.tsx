import { useState } from 'react'

import { Event, EventVolunteerAssignment } from 'types'

import { Button, Card, DialogCloseButton, FormGroup, H2 } from 'libraries/ui'
import { Cross } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'

import { AddVolunteerRoleSelect } from './AddVolunteerRoleSelect'
import { VolunteerSelect } from './VolunteerSelect'

export function AddVolunteerAssignmentForm({ event, currentAssignments, onClose }: {
  currentAssignments: EventVolunteerAssignment[]
  event: Pick<Event, '_id' | 'workshops' | 'eventRegistrationSystem'>
  onClose: () => void
}) {
  const t = useT('components.addVolunteerAssignmentForm')
  const [volunteer, setVolunteer] = useState<{ _id: string, name: string } | null>(null)
  return <Card className="relative">
    <H2>{t('title')}</H2>
    <DialogCloseButton
      className="absolute top-3 right-3"
      aria-label={useTranslation('common.close')}
      onClick={() => { setVolunteer(null); onClose() }}
    />
    <FormGroup label={t('volunteer')} labelFor="add-volunteer">
      {volunteer
        ? <>
          <span className="italic">{volunteer.name}</span>
          {' '}
          <Button
            minimal
            paddingClass="p-1"
            aria-label={t('chooseAnotherVolunteer')}
            tooltip={t('chooseAnotherVolunteer')}
            icon={<Cross />}
            onClick={() => setVolunteer(null)}
          />
        </>
        : (
          <VolunteerSelect
            id="add-volunteer"
            eventId={event._id}
            currentAssignments={[]}
            onChange={setVolunteer} />
        )
      }
    </FormGroup>
    {volunteer && (
      <FormGroup label={t('rolesToAdd')} labelFor="add-volunteer-role">
        <AddVolunteerRoleSelect
          id="add-volunteer-role"
          currentAssignments={currentAssignments}
          event={event}
          volunteerId={volunteer._id}
        />
      </FormGroup>
    )}
  </Card>
}
