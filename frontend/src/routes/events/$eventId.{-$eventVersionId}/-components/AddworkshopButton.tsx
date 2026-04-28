import { useState } from 'react'

import { Event } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateWorkshop } from 'services/workshops'

import { useRight } from 'libraries/access-control'
import { TextInput } from 'libraries/formsV2/components/inputs'
import MenuButton from 'libraries/formsV2/components/MenuButton'
import { Button, ButtonProps, FormGroup } from 'libraries/ui'
import { AddButton } from 'components/widgets/AddButton'
import { newInstance } from 'components/WorkshopEditor'
import { useT, useTranslation } from 'i18n'

export function AddWorkshopButton({ event, ...rest }: { event: Event } & ButtonProps) {
  const canCreate = useRight('workshops:create', { context: 'events', contextId: event._id })
  if (!canCreate) return null

  return <MenuButton
    buttonRenderer={props => <AddButton {...rest} {...props} />}
  >
    <CreateWorkshopForm eventId={event._id} startDate={event.beginDate} />
  </MenuButton>
}

export function CreateWorkshopForm({ eventId, startDate }: { eventId: string, startDate: string }) {
  const [name, setName] = useState<null | string>(null)
  const t = useT('routes.events.event.index')
  const [createWorkshop] = useCreateWorkshop()

  return <div className="min-w-60 p-4">
    <h2 className="mb-4 text-lg font-bold">{t('createWorkshopForm.title')}</h2>
    <form onSubmit={async e => {
      e.preventDefault()
      if (name) {
        await addGlobalLoadingAnimation(createWorkshop(newWorkshop({ eventId, name }, startDate)))
      }
    }}>
      <FormGroup label={t('createWorkshopForm.workshopName')} labelFor="name">
        <TextInput id="name" value={name} onChange={setName} onKeyDown={() => { /* Override default keydown blur */ }} />
      </FormGroup>
      <div className="flex flex-row-reverse gap-4">
        <Button color="primary" type="submit" text={t('createWorkshopForm.createWorkshop')} />
        <Button text={useTranslation('common.cancel')} />
      </div>
    </form>
  </div>
}

function newWorkshop({ eventId, name }, startDate: string) {
  const { dances: _ignored1, hasVolunteerAssignments: _ignored2, ...instance } = newInstance(undefined, startDate)
  return {
    eventId: eventId,
    workshop: {
      name,
      instanceSpecificDances: false,
      instances: [
        { danceIds: [], ...instance },
      ],
    },
  }
}
