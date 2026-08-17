import { useState } from 'react'
import classNames from 'classnames'

import { type SortState } from './types'
import { SelectionApi } from 'libraries/common/selection/types'

import { InfoSign } from 'libraries/ui/icons'
import { SelectionBox } from 'components/widgets/SelectionBox'
import { type Sort, sortedBy } from 'utils/sorted'

import Collapse from '../Collapse'
import { Column, ColumnInput, normalizeColumnInput } from './column'
import { SortButton } from './SortButton'

interface ItemListProps<T> {
  id?: string
  isTable?: boolean
  wrapBreakpoint?: 'md' | 'sm' | 'none'
  className?: string
  marginClass?: string
  items: T[] | null | undefined
  selection?: Pick<SelectionApi<T>, 'selectAllProps' | 'selectItemProps'> | null
  columns: ColumnInput<T>[]
  expandableContent?: (item: T, close: () => void) => React.ReactNode
  expandableContentLoadingMessage?: string
  defaultSort?: SortState | string | null
  alwaysSortBy?: Sort<T> | Sort<T>[] | null
  emptyText: React.ReactNode
}

export function ItemList2<T extends { _id: string | number }>(props: ItemListProps<T>) {
  const {
    id,
    isTable,
    wrapBreakpoint = 'sm',
    items,
    defaultSort,
    alwaysSortBy,
    className,
    marginClass,
    emptyText,
    expandableContent,
    expandableContentLoadingMessage,
  } = props
  const Container = isTable ? 'table' : 'ul'
  const columns = getColumns(props)
  const [sort, setSort] = useState<SortState | null>(() => {
    if (defaultSort === undefined) {
      const firstSortableColumn = columns.find(c => c.sortBy)
      if (firstSortableColumn?.sortBy) {
        return { key: firstSortableColumn.sortBy.name, direction: 'asc' }
      }
      return null
    }
    if (typeof defaultSort === 'object') {
      return defaultSort
    }
    const column = columns.find(c => c.sortBy?.name === defaultSort)
    if (column?.sortBy) {
      return { key: column.sortBy.name, direction: 'asc' }
    }
    return null
  })

  if (!items || items.length === 0) {
    return <EmptyList text={emptyText} />
  }

  const sortedItems = getSortedItems({ items, columns, sort, alwaysSortBy })
  const visibleColumns = columns.filter(c => c.enabled)

  return <Container
    id={id}
    className={classNames(
      `itemlist wrap-${wrapBreakpoint}  border-b border-gray-200`,
      className,
      marginClass ?? 'mb-4',
    )}

    style={{
      '--itemlist-columns': visibleColumns.map(c => c.width ?? 'auto').join(' '),
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
      {sortedItems.map((item, index) => (
        <Row
          key={item._id}
          item={item}
          index={index}
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

function getColumns<T>({ columns: columnInputs, selection }: ItemListProps<T>): Column<T>[] {
  const columns = columnInputs.map(normalizeColumnInput)
  if (selection) {
    const selectColumn: Column<T> = {
      id: 'itemlist-selection',
      label: {
        content: <SelectionBox {...selection.selectAllProps} />,
      },
      content: item => <SelectionBox {...selection.selectItemProps(item)} />,
      sortBy: null,
      width: 'max-content',
      enabled: true,
    }
    return [selectColumn, ...columns]
  }

  return columns
}

function getSortedItems<T>({ items: maybeItems, columns, sort, alwaysSortBy }: Pick<ItemListProps<T>, 'items' | 'alwaysSortBy'> & {
  sort: SortState | null
  columns: Column<T>[]
}) {
  const items = maybeItems ?? []
  const additionalSorts = toArray(alwaysSortBy ?? [])
  if (sort) {
    const sortBy = columns.find(c => c.sortBy?.name === sort.key)?.sortBy?.value
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
    {columns.map(column => {
      const label = typeof column.label === 'object' && column.label !== null && 'content' in column.label
        ? column.label.content
        : column.label

      return <Cell key={column.id} className={classNames(
        column.sortBy
          ? 'itemlist-sortable-header first-of-type:*:rounded-tl-md last-of-type:*:rounded-tr-md'
          : 'px-2 py-[5px]',
        column.headerClassName,
      )}>
        {column.sortBy
          ? (
            <SortButton sortKey={column.sortBy.name} currentSort={sort} onSort={onSort}>
              {label}
            </SortButton>
          )
          : label}
      </Cell>
    })}
  </Container>
}

function Row<T>({ item, index, isTable, columns, expandableContent, expandableContentLoadingMessage }: {
  isTable: boolean
  item: T
  index: number
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
      {columns.map(column => (
        <Cell className={column.className} key={column.id}>{column.content(item, { index, expanded, setExpanded })}</Cell>
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
