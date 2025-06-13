import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import DatePicker, { DatePickerProps } from 'react-date-picker'

export interface DateInputProps extends Omit<DatePickerProps, 'onChange'> {
  readOnly?: boolean
  onChange: (value: Date | null) => void
}

export const DateInput = ({ readOnly, onChange, ...props }: DateInputProps) =>
  (<DatePicker
    locale="fi-FI"
    {...props}
    onChange={val => Array.isArray(val) ? onChange(val[1]) : onChange(val)}
    disabled={readOnly}
  />)

export default DateInput
