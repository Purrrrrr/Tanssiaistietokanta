import { useState } from 'react'

import { Ballroom } from 'types'
import { EditableFormationDiagram, FormationDiagram } from 'types/formationDiagrams'

import { useCreateFormationDiagram } from 'services/formationDiagrams'

import { defaultDiagram } from 'libraries/fabric/FabricEditor'
import { Card, DialogCloseButton, H2 } from 'libraries/ui'
import { useT, useTranslation } from 'i18n'

import { FormationDiagramForm } from './FormationDiagramForm'

const emptyData: EditableFormationDiagram = {
  ballroom: null as unknown as Ballroom,
  description: '',
  diagram: defaultDiagram,
}

export function AddFormationDiagramForm({ onSubmit, onClose }: {
  onSubmit: (formationDiagram: FormationDiagram) => void
  onClose: () => void
}) {
  const [formationDiagram, setFormationDiagram] = useState<EditableFormationDiagram>(emptyData)
  const t = useT('components.AddFormationDiagramForm')
  const [createFormationDiagram] = useCreateFormationDiagram()

  const handleSubmit = async () => {
    if (!formationDiagram.ballroom) return
    const { data } = await createFormationDiagram({
      formationDiagram: {
        ballroomId: formationDiagram.ballroom?._id,
        description: formationDiagram.description,
        diagram: formationDiagram.diagram,
      },
    })
    const created = data?.createFormationDiagram
    if (created) {
      setFormationDiagram(emptyData)
      onClose()
      onSubmit(created)
    }
  }

  return (
    <Card className="relative">
      <H2>{t('createFormationDiagram')}</H2>
      <DialogCloseButton
        className="absolute top-3 right-3"
        aria-label={useTranslation('common.close')}
        onClick={() => { setFormationDiagram(emptyData); onClose() }}
      />
      <FormationDiagramForm
        submitText={t('createFormationDiagram')}
        onSubmit={handleSubmit}
        value={formationDiagram as EditableFormationDiagram}
        onChange={setFormationDiagram}
      />
    </Card>
  )
}
