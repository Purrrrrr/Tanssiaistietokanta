import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import classNames from 'classnames'

import { type SortState } from './types'
import { SelectionApi } from 'libraries/common/selection/types'

import { ChevronDown, ChevronUp, InfoSign, Menu, Sort as SortIcon } from 'libraries/ui/icons'
import { type Sort, sortedBy } from 'utils/sorted'
import { isInputTag } from 'utils/useOnKeydown'

import { Button, ButtonProps } from '../Button'
import Collapse from '../Collapse'
import { Link } from '../Link'
import { MenuButton } from '../MenuButton'
import { Column, columnDefaults, ColumnInput, LinkGetter, normalizeColumnInput, RowState } from './column'
import { SelectionBox } from './SelectionBox'
import { SortButton } from './SortButton'

interface ItemListProps<T, Key = never> extends RowProps<T> {
  id?: string
  isTable?: boolean
  wrapBreakpoint?: 'md' | 'sm' | 'none'
  wrapType?: 'grid' | 'flex'
  className?: string
  marginClass?: string
  items: T[] | null | undefined
  labelTranslator?: (key: Key) => string
  selection?: Pick<SelectionApi<T>, 'selectAllProps' | 'selectItemProps'> | null
  selectorColumnClassName?: string
  columns: ColumnInput<T, Key>[]
  actions?: false | ((item: T, index: number) => React.ReactNode)
  actionsColumnClassName?: string
  expandButtonProps?: ButtonProps | ((item: T, state: RowState) => ButtonProps)
  defaultColumnWidth?: string
  defaultSort?: SortState | string | null
  alwaysSortBy?: Sort<T> | null
  emptyText: React.ReactNode
}

interface RowProps<T> {
  rowClassName?: string
  expandableContent?: (item: T, close: () => void) => React.ReactNode
  expandableContentLoadingMessage?: string
}

const specialColumnDefaults = {
  ...columnDefaults,
  width: 'max-content',
  link: null,
} as const

export function ItemList2<T extends { _id: string | number }, Key>({
  id,
  isTable = true,
  wrapBreakpoint = 'sm',
  wrapType = 'flex',
  emptyText,
  columns: columnInputs,
  labelTranslator,
  items,
  defaultSort,
  alwaysSortBy,
  className,
  marginClass,
  defaultColumnWidth = 'auto',
  selection,
  selectorColumnClassName,
  actions,
  actionsColumnClassName,
  rowClassName,
  expandableContent,
  expandButtonProps,
  expandableContentLoadingMessage,
}: ItemListProps<T, Key>) {
  const columns = columnInputs.map(col => normalizeColumnInput(col, labelTranslator))
  const sortableColumns = columns.filter(c => c.sortBy)
  const [sort, setSort] = useState<SortState | null>(() => {
    if (typeof defaultSort === 'object') {
      return defaultSort
    }
    const column = defaultSort ? sortableColumns.find(c => c.id === defaultSort) : sortableColumns[0]
    return column ? { key: column.id, direction: 'asc' as const } : null
  })

  if (!items || items.length === 0) {
    return <EmptyList text={emptyText} />
  }

  const sortedItems = getSortedItems({ items, columns, sort, alwaysSortBy })
  const visibleColumns = columns.filter(c => c.enabled)
  const rowLink = visibleColumns.find(c => c.isRowLink)?.link ?? null
  if (selection) {
    visibleColumns.unshift({
      ...specialColumnDefaults,
      id: 'itemlist-selection',
      label: <SelectionBox {...selection.selectAllProps} />,
      content: item => <SelectionBox {...selection.selectItemProps(item)} />,
      headerPaddingClassName: 'selector',
      className: selectorColumnClassName ?? 'selector',
    })
  }
  const hasActionsColumn = actions != null || sortableColumns.length > 1 || expandableContent != null
  if (hasActionsColumn) {
    visibleColumns.push({
      ...specialColumnDefaults,
      id: 'itemlist-actions',
      label: <ColumnOptionsMenu columns={columns} sort={sort} setSort={setSort} />,
      content: (item, rowState) => <>
        {actions && actions(item, rowState.index)}
        {expandableContent && <Button
          {...(typeof expandButtonProps === 'function' ? expandButtonProps(item, rowState) : expandButtonProps)}
          minimal
          rightIcon={rowState.expanded ? <ChevronUp /> : <ChevronDown />}
          onClick={() => rowState.setExpanded(!rowState.expanded)}
        />}
      </>,
      headerClassName: 'itemlist-sortable-header itemlist-sort-menu',
      headerPaddingClassName: '',
      className: actionsColumnClassName ?? 'actions',
    })
  }

  const Container = isTable ? 'table' : 'ul'
  return <Container
    id={id}
    className={classNames(
      `itemlist wrap-${wrapBreakpoint} wrap-type-${wrapType} border-b border-gray-200`,
      className,
      marginClass ?? 'mb-4',
    )}
    style={{ '--itemlist-columns': (visibleColumns.map(c => c.width ?? defaultColumnWidth)).join(' ') } as React.CSSProperties}
  >
    {wrap(isTable ? 'thead' : null,
      <Header
        isTable={isTable ?? false}
        columns={visibleColumns}
        sort={sort}
        onSort={setSort}
      />,
    )}
    {wrap(isTable ? 'tbody' : null, sortedItems.map((item, index) => (
      <Row
        key={item._id}
        item={item}
        index={index}
        isTable={isTable ?? false}
        columns={visibleColumns}
        rowClassName={rowClassName}
        rowLink={rowLink}
        expandableContent={expandableContent}
        expandableContentLoadingMessage={expandableContentLoadingMessage}
      />
    )))}
  </Container>
}

