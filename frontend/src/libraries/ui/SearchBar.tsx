import { MouseEvent } from 'react'

import { Cross, Search } from 'libraries/ui/icons'

import { Button } from './Button'
import { CssClass } from './classes'

interface SearchInputProps {
  id?: string
  value: string
  placeholder?: string
  emptySearchText: string
  onChange: (value: string) => unknown
}

export function SearchBar({ id, onChange, value, placeholder, emptySearchText }: SearchInputProps) {
  return <div id={id} className="relative">
    <Search className="absolute top-0 left-0 text-gray-600 m-[7px] z-1" />
    <input
      type="text"
      className={CssClass.input + ' px-7.5! w-full'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
    <Button
      className="absolute top-0 right-0 px-2 m-1 h-6"
      aria-label={emptySearchText}
      minimal
      icon={<Cross className="text-gray-600" />}
      onClick={(e: MouseEvent<HTMLElement>) => {
        onChange('');
        (e.target as HTMLButtonElement).closest('.bp5-input-group')?.querySelector('input')?.focus()
      }}
    />
  </div>
}
