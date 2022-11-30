import {formFor} from 'libraries/forms'

import {EventProgramSettings} from './types'

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
  useMoveItemInList,
} = formFor<EventProgramSettings>()
