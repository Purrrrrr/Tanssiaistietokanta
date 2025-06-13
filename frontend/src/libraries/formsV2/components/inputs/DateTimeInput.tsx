import 'react-datetime-picker/dist/DateTimePicker.css'
import 'react-calendar/dist/Calendar.css'
import 'react-clock/dist/Clock.css'
import { useId, useState } from 'react'
import DateTimePicker, { DateTimePickerProps } from 'react-datetime-picker'

import { Dropdown, DropdownContainer } from 'libraries/overlays'

export interface DateTimeInputProps extends DateTimePickerProps {
  readOnly?: boolean
}

export const DateTimeInput = ({ readOnly, ...props }: DateTimeInputProps) => {
  const id = useId()
  const [open, setOpen] = useState(false)

  return <DropdownContainer className="w-full flex">
    <DateTimePicker
      className="grow"
      locale="fi-FI"
      {...props}
      disabled={readOnly}
      onCalendarOpen={() => setOpen(true)}
      onCalendarClose={() => setOpen(false)}
      onClockOpen={() => setOpen(true)}
      onClockClose={() => setOpen(false)}
      portalContainer={document.getElementById(id)}
    />
    <Dropdown open={open} onToggle={setOpen} alwaysRenderChildren>
      <div id={id} />
    </Dropdown>
  </DropdownContainer>
}

export default DateTimeInput
