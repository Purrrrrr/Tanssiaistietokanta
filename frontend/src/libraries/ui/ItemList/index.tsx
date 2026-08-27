import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import classNames from 'classnames'

import type { ItemListProps, RowProps, SortState } from './types'

import { InfoSign } from 'libraries/ui/icons'
import { isInputTag } from 'utils/useOnKeydown'

import Collapse from '../Collapse'
import { Link } from '../Link'
import { Column, LinkGetter, RowState } from './column'
import { SortButton } from './SortButton'
import { useItemList } from './useItemList'

export function ItemList<T extends { _id: string | number }, Key>(props: ItemListProps<T, Key>) {
  const { sort, setSort, columns, items } = useItemList(props)
  const {
    id,
    isTable = true,
    reflowAt = '600px',
    reflowType = 'flex',
    reflowColumns,
    reflowRows,
    emptyText,
    className,
    marginClass,
    rowClassName,
    expandableContent,
    expandableContentLoadingMessage,
  } = props

  if (!items || items.length === 0) {
    return <EmptyList text={emptyText} />
  }

  const rowLink = columns.find(c => c.isRowLink)?.link ?? null
  const columnDefinitions = columns.map(c => c.width).join(' ')

  const Container = isTable ? 'table' : 'ul'
  return <Container
    id={id}
    className={classNames(
      `itemlist reflow-type-${reflowType} border-b border-gray-200`,
      className,
      marginClass ?? 'mb-4',
    )}
    style={{
      '--itemlist-breakpoint': reflowAt === false ? undefined : reflowAt,
      '--itemlist-reflow-columns': toGridSizes(reflowColumns ?? columnDefinitions),
      '--itemlist-reflow-rows': toGridSizes(reflowRows ?? 1),
      '--itemlist-columns': columnDefinitions,
    } as React.CSSProperties}
  >
    {wrap(isTable ? 'thead' : null,
      <Header
        isTable={isTable ?? false}
        columns={columns}
        sort={sort}
        onSort={setSort}
      />,
    )}
    {wrap(isTable ? 'tbody' : null, items.map((item, index) => (
      <Row
        key={item._id}
        item={item}
        index={index}
        selected={props.selection?.selected.includes(item)}
        isTable={isTable ?? false}
        columns={columns}
        rowClassName={rowClassName}
        rowLink={rowLink}
        expandableContent={expandableContent}
        expandableContentLoadingMessage={expandableContentLoadingMessage}
      />
    )))}
  </Container>
}

const toGridSizes = (sizes: number | string) => typeof sizes === 'number' ? `repeat(${sizes}, minmax(0, 1fr))` : sizes

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

function Row<T>({ item, index, isTable, columns, rowLink, rowClassName, expandableContent, expandableContentLoadingMessage, selected }: {
  isTable: boolean
  item: T
  index: number
  columns: Column<T>[]
  rowLink?: LinkGetter<T> | null
  selected?: boolean
} & RowProps<T>) {
  const Container = isTable ? 'tr' : 'li'
  const [expanded, setExpanded] = useState(false)
  const close = () => setExpanded(false)
  const rowState = { index, expanded, setExpanded }
  const navigate = useNavigate()
  const hasExtraRows = expandableContent && isTable

  return <>
    <Container
      onClick={rowLink ? (e) => { if (!isInputTag(e.target)) navigate(rowLink(item, index)) } : undefined}
      className={classNames(
        'itemlist-row border-x first:border border-b border-gray-200 hover:bg-hover-odd',
        rowLink && 'cursor-pointer',
        rowClassName,
        selected && 'bg-selected hover:bg-selected-hover',
        selected
          ? hasExtraRows
            ? 'nth-of-type-[4n+1]:bg-selected-odd nth-of-type-[4n+1]:hover:bg-selected-hover'
            : 'nth-of-type-[even]:bg-selected-odd nth-of-type-[even]:hover:bg-selected-hover'
          : hasExtraRows
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
  const label = column.reflowLabel ? <span className="reflowed-label me-1">{column.label}:{' '}</span> : null
  let children = label ? <>{label}{content}</> : content
  if (column.link) {
    children = <Link
      {...column.link(item, rowState.index)}
      className={classNames('w-full h-full block -m-2 p-2', column.isRowLink && 'itemlist-row-link')}
    >
      {children}
    </Link>
  }
  const CellElement = isTable ? 'td' : 'span'

  return <>
    <CellElement className={classNames(column.className, column.isRowLink && 'itemlist-row-link-cell')}>{children}</CellElement>
    {column.reflowBreakAfter && <CellElement className="reflowed-breaker" />}
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
    return <tr className={classNames('itemlist-expanding-row border-x border-gray-200', expanded && 'border-b')}>
      <td colSpan={colSpan} className="col-span-full">
        <Collapse className="bg-white" isOpen={expanded} loadingMessage={expandableContentLoadingMessage}>
          {children}
        </Collapse>
      </td>
    </tr>
  }

  return <div className={classNames('itemlist-expanding-row border-x border-gray-200', expanded && 'border-b')}>
    <Collapse className="bg-white" isOpen={expanded} loadingMessage={expandableContentLoadingMessage}>
      {children}
    </Collapse>
  </div>
}
