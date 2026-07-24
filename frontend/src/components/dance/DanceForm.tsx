import { useCallback } from 'react'

import { Dance, EditableDance } from 'types'

import { usePatchDance } from 'services/dances'

import { useRight } from 'libraries/access-control'
import { formFor, patchStrategy, useAutosavingState } from 'libraries/forms'

const {
  Form,
  Field,
  Input,
  useValueAt,
  useOnChangeFor,
  useAppendToList,
  RemoveItemButton,
} = formFor<EditableDance>()

export { Field, Form, Input, RemoveItemButton, useAppendToList, useOnChangeFor, useValueAt }

const editableDanceFields: (keyof EditableDance)[] = [
  'name',
  'description',
  'remarks',
  'duration',
  'prelude',
  'formation',
  'source',
  'category',
  'instructions',
  'wikipageName',
  'slideStyleId',
  'tags',
  'formationDiagrams',
]

export function useDanceEditorState(dance: Omit<Dance, 'formationDiagrams'> & { formationDiagrams?: Dance['formationDiagrams'] }) {
  const canEdit = useRight('dances:modify', { entityId: dance._id })
  const readOnly = dance._versionId != null || !canEdit
  const [modifyDance] = usePatchDance()
  const patchDance = useCallback(
    async (patches: unknown[]) => {
      if (readOnly) return
      return modifyDance({ id: dance._id, dance: patches })
    },
    [modifyDance, dance._id, readOnly],
  )

  const { formProps, ...rest } = useAutosavingState<EditableDance, unknown[]>(
    { formationDiagrams: [], ...dance },
    patchDance,
    patchStrategy.jsonPatchWithFields(
      editableDanceFields,
      ({ formationDiagrams, ...dance }) => ({
        ...dance,
        formationDiagramIds: formationDiagrams.map(d => d._id),
      }),
    ),
  )

  return {
    formProps: {
      ...formProps, readOnly,
    },
    ...rest,
  }
}
