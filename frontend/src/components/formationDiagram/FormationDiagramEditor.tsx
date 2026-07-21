import { useCallback } from 'react'

import { EditableFormationDiagram, FormationDiagram } from 'types/formationDiagrams'

import { usePatchFormationDiagram } from 'services/formationDiagrams'

import { patchStrategy, useAutosavingState } from 'libraries/forms'

import { FormationDiagramForm } from './FormationDiagramForm'

export function FormationDiagramEditor({ formationDiagram }: { formationDiagram: Pick<FormationDiagram, '_id' | 'ballroom' | 'description' | 'diagram'> }) {
  const [modifyFormationDiagram] = usePatchFormationDiagram()
  const patchFormationDiagram = useCallback(
    async (patches: unknown[]) => {
      return modifyFormationDiagram({ id: formationDiagram._id, formationDiagram: patches })
    },
    [modifyFormationDiagram, formationDiagram._id],
  )

  const { formProps, state } = useAutosavingState<EditableFormationDiagram, unknown[]>(
    formationDiagram,
    patchFormationDiagram,
    patchStrategy.jsonPatchWithFields(['description', 'ballroom', 'diagram'], ({ ballroom, ...rest }) => ({
      ...rest,
      ballroomId: ballroom?._id ?? null,
    })),
  )

  return <FormationDiagramForm className="p-4" {...formProps} value={formationDiagram} syncStatus={state} />
}
