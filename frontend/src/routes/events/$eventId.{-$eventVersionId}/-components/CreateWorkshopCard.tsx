import { useState } from 'react'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateWorkshop } from 'services/workshops'

import { TextInput } from 'libraries/formsV2/components/inputs'
import { Button, Card, FormGroup } from 'libraries/ui'
import { newInstance } from 'components/WorkshopEditor'
import { useT, useTranslation } from 'i18n'

export function CreateWorkshopCard({ eventId, startDate, onClose }: { eventId: string, startDate: string, onClose: () => void }) {
  const [name, setName] = useState<null | string>(null)
  const t = useT('routes.events.event.index')
  const [createWorkshop] = useCreateWorkshop()

  return <Card marginClass="">
    <h2 className="mb-4 text-lg font-bold">{t('createWorkshopForm.title')}</h2>
    <form onSubmit={async e => {
      e.preventDefault()
      if (name) {
        await addGlobalLoadingAnimation(createWorkshop(newWorkshop({ eventId, name }, startDate)))
        onClose()
      }
    }}>
      <FormGroup label={t('createWorkshopForm.workshopName')} labelFor="name">
        <TextInput id="name" value={name} onChange={setName} onKeyDown={() => { /* Override default keydown blur */ }} />
      </FormGroup>
      <div className="flex flex-row-reverse gap-4">
        <Button color="primary" type="submit" text={t('createWorkshopForm.createWorkshop')} />
        <Button text={useTranslation('common.cancel')} onClick={onClose} />
      </div>
    </form>
  </Card>
}

function newWorkshop({ eventId, name }, startDate: string) {
  const { dances: _, ...instance } = newInstance(undefined, startDate)
  return {
    eventId: eventId,
    workshop: {
      name,
      instanceSpecificDances: false,
      instances: [
        { danceIds: [], description: '', ...instance },
      ],
    },
  }
}
