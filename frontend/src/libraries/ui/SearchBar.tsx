import { MouseEvent } from 'react'
import { Cross, Search } from '@blueprintjs/icons'

import { Button } from './Button'
import { CssClass } from './classes'

interface SearchInputProps {
  id?: string
  value: string
  placeholder?: string
  emptySearchText: string,
  onChange: (value: string) => unknown
}

export function SearchBar({id, onChange, value, placeholder, emptySearchText} : SearchInputProps) {
  return <div id={id} className={CssClass.inputGroup}>
    <Search />
    <input
      type="text"
      className={CssClass.input+' px-4'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
    <span className={CssClass.inputAction}>
      <Button
        className="px-2 m-1 h-6"
        aria-label={emptySearchText}
        minimal
        icon={<Cross />}
        onClick={(e: MouseEvent<HTMLElement>) => {
          onChange('');
          (e.target as HTMLButtonElement).closest('.bp5-input-group')?.querySelector('input')?.focus()
        }}
      />
    </span>
  </div>
}
