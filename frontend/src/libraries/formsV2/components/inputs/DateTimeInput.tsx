import 'react-datetime-picker/dist/DateTimePicker.css'
import 'react-calendar/dist/Calendar.css'
import 'react-clock/dist/Clock.css'
import { useRef, useState } from 'react'
import DateTimePicker, { DateTimePickerProps } from 'react-datetime-picker'

import { Dropdown, DropdownContainer } from 'libraries/overlays'

export interface DateTimeInputProps extends DateTimePickerProps {
  readOnly?: boolean
}

export const DateTimeInput = ({ readOnly, ...props }: DateTimeInputProps) => {
  const [open, setOpen] = useState(false)
  const dropdown = useRef<HTMLDivElement>(null)

  return <DropdownContainer className="flex w-full">
    <DateTimePicker
      className="grow"
      locale="fi-FI"
      {...props}
      disabled={readOnly}
      onCalendarOpen={() => setOpen(true)}
      onCalendarClose={() => setOpen(false)}
      onClockOpen={() => setOpen(true)}
      onClockClose={() => setOpen(false)}
      // This is a horrible hack. When we manage to replace this with another date range picker, we should remove the dropdown ref.
      /* eslint-disable-next-line react-hooks/refs */
      portalContainer={dropdown.current}
    />
    <Dropdown open={open} onToggle={setOpen} alwaysRenderChildren>
      <div ref={dropdown} />
    </Dropdown>
  </DropdownContainer>
}

export default DateTimeInput
