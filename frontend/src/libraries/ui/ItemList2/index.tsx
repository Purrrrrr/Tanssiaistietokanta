import { useState } from 'react'
import classNames from 'classnames'

import { type SortState } from './types'
import { SelectionApi } from 'libraries/common/selection/types'

import { ChevronDown, ChevronUp, InfoSign, Menu, Sort as SortIcon } from 'libraries/ui/icons'
import { SelectionBox } from 'components/widgets/SelectionBox'
import { type Sort, sortedBy } from 'utils/sorted'

import { Button, ButtonProps } from '../Button'
import Collapse from '../Collapse'
import { MenuButton } from '../MenuButton'
import { Column, ColumnInput, normalizeColumnInput, RowState } from './column'
import { SortButton } from './SortButton'

interface ItemListProps<T, Key = never> {
  id?: string
  isTable?: boolean
  wrapBreakpoint?: 'md' | 'sm' | 'none'
  className?: string
  marginClass?: string
  items: T[] | null | undefined
  labelTranslator?: (key: Key) => string
  selection?: Pick<SelectionApi<T>, 'selectAllProps' | 'selectItemProps'> | null
  columns: ColumnInput<T, Key>[]
  actions?: false | ((item: T, index: number) => React.ReactNode)
  defaultColumnWidth?: string
  expandableContent?: (item: T, close: () => void) => React.ReactNode
  expandButtonProps?: ButtonProps | ((item: T, state: RowState) => ButtonProps)
  expandableContentLoadingMessage?: string
  defaultSort?: SortState | string | null
  alwaysSortBy?: Sort<T> | Sort<T>[] | null
  emptyText: React.ReactNode
}

export function ItemList2<T extends { _id: string | number }, Key>(props: ItemListProps<T, Key>) {
  const {
    id,
    isTable = true,
    wrapBreakpoint = 'sm',
    items,
    defaultSort,
    alwaysSortBy,
    className,
    marginClass,
    defaultColumnWidth = 'auto',
    emptyText,
    actions,
    expandableContent,
    expandButtonProps,
    expandableContentLoadingMessage,
  } = props
  const Container = isTable ? 'table' : 'ul'
  const columns = getColumns(props)
  const sortableColumns = columns.filter(c => c.sortBy)
  const [sort, setSort] = useState<SortState | null>(() => {
    if (defaultSort === undefined) {
      if (sortableColumns[0]?.sortBy) {
        return { key: sortableColumns[0].id, direction: 'asc' }
      }
      return null
    }
    if (typeof defaultSort === 'object') {
      return defaultSort
    }
    const column = sortableColumns.find(c => c.id === defaultSort)
    if (column?.sortBy) {
      return { key: column.id, direction: 'asc' }
    }
    return null
  })
  const hasActionsColumn = actions != null || sortableColumns.length > 1 || expandableContent != null

  if (!items || items.length === 0) {
    return <EmptyList text={emptyText} />
  }

  const sortedItems = getSortedItems({ items, columns, sort, alwaysSortBy })
  const visibleColumns = columns.filter(c => c.enabled)
  const columnWidths = visibleColumns.map(c => c.width ?? defaultColumnWidth)
  if (hasActionsColumn) columnWidths.push('max-content')

  return <Container
    id={id}
    className={classNames(
      `itemlist wrap-${wrapBreakpoint}  border-b border-gray-200`,
      className,
      marginClass ?? 'mb-4',
    )}

    style={{
      '--itemlist-columns': columnWidths.join(' '),
    } as React.CSSProperties}
  >
    <SectionWrapper element={isTable ? 'thead' : null}>
      <Header
        isTable={isTable ?? false}
        columns={visibleColumns}
        sort={sort}
        onSort={setSort}
        hasActionsColumn={hasActionsColumn}
      />
    </SectionWrapper>
    <SectionWrapper element={isTable ? 'tbody' : null}>
      {sortedItems.map((item, index) => (
        <Row
          key={item._id}
          item={item}
          index={index}
          isTable={isTable ?? false}
          columns={visibleColumns}
          actions={actions !== false ? actions : undefined}
          expandableContent={expandableContent}
          expandButtonProps={expandButtonProps}
          expandableContentLoadingMessage={expandableContentLoadingMessage}
        />
      ))
      }
    </SectionWrapper>
  </Container>
}

function getColumns<T, Key>(
  { columns: columnInputs, selection, labelTranslator }: ItemListProps<T, Key>,
): Column<T>[] {
  const columns = columnInputs.map(col => normalizeColumnInput(col, labelTranslator))
  if (selection) {
    const selectColumn: Column<T> = {
      id: 'itemlist-selection',
      label: <SelectionBox {...selection.selectAllProps} />,
      content: item => <SelectionBox {...selection.selectItemProps(item)} />,
      sortBy: null,
      width: 'max-content',
      wrappedStyle: 'small',
      enabled: true,
    }
    return [selectColumn, ...columns]
  }

  return columns
}

