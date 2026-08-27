import type { ActionsColumnProps } from '../types'

import { ChevronDown, ChevronUp } from 'libraries/ui/icons'

import { Button } from '../../Button'
import { Column, columnDefaults } from '../column'
import { ColumnOptionsMenu } from '../ColumnOptionsMenu'
import { ItemListSortState } from './useItemSorting'

export function useActionsColumn<T extends { _id: string | number }>(
  { sort, setSort, sortableColumns }: ItemListSortState<T>,
  {
    actions,
    actionsColumnClassName,
    expandButtonProps,
    expandableContent,
  }: ActionsColumnProps<T> & { expandableContent?: unknown },
): Column<T> | null {
  const hasExpandableContent = expandableContent != null
  const hasActionsColumn = actions != null || sortableColumns.length > 1 || hasExpandableContent

  if (!hasActionsColumn) return null
  return {
    ...columnDefaults,
    id: 'itemlist-actions',
    width: 'max-content',
    link: null,
    label: <ColumnOptionsMenu columns={sortableColumns} sort={sort} setSort={setSort} hasActions={actions != null} />,
    content: (item, rowState) => <>
      {actions && actions(item, rowState.index)}
      {hasExpandableContent && <Button
        {...(typeof expandButtonProps === 'function' ? expandButtonProps(item, rowState) : expandButtonProps)}
        minimal
        rightIcon={rowState.expanded ? <ChevronUp /> : <ChevronDown />}
        onClick={() => rowState.setExpanded(!rowState.expanded)}
      />}
    </>,
    headerClassName: 'itemlist-sortable-header itemlist-sort-menu',
    headerPaddingClassName: '',
    className: actionsColumnClassName ?? 'actions',
  }
}
