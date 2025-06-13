import 'react-datetime-picker/dist/DateTimePicker.css'
import 'react-calendar/dist/Calendar.css'
import 'react-clock/dist/Clock.css'
import DateTimePicker, { DateTimePickerProps } from 'react-datetime-picker'

export interface DateTimeInputProps extends DateTimePickerProps {
  readOnly?: boolean
}

export const DateTimeInput = ({ readOnly, ...props }: DateTimeInputProps) =>
  (<DateTimePicker locale="fi-FI" {...props} disabled={readOnly} />)

export default DateTimeInput
