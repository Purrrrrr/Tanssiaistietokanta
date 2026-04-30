import { useCallback } from 'react'

import { Dance, EditableDance } from 'types'

import { cleanMetadataValues } from 'backend'
import { usePatchDance } from 'services/dances'

import { useRight } from 'libraries/access-control'
import { formFor, patchStrategy, useAutosavingState } from 'libraries/forms'

const {
  Form,
  Field,
  Input,
  useValueAt,
  useOnChangeFor,
} = formFor<EditableDance>()

export { Field, Form, Input, useOnChangeFor, useValueAt }

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
  const { wikipage: _ignored, ...editedDance } = cleanMetadataValues<Dance>(dance)

  const { formProps, ...rest } = useAutosavingState<EditableDance, unknown[]>(editedDance, patchDance, patchStrategy.jsonPatch)

  return {
    formProps: {
      ...formProps, readOnly,
    },
    ...rest,
  }
}
