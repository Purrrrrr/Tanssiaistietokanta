import { set } from 'partial.lenses'

import {EventProgramRow, EventProgramSettings, IntervalMusic, T} from './types'

import {usePatchEventProgram} from 'services/events'

import {formFor, useAutosavingState, UseAutosavingStateReturn} from 'libraries/forms'

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

export type * from './types'

export const DEFAULT_INTERVAL_MUSIC_DURATION = 15*60
export const DEFAULT_INTERVAL_MUSIC = {
  name: null,
  description: null,
  duration: DEFAULT_INTERVAL_MUSIC_DURATION,
  slideStyleId: null,
} satisfies IntervalMusic

export function useEventProgramEditorForm(eventId: string, eventVersionId: string | undefined, eventProgram: EventProgramSettings): UseAutosavingStateReturn<EventProgramSettings> {
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

export function programItemToString(item: EventProgramRow, t: T) {
  if (item.item.__typename === 'RequestedDance') return t('programTypes.RequestedDance')
  return item.item.name
}
