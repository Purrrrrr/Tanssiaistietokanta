import { Button, CssClass } from 'libraries/ui'
import { Cross } from 'libraries/ui/icons'

import AutocompleteInput, { AutocompleteInputProps } from './AutocompleteInput'

interface AutocompleteMultipleInputProps<T> extends Omit<AutocompleteInputProps<T>, 'value' | 'onChange' | 'inputRenderer'> {
  value: T[]
  placeholder: string
  onChange: (value: T[]) => unknown
  // selectedItemClassname?: (item: T) => string | undefined
  selectedItemRenderer?: (item: T) => React.ReactNode
  removeRenderer?: (item: T, onRemove: () => void) => React.ReactNode
}

export default function AutocompleteMultipleInput<T>({
  value, onChange, itemToString = String, selectedItemRenderer, removeRenderer, ...props
}: AutocompleteMultipleInputProps<T>) {
  const renderItem = selectedItemRenderer ?? itemToString
  const renderRemove = removeRenderer ?? defaultRemoveRenderer

  return <AutocompleteInput<T>
    itemToString={itemToString}
    value={null}
    itemHidden={item => value.includes(item)}
    onChange={item => {
      console.log(item)
      if (!value.includes(item)) {
        onChange([...value, item])
      }
    }}
    inputRenderer={props =>
      <ul className={'flex flex-wrap items-center gap-x-1 p-1 rounded-sm ' + CssClass.inputBox}>
        {value.map((item, index) =>
          <li
            className="inline-flex items-center bg-neutral border-1 border-stone-300 ps-2 rounded-sm overflow-clip"
            key={`${itemToString(item)}${index}}`}
          >
            {renderItem(item)}
            {renderRemove(item, () => onChange(value.filter(v => v !== item)))}
          </li>,
        )}
        <input className={CssClass.inputElement + ' basis-10 grow ms-1'} {...props} />
      </ul>
    }
    {...props}
  />
}

function defaultRemoveRenderer<T>(_item: T, onRemove: () => void) {
  return <Button minimal color="danger" onClick={onRemove}><Cross /></Button>
}
