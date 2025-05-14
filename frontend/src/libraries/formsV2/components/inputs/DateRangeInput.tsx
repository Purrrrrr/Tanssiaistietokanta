import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css'
import DateRangePicker from '@wojtekmaj/react-daterange-picker'

import { FieldInputComponentProps } from './types'

export type DateRangeInputProps = FieldInputComponentProps<[Date | null, Date | null]>

export const DateRangeInput = ({id, value, onChange, readOnly}: DateRangeInputProps) =>
  <DateRangePicker
    id={id}
    locale="fi-FI"
    value={value}
    onChange={v => onChange(Array.isArray(v) ? v : [v, null])}
    disabled={readOnly}
  />
