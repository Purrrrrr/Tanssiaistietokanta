import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import { useRef, useState } from 'react'
import DatePicker, { DatePickerProps } from 'react-date-picker'

import { Dropdown, DropdownContainer } from 'libraries/overlays'

export interface DateInputProps extends Omit<DatePickerProps, 'onChange'> {
  readOnly?: boolean
  onChange: (value: Date | null) => void
}

export const DateInput = ({ readOnly, onChange, ...props }: DateInputProps) => {
  const [open, setOpen] = useState(false)
  const dropdown = useRef<HTMLDivElement>(null)

  return <DropdownContainer className="flex w-full">
    <DatePicker
      className="grow"
      locale="fi-FI"
      {...props}
      onChange={val => Array.isArray(val) ? onChange(val[1]) : onChange(val)}
      disabled={readOnly}
      onCalendarOpen={() => setOpen(true)}
      onCalendarClose={() => setOpen(false)}
      portalContainer={dropdown.current}
    />
    <Dropdown open={open} onToggle={setOpen} alwaysRenderChildren>
      <div ref={dropdown} />
    </Dropdown>
  </DropdownContainer>
}

export default DateInput
