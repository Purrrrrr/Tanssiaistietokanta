import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import { useId, useState } from 'react'
import DatePicker, { DatePickerProps } from 'react-date-picker'

import { Dropdown, DropdownContainer } from 'libraries/overlays'

export interface DateInputProps extends Omit<DatePickerProps, 'onChange'> {
  readOnly?: boolean
  onChange: (value: Date | null) => void
}

export const DateInput = ({ readOnly, onChange, ...props }: DateInputProps) => {
  const id = useId()
  const [open, setOpen] = useState(false)

  return <DropdownContainer className="w-full flex">
    <DatePicker
      className="grow"
      locale="fi-FI"
      {...props}
      onChange={val => Array.isArray(val) ? onChange(val[1]) : onChange(val)}
      disabled={readOnly}
      onCalendarOpen={() => setOpen(true)}
      onCalendarClose={() => setOpen(false)}
      portalContainer={document.getElementById(id)}
    />
    <Dropdown open={open} onToggle={setOpen} alwaysRenderChildren>
      <div id={id} />
    </Dropdown>
  </DropdownContainer>
}

export default DateInput
