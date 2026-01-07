import { Dance } from 'types'

import { useDanceCategories } from 'services/dances'

import { Select } from 'libraries/formsV2/components/inputs'
import { ColorClass } from 'libraries/ui'
import { useT } from 'i18n'

interface DanceCategoryChooserProps {
  id: string
  value: string
  onChange: (category: string) => unknown
  readOnly?: boolean
  allowEmpty?: boolean
  placeholder?: string
}

export function DanceCategoryChooser({
  id, value, onChange, readOnly, allowEmpty, placeholder,
}: DanceCategoryChooserProps) {
  const t = useT('components.danceCategoryChooser')
  const [categories] = useDanceCategories()
  const items = allowEmpty
    ? ['', ...categories]
    : categories

  return <Select<string>
    filterable
    id={id}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    readOnly={readOnly}
    itemToString={category => {
      if (!category) return t('noCategory')
      return category
    }}
    items={items}
  />
}

export const anyCategory = Symbol()
export type AnyCategory = typeof anyCategory

interface DanceViewCategorySelectorProps {
  id: string
  value: DanceViewCategory
  onChange: (category: DanceViewCategory) => unknown
  dances: Dance[]
}

export type DanceViewCategory = string | AnyCategory

export function DanceViewCategorySelector({ id, value, onChange, dances }: DanceViewCategorySelectorProps) {
  const t = useT('components.danceCategoryChooser')
  const [categories] = useDanceCategories()
  const items = [
    anyCategory,
    '',
    ...categories,
  ] as DanceViewCategory[]

  const countsByCategory: Map<DanceViewCategory, Dance[]> = Map.groupBy(dances, dance => dance.category ?? '')
  countsByCategory.set(anyCategory, dances)
  const itemToString = (category: DanceViewCategory) => {
    if (category === anyCategory) return t('anyCategory')
    if (!category) return t('noCategory')
    return category
  }

  return <Select<DanceViewCategory>
    filterable
    id={id}
    value={value}
    onChange={onChange}
    itemToString={itemToString}
    itemRenderer={item => <>
      <span className="me-1">{itemToString(item)}</span>
      <span className={ColorClass.textMuted}>({countsByCategory.get(item)?.length ?? 0})</span>

    </>}
    items={items}
  />
}
