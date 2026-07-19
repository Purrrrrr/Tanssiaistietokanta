import { useCallback } from 'react'
import * as L from 'partial.lenses'

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
  'slideStyleId',
  'tags',
  'formationInstructions',
]

export function useDanceEditorState(dance: Dance) {
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
    dance,
    patchDance,
    patchStrategy.jsonPatchWithFields(
      editableDanceFields,
      L.modify(['formationInstructions', L.elems],
        ({ ballroom, ...rest }) => ({
          ...rest,
          ballroomId: ballroom?._id ?? null,
        }),
      ),
    ),
  )

  return {
    formProps: {
      ...formProps, readOnly,
    },
    ...rest,
  }
}
