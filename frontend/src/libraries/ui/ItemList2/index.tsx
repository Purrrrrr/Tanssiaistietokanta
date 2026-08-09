import { useState } from 'react'
import classNames from 'classnames'

import { Sort } from './types'

import { InfoSign } from 'libraries/ui/icons'
import { sortedBy } from 'utils/sorted'

import Collapse from '../Collapse'
import { SortButton } from './SortButton'
import { useStoredState } from './useStoredState'

interface ItemListProps<T extends { _id: string | number }> {
  id?: string
  isTable?: boolean
  wrapBreakpoint?: 'md' | 'sm' | 'none'
  marginClass?: string
  items: T[]
  columns: Column<T>[]
  expandableContent: (item: T, close: () => void) => React.ReactNode
  expandableContentLoadingMessage?: string
  defaultSortColumn?: number
  alwaysSortBy?: (item: T) => unknown
  emptyText: React.ReactNode
}

interface Column<T> {
  label?: React.ReactNode
  width?: string
  hidable?: boolean // Can the user choose to hide this column? False by default.
  hiddenByDefault?: boolean // Should this column be hidden by default? False by default. Used in conjunction with hidable to hide columns by default but allow the user to show them.
  visible?: boolean // Should this column exist in this table? True by default. Used to exclude columns in certain tables without removing them from the column list
  content: (item: T, state: RowState) => React.ReactNode
  sortBy?: (a: T) => unknown
}

interface RowState {
  expanded: boolean | undefined
  setExpanded: (expanded: boolean) => void
}

export function ItemList2<T extends { _id: string | number }>({
  id,
  isTable,
  wrapBreakpoint = 'sm',
  items,
  columns,
  defaultSortColumn,
  alwaysSortBy,
  marginClass,
  emptyText,
  expandableContent,
  expandableContentLoadingMessage,
}: ItemListProps<T>) {
  const Container = isTable ? 'table' : 'ul'
  const [sort, setSort] = useStoredState<Sort | null>(id, 'sort', defaultSortColumn !== undefined
    ? { key: defaultSortColumn, direction: 'asc' }
    : null,
  )

  if (items.length === 0) {
    return <EmptyList text={emptyText} />
  }

  const sortColumn = sort !== null ? columns[sort.key] : null
  const sortedItems = sort && sortColumn?.sortBy
    ? sortedBy(items, { key: sortColumn.sortBy, direction: sort.direction }, ...(alwaysSortBy ? [alwaysSortBy] : []))
    : items

  return <Container
    id={id}
    className={`itemlist wrap-${wrapBreakpoint} ${marginClass ?? 'mb-4'} border-b border-gray-200`}
    style={{
      '--itemlist-columns': columns.map(c => c.width ?? 'auto').join(' '),
    } as React.CSSProperties}
  >
    <SectionWrapper element={isTable ? 'thead' : null}>
      <Header
        isTable={isTable ?? false}
        columns={columns}
        sort={sort}
        onSort={setSort} />
    </SectionWrapper>
    <SectionWrapper element={isTable ? 'tbody' : null}>
      {sortedItems.map(item => (
        <Row
          key={item._id}
          item={item}
          isTable={isTable ?? false}
          columns={columns}
          expandableContent={expandableContent}
          expandableContentLoadingMessage={expandableContentLoadingMessage}
        />
      ))
      }
    </SectionWrapper>
  </Container>
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

function Header<T>({ isTable, columns, sort, onSort }: {
  isTable: boolean
  columns: Column<T>[]
  sort: Sort | null
  onSort: (sort: Sort) => void
}) {
  const Container = isTable ? 'tr' : 'li'
  const Cell = isTable ? 'th' : 'span'

  return <Container className="font-bold items-end border-b border-gray-400">
    {columns.map((column, index) => (
      <Cell key={index} className={column.sortBy ? 'itemlist-sortable-header first-of-type:*:rounded-tl-md last-of-type:*:rounded-tr-md' : 'px-2 py-[5px]'}>
        {column.sortBy
          ? (
            <SortButton sortKey={index} currentSort={sort} onSort={onSort}>
              {column.label}
            </SortButton>
          )
          : column.label}
      </Cell>
    ))}
  </Container>
}

function Row<T>({ item, isTable, columns, expandableContent, expandableContentLoadingMessage }: {
  isTable: boolean
  item: T
  columns: Column<T>[]
  expandableContent?: (item: T, close: () => void) => React.ReactNode
  expandableContentLoadingMessage?: string
}) {
  const Container = isTable ? 'tr' : 'li'
  const Cell = isTable ? 'td' : 'span'
  const [expanded, setExpanded] = useState(false)
  const close = () => setExpanded(false)

  return <>
    <Container className={classNames(
      'itemlist-row border-x first:border border-b border-gray-200 p-2',
      isTable && expandableContent
        ? 'nth-of-type-[4n+1]:bg-gray-100'
        : 'nth-of-type-[even]:bg-gray-100',
    )}>
      {columns.map((column, index) => (
        <Cell key={index}>{column.content(item, { expanded, setExpanded })}</Cell>
      ))}
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
