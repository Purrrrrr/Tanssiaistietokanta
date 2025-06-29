import { useDanceCategories } from 'services/dances'

import FilterableSelect from 'libraries/formsV2/components/inputs/selectors/FilterableSelect'
import { useT } from 'i18n'

export const anyCategory = Symbol()
export type AnyCategory = typeof anyCategory

interface DanceCategoryChooserProps {
  id: string
  value: string | AnyCategory
  onChange: (category: string | AnyCategory) => unknown,
  readOnly?: boolean
  allowEmpty?: boolean,
  allowAnyCategory?: boolean,
  placeholder?: string,
}

export function DanceCategoryChooser({
  id, value, onChange, readOnly, allowAnyCategory, allowEmpty, placeholder,
}: DanceCategoryChooserProps) {
  const t = useT('components.danceCategoryChooser')
  const [categories] = useDanceCategories()
  const items = (allowAnyCategory || allowEmpty)
    ? [
      ...(allowAnyCategory ? [anyCategory] as AnyCategory[] : []),
      ...(allowEmpty ? [''] : []),
      ...categories
    ]
    : categories

  return <FilterableSelect<string | AnyCategory>
    id={id}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    readOnly={readOnly}
    itemToString={category => {
      if (category === anyCategory) return t('anyCategory')
      if (!category) return t('noCategory')
      return category
    }}
    items={items}
  />
}
