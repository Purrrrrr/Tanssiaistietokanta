import type { FieldInputComponent } from './types'

export const TextInput : FieldInputComponent<string | undefined | null, string> = ({value, onChange, ...rest}) =>
  <input value={value ?? ''} onChange={e => onChange(e.target.value)} {...rest} />
