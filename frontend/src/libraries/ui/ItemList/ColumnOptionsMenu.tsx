import classNames from 'classnames'

import type { SortState } from './types'

import { Menu, Sort as SortIcon } from 'libraries/ui/icons'

import { Button } from '../Button'
import { MenuButton } from '../MenuButton'
import { Column } from './column'
import { useT } from './i18n'

export function ColumnOptionsMenu<T>({ columns, sort, setSort, hasActions }: {
  columns: Column<T>[]
  sort: SortState | null
  setSort: (sort: SortState) => void
  hasActions: boolean
}) {
  const hasSortableColumns = columns.filter(c => c.sortBy).length > 1
  const t = useT('')
  return hasSortableColumns &&
    <MenuButton containerClassname="font-normal" buttonProps={{ className: classNames('w-full justify-end pe-4', hasActions || 'not-reflowed:hidden'), minimal: true, rightIcon: <Menu /> }}>
      <div className="px-2 py-1 text-sm text-gray-500">{t('sortBy')}</div>
      {columns.map(({ id, sortBy, label }) => {
        if (!sortBy) return null
        const selected = sort?.key === id
        return <Button
          key={id}
          minimal
          icon={selected ? <SortIcon /> : <span className="w-4" />}
          onClick={() => setSort({ key: id, direction: selected && sort?.direction === 'asc' ? 'desc' : 'asc' })}
          text={label}
        />
      })}
    </MenuButton>
}
