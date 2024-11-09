import { set } from 'partial.lenses'

import {usePatchEventProgram} from 'services/events'

import {formFor, useAutosavingState} from 'libraries/forms'

import {EventProgramSettings} from '../types'
import {JSONPatch, patch} from './patchStrategy'

export const {
  Input,
  Field,
  Switch,
  switchFor,
  Form,
  ListField,
  RemoveItemButton,
  useValueAt,
  useOnChangeFor,
  useAppendToList,
} = formFor<EventProgramSettings>()

export type {EventProgramSettings} from '../types'

export function useEventProgramEditorForm(eventId: string, eventVersionId: string | undefined, eventProgram: EventProgramSettings) {
  const readOnly = eventVersionId !== undefined
  const [patchEventProgram] = usePatchEventProgram()
  const saveProgram = async (program) => {
    if (readOnly) return
    return patchEventProgram({id: eventId, program})
  }

  const data = useAutosavingState<EventProgramSettings, JSONPatch>(eventProgram, saveProgram, patch)

  return readOnly
    ? set(['formProps', 'readOnly'], readOnly, data)
    : data
}
