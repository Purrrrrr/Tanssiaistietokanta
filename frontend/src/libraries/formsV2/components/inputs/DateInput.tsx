import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import DatePicker, { DatePickerProps } from 'react-date-picker'

export type DateInputProps = DatePickerProps

export const DateInput = (props: DatePickerProps) => (<DatePicker locale="fi-FI" {...props} />)
