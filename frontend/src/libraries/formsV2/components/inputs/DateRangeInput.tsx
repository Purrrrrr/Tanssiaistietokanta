import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css'
import DateRangePicker from '@wojtekmaj/react-daterange-picker'
import { useRef, useState } from 'react'

import { FieldInputComponentProps } from './types'

import { Dropdown, DropdownContainer } from 'libraries/overlays'

export interface DateRangeInputProps extends FieldInputComponentProps<[Date | null, Date | null]> {
  minDate?: Date
  maxDate?: Date
}

export const DateRangeInput = ({ id, value, onChange, readOnly, ...props }: DateRangeInputProps) => {
  const [open, setOpen] = useState(false)
  const dropdown = useRef<HTMLDivElement>(null)

  return <DropdownContainer className="flex w-min">
    <DateRangePicker
      {...props}
      className="grow max-w-70"
      id={id}
      locale="fi-FI"
      value={value}
      onChange={v => onChange(Array.isArray(v) ? v : [v, null])}
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

export default DateRangeInput