function ColumnOptionsMenu<T>({ columns, sort, setSort }: {
  columns: Column<T>[]
  sort: SortState | null
  setSort: (sort: SortState) => void
}) {
  const hasSortableColumns = columns.filter(c => c.sortBy).length > 1
  return hasSortableColumns &&
    <MenuButton containerClassname="font-normal" buttonProps={{ className: 'w-full justify-end pe-4', minimal: true, rightIcon: <Menu /> }}>
      <div className="px-2 py-1 text-sm text-gray-500">Sort by</div>
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
  if (sort) {
    const sortBy = columns.find(c => c.id === sort.key)?.sortBy
    if (sortBy) {
      const sorting: Sort<T> = { key: sortBy, direction: sort.direction }
      return sortedBy(items, sorting, alwaysSortBy ?? [])
    }
  }
  if (alwaysSortBy != null) {
    return sortedBy(items, alwaysSortBy)
  }
  return items
}

const wrap = (Elem: null | 'tbody' | 'thead', children: React.ReactNode) => Elem
  ? <Elem>{children}</Elem>
  : children

function EmptyList({ text }: { text: React.ReactNode }) {
  return <div className="p-4 text-base text-center border-gray-200 text-muted border">
    <InfoSign size={20} className="mr-2" />
    {text}
  </div>
}

function Header<T>({ isTable, columns, sort, onSort }: {
  isTable: boolean
  columns: Column<T>[]
  sort: SortState | null
  onSort: (sort: SortState) => void
}) {
  const Container = isTable ? 'tr' : 'li'
  const Cell = isTable ? 'th' : 'span'
  console.log(columns)
  return <Container className="itemlist-header font-bold items-end border-b border-gray-400">
    {columns.map(column => {
      return <Cell key={column.id} className={classNames(
        column.sortBy && 'itemlist-sortable-header',
        column.headerPaddingClassName ?? (!column.sortBy && 'px-2 py-1.25'),
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
  </Container>
}

function Row<T>({ item, index, isTable, columns, rowLink, rowClassName, expandableContent, expandableContentLoadingMessage }: {
  isTable: boolean
  item: T
  index: number
  columns: Column<T>[]
  rowLink?: LinkGetter<T> | null
} & RowProps<T>) {
  const Container = isTable ? 'tr' : 'li'
  const [expanded, setExpanded] = useState(false)
  const close = () => setExpanded(false)
  const rowState = { index, expanded, setExpanded }
  const navigate = useNavigate()

  return <>
    <Container
      onClick={rowLink ? (e) => { if (!isInputTag(e.target)) navigate(rowLink(item, index)) } : undefined}
      className={classNames(
        'itemlist-row border-x first:border border-b border-gray-200 hover:bg-hover-odd',
        rowLink && 'cursor-pointer',
        rowClassName,
        isTable && expandableContent
          ? 'nth-of-type-[4n+1]:bg-gray-100 nth-of-type-[4n+1]:hover:bg-hover'
          : 'nth-of-type-[even]:bg-gray-100 nth-of-type-[even]:hover:bg-hover',
      )}>
      {columns.map(column => (
        <Cell
          key={column.id}
          isTable={isTable}
          column={column}
          item={item}
          rowState={rowState}
        />
      ))}
    </Container>
    {expandableContent &&
      <ExpandableRow isTable={isTable} colSpan={columns.length} expanded={expanded} expandableContentLoadingMessage={expandableContentLoadingMessage}>
        {expandableContent(item, close)}
      </ExpandableRow>
    }
  </>
}

function Cell<T>({ isTable, column, item, rowState }: {
  isTable: boolean
  column: Column<T>
  item: T
  rowState: RowState
}) {
  const content = column.content(item, rowState)
  const label = column.wrapLabeled ? <span className="wrapped-label me-1">{column.label}:{' '}</span> : null
  let children = label ? <>{label}{content}</> : content
  if (column.link) {
    children = <Link {...column.link(item, rowState.index)} className="w-full h-full block -m-2 p-2 itemlist-row-link">
      {children}
    </Link>
  }
  const CellElement = isTable ? 'td' : 'span'

  return <>
    <CellElement className={column.className}>{children}</CellElement>
    {column.wrappedBreakAfter && <CellElement className="wrapped-breaker" />}
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