function ColumnOptionsMenu<T>({ columns, sort, setSort }: {
  columns: Column<T>[]
  sort: SortState | null
  setSort: (sort: SortState) => void
}) {
  const hasSortableColumns = columns.some(c => c.sortBy)
  return <MenuButton containerClassname="font-normal" buttonProps={{ className: 'w-full justify-end pe-4', minimal: true, rightIcon: <Menu /> }}>
    {hasSortableColumns && <div className="px-2 py-1 text-sm text-gray-500">Sort by</div>}
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

function getSortedItems<T, Key>({ items: maybeItems, columns, sort, alwaysSortBy }: Pick<ItemListProps<T, Key>, 'items' | 'alwaysSortBy'> & {
  sort: SortState | null
  columns: Column<T>[]
}) {
  const items = maybeItems ?? []
  const additionalSorts = toArray(alwaysSortBy ?? [])
  if (sort) {
    const sortBy = columns.find(c => c.id === sort.key)?.sortBy
    if (sortBy) {
      const sorting: Sort<T> = { key: sortBy, direction: sort.direction }
      return sortedBy(items, sorting, ...additionalSorts)
    }
  }
  if (additionalSorts.length > 0) {
    return sortedBy(items, ...additionalSorts)
  }
  return items
}

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

function EmptyList({ text }: { text: React.ReactNode }) {
  return <div className="p-4 text-base text-center border-gray-200 text-muted border">
    <InfoSign size={20} className="mr-2" />
    {text}
  </div>
}

function SectionWrapper({ children, element: Element }: {
  children: React.ReactNode
  element: null | 'tbody' | 'thead'
}) {
  if (Element === null) return <>{children}</>

  return <Element>{children}</Element>
}

function Header<T>({ isTable, columns, sort, onSort, hasActionsColumn }: {
  isTable: boolean
  columns: Column<T>[]
  hasActionsColumn?: boolean
  sort: SortState | null
  onSort: (sort: SortState) => void
}) {
  const Container = isTable ? 'tr' : 'li'
  const Cell = isTable ? 'th' : 'span'

  return <Container className="itemlist-header font-bold items-end border-b border-gray-400">
    {columns.map(column => {
      return <Cell key={column.id} className={classNames(
        column.sortBy
          ? 'itemlist-sortable-header'
          : 'px-2 py-[5px]',
        column.headerClassName,
        sort?.key === column.id && 'itemlist-sorted-header',
      )}>
        {column.sortBy
          ? (
            <SortButton sortKey={column.id} currentSort={sort} onSort={onSort}>
              {column.label} {column.labelInfo}
            </SortButton>
          )
          : column.labelInfo
            ? <>{column.label} {column.labelInfo}</>
            : column.label}
      </Cell>
    })}
    {hasActionsColumn && <Cell className="itemlist-sortable-header itemlist-sort-menu">
      <ColumnOptionsMenu columns={columns} sort={sort} setSort={onSort} />
    </Cell>}
  </Container>
}

function Row<T>({ item, index, isTable, columns, actions, expandableContent, expandButtonProps, expandableContentLoadingMessage }: {
  isTable: boolean
  item: T
  index: number
  columns: Column<T>[]
  actions?: (item: T, index: number) => React.ReactNode
  expandableContent?: (item: T, close: () => void) => React.ReactNode
  expandButtonProps?: ButtonProps | ((item: T, state: RowState) => ButtonProps)
  expandableContentLoadingMessage?: string
}) {
  const Container = isTable ? 'tr' : 'li'
  const Cell = isTable ? 'td' : 'span'
  const [expanded, setExpanded] = useState(false)
  const close = () => setExpanded(false)
  const rowState = { index, expanded, setExpanded }

  return <>
    <Container className={classNames(
      'itemlist-row border-x first:border border-b border-gray-200 p-2 hover:bg-hover-odd',
      isTable && expandableContent
        ? 'nth-of-type-[4n+1]:bg-gray-100 nth-of-type-[4n+1]:hover:bg-hover'
        : 'nth-of-type-[even]:bg-gray-100 nth-of-type-[even]:hover:bg-hover',
    )}>
      {columns.map(column => (
        <Cell className={column.className} key={column.id}>{column.content(item, rowState)}</Cell>
      ))}
      {(actions != null || expandableContent != null) &&
        <Cell className="itemlist-actions-column">
          {actions?.(item, index)}
          {expandableContent && <Button
            {...(typeof expandButtonProps === 'function' ? expandButtonProps(item, rowState) : expandButtonProps)}
            minimal
            rightIcon={expanded ? <ChevronUp /> : <ChevronDown />}
            onClick={() => setExpanded(!expanded)}
          />}
        </Cell>
      }
    </Container>
    {expandableContent &&
      <ExpandableRow isTable={isTable} colSpan={columns.length} expanded={expanded} expandableContentLoadingMessage={expandableContentLoadingMessage}>
        {expandableContent(item, close)}
      </ExpandableRow>
    }
  </>
}

function ExpandableRow({ isTable, colSpan, children, expanded, expandableContentLoadingMessage }: {
  isTable: boolean
  colSpan: number
  children: React.ReactNode
  expanded: boolean
  expandableContentLoadingMessage?: string
}) {
  if (isTable) {
    return <tr className="border-x border-b border-gray-200">
      <td colSpan={colSpan} className="col-span-full">
        <Collapse className="bg-white" isOpen={expanded} loadingMessage={expandableContentLoadingMessage}>
          {children}
        </Collapse>
      </td>
    </tr>
  }

  return <div className="col-span-full border-x border-b border-gray-200">
    <Collapse className="bg-white" isOpen={expanded} loadingMessage={expandableContentLoadingMessage}>
      {children}
    </Collapse>
  </div>
}
