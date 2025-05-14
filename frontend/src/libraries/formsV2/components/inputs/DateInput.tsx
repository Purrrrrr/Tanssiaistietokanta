import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import DatePicker, { DatePickerProps } from 'react-date-picker'

export interface DateInputProps extends DatePickerProps {
  readOnly?: boolean
}

export const DateInput = ({ readOnly, ...props }: DateInputProps) =>
  (<DatePicker locale="fi-FI" {...props} disabled={readOnly} />)
