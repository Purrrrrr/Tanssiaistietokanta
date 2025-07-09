import {useState } from 'react'
import { Cross, Edit } from '@blueprintjs/icons'

import {ActionButton as Button } from 'libraries/forms'
import { Input, useValueAt } from 'components/event/EventProgramForm'
import {useTranslation} from 'i18n'

export function DanceSetNameEditor({ itemIndex } : { itemIndex: number }) {
  const label = useTranslation('components.eventProgramEditor.fields.danceSetName')
  const name = useValueAt(`danceSets.${itemIndex}.title`)

  const [editingName, setEditingName] = useState(false)
  const buttonTitle = useTranslation(editingName ? 'common.closeEditor' : 'components.eventProgramEditor.buttons.editDanceSetName')

  return <>
    {editingName
      ? <Input labelStyle="hidden" label={label} path={`danceSets.${itemIndex}.title`} inline />
      : name
    }
    <Button
      color="primary"
      minimal
      icon={editingName ? <Cross /> : <Edit />}
      title={buttonTitle}
      aria-label={buttonTitle}
      onClick={() => setEditingName(!editingName)}
    />
  </>
}
