import { useState } from 'react'
import classNames from 'classnames'

import { type SortState } from './types'

import { InfoSign } from 'libraries/ui/icons'
import { type Sort, sortedBy } from 'utils/sorted'

import Collapse from '../Collapse'
import { Column, ColumnInput, normalizeColumnInput } from './column'
import { SortButton } from './SortButton'
import { useStoredState } from './useStoredState'

interface ItemListProps<T> {
  id?: string
  isTable?: boolean
  wrapBreakpoint?: 'md' | 'sm' | 'none'
  marginClass?: string
  items: T[]
  columns: ColumnInput<T>[]
  expandableContent: (item: T, close: () => void) => React.ReactNode
  expandableContentLoadingMessage?: string
  defaultSort?: string | null
  alwaysSortBy?: Sort<T> | Sort<T>[] | null
  emptyText: React.ReactNode
}

export function ItemList2<T extends { _id: string | number }>({
  id,
  isTable,
  wrapBreakpoint = 'sm',
  items,
  columns: columnInputs,
  defaultSort,
  alwaysSortBy,
  marginClass,
  emptyText,
  expandableContent,
  expandableContentLoadingMessage,
}: ItemListProps<T>) {
  const Container = isTable ? 'table' : 'ul'
  const columns = columnInputs.map(normalizeColumnInput)
  const [sort, setSort] = useStoredState<SortState | null>(id, 'sort', defaultSort ? { key: defaultSort, direction: 'asc' } : null)
  console.log(sort, columns)

  if (items.length === 0) {
    return <EmptyList text={emptyText} />
  }

  const sortedItems = getSortedItems({ items, columns, sort, alwaysSortBy })
  const visibleColumns = columns.filter(c => c.enabled)

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
        columns={visibleColumns}
        sort={sort}
        onSort={setSort} />
    </SectionWrapper>
    <SectionWrapper element={isTable ? 'tbody' : null}>
      {sortedItems.map(item => (
        <Row
          key={item._id}
          item={item}
          isTable={isTable ?? false}
          columns={visibleColumns}
          expandableContent={expandableContent}
          expandableContentLoadingMessage={expandableContentLoadingMessage}
        />
      ))
      }
    </SectionWrapper>
  </Container>
}

function getSortedItems<T>({ items, columns, sort, alwaysSortBy }: Pick<ItemListProps<T>, 'items' | 'alwaysSortBy'> & {
  sort: SortState | null
  columns: Column<T>[]
}) {
  const additionalSorts = toArray(alwaysSortBy ?? [])
  if (sort) {
    const sortBy = columns.find(c => c.sortBy?.sortName === sort.key)?.sortBy?.value
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

function Header<T>({ isTable, columns, sort, onSort }: {
  isTable: boolean
  columns: Column<T>[]
  sort: SortState | null
  onSort: (sort: SortState) => void
}) {
  const Container = isTable ? 'tr' : 'li'
  const Cell = isTable ? 'th' : 'span'

  return <Container className="font-bold items-end border-b border-gray-400">
    {columns.map((column, index) => {
      const label = typeof column.label === 'object' && column.label !== null && 'content' in column.label
        ? column.label.content
        : column.label

      return <Cell key={index} className={classNames(
        column.sortBy && 'itemlist-sortable-header first-of-type:*:rounded-tl-md last-of-type:*:rounded-tr-md',
        column.headerClassName,
        'px-2 py-[5px]',
      )}>
        {column.sortBy
          ? (
            <SortButton sortKey={column.sortBy.sortName} currentSort={sort} onSort={onSort}>
              {label}
            </SortButton>
          )
          : label}
      </Cell>
    })}
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
        <Cell className={column.className} key={index}>{column.content(item, { expanded, setExpanded })}</Cell>
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
