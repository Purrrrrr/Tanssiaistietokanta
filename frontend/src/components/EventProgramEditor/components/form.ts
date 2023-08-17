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

export function useEventProgramEditorForm(eventId: string, eventProgram: EventProgramSettings) {
  const [patchEventProgram] = usePatchEventProgram()
  const saveProgram = (program) => patchEventProgram({id: eventId, program})

  return useAutosavingState<EventProgramSettings, JSONPatch>(eventProgram, saveProgram, patch)
}
