import classNames from 'classnames'

import { Menu, Sort as SortIcon } from 'libraries/ui/icons'

import { Button } from '../Button'
import { buttonClass } from '../buttonClass'
import { MenuButton } from '../MenuButton'
import { ColumnVisibilityApi } from './hooks/useColumnVisibility'
import { ItemListSortState } from './hooks/useItemSorting'
import { useT } from './i18n'

export function ColumnOptionsMenu<T>({ sortableColumns, sort, setSort, hasActions, visibilityApi }: {
  visibilityApi: ColumnVisibilityApi<T>
  hasActions: boolean
} & ItemListSortState<T>) {
  const showSortActions = sortableColumns.length > 1
  const showToggleActions = visibilityApi.toggleableColumns.length > 0
  const showMenu = showSortActions || showToggleActions

  const t = useT('')
  return showMenu &&
    <MenuButton
      containerClassname="font-normal"
      buttonProps={{
        className: classNames('w-full justify-end pe-4', (hasActions || showToggleActions) || 'not-reflowed:hidden'),
        minimal: true,
        rightIcon: <Menu />,
      }}
    >
      {showSortActions && <>
        <div className="px-2 py-1 text-sm text-gray-500">{t('sortBy')}</div>
        {sortableColumns.map(({ id, sortBy, label }) => {
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
      </>}
      {showToggleActions && <>
        <div className="px-2 py-1 text-sm text-gray-500">{t('toggleColumnVisibility')}</div>
        {visibilityApi.toggleableColumns.map(column => {
          const visible = visibilityApi.isColumnVisible(column)
          const id = `column-visibility-${column.id}`
          return <label key={column.id} htmlFor={id} className={buttonClass('none', { minimal: true })}>
            <input type="checkbox" id={id} checked={visible} onChange={() => visibilityApi.toggleColumnVisibility(column)} />
            {column.label}
          </label>
        })}
      </>}
    </MenuButton>
}
