import {useCallback } from 'react'

import {Dance, DanceWithEvents, EditableDance} from 'types'

import { cleanMetadataValues } from 'backend'
import { usePatchDance } from 'services/dances'

import {formFor, patchStrategy, useAutosavingState} from 'libraries/forms'

const {
  Form,
  Field,
  Input,
  useValueAt,
  useOnChangeFor,
} = formFor<EditableDance>()

export { Field, Form, Input, useOnChangeFor, useValueAt }

export function useDanceEditorState(dance: Dance) {
  const readOnly = dance._versionId != null
  const [modifyDance] = usePatchDance()
  const patchDance = useCallback(
    async (patches : Partial<DanceWithEvents>) => {
      if (readOnly) return
      return modifyDance({id: dance._id, dance: cleanMetadataValues(patches)})
    },
    [modifyDance, dance._id, readOnly]
  )
  const { wikipage: _ignored, ...editedDance } = dance

  const { formProps, ...rest } = useAutosavingState<EditableDance, Partial<EditableDance>>(editedDance, patchDance, patchStrategy.partial)

  return {
    formProps: {
      ...formProps, readOnly
    },
    ...rest,
  }
}
