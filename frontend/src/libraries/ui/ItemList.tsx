import React from 'react'
import classNames from 'classnames'

import { CaretDown, InfoSign } from 'libraries/ui/icons'

import { Button } from './Button'

const Collapse = React.lazy(() => import('./Collapse'))

type WrapPoint = 'md' | 'sm' | 'none'

export interface ItemListProps {
  children?: React.ReactNode
  className?: string
  columns?: string | number
  'wrap-breakpoint'?: WrapPoint
  items: unknown[]
  emptyText: string
  noMargin?: boolean
}

const listWrapClasses = {
  md: 'wrap-md md:grid',
  sm: 'wrap-sm sm:grid',
  none: 'wrap-none grid',
} satisfies Record<WrapPoint, string>

export function ItemList({ children, className, items, emptyText, 'wrap-breakpoint': wrapPoint = 'sm', columns, noMargin }: ItemListProps) {
  const columnCount = typeof columns === 'number' ? columns : undefined
  return <ul
    style={{ '--item-list-cols': columnCount } as React.CSSProperties}
    className={classNames(
      className,
      columnCount
        ? 'grid-cols-[repeat(var(--item-list-cols),minmax(0,1fr))]'
        : columns,
      !noMargin && 'mb-4',
      'group border-gray-200 border-b-1 w-full',
      columns && listWrapClasses[wrapPoint],
    )}
  >
    {items.length > 0
      ? children
      : <EmptyList text={emptyText} />
    }
  </ul>
}

const commonRowClasses = classNames(
  'flex flex-wrap items-center grid-cols-subgrid col-span-full',
  'group-[.wrap-md]:md:grid group-[.wrap-sm]:sm:grid group-[.wrap-none]:grid',
)
const rowColorClassname = 'nth-of-type-[even]:bg-gray-100 border-x-1 border-gray-200'
const rowClasses = classNames(
  'first:border-t-1 p-2',
  'gap-4 group-[.wrap-md]:max-md:gap-x-1 group-[.wrap-sm]:max-sm:gap-x-1 group-[.wrap-none]:gap-x-1',
  rowColorClassname,
  commonRowClasses,
)

function ItemListHeader({ children, paddingClass }: { children: React.ReactNode, paddingClass?: string }) {
  return <li className={classNames(
    commonRowClasses,
    'font-bold border-b-1 border-gray-400',
    paddingClass ?? '*:p-2',
  )}>
    {children}
  </li>
}

interface ItemListRowProps {
  children?: React.ReactNode
  expandableContent?: React.ReactNode
  isOpen?: boolean
  paddingClass?: string
  expandableContentLoadingMessage?: string
}

function ItemListRow({ children, expandableContent, expandableContentLoadingMessage, isOpen }: ItemListRowProps) {
  return <>
    <li className={rowClasses}>
      {children}
    </li>
    {expandableContent &&
      <div className={classNames('col-span-full', rowColorClassname)}>
        <Collapse isOpen={isOpen} loadingMessage={expandableContentLoadingMessage}>{expandableContent}</Collapse>
      </div>
    }
  </>
}

function EmptyList({ text }: { text: React.ReactNode }) {
  return <div className="col-span-full p-4 text-base text-center border-b-0 border-gray-200 text-muted border-1">
    <InfoSign size={20} className="mr-2" />
    {text}
  </div>
}

interface SortableItemListHeaderProps {
  columns: {
    key: string
    label: React.ReactNode
  }[]
  currentSort: Sort
  onSort: (key: Sort) => void
}

function SortableItemListHeader({ columns, currentSort, onSort }: SortableItemListHeaderProps) {
  return <ItemListHeader paddingClass="">
    {columns.map(column => (
      <SortButton
        key={column.key}
        sortKey={column.key}
        currentSort={currentSort}
        onSort={onSort}
      >
        {column.label}
      </SortButton>
    ))}
  </ItemListHeader>
}

interface SortButtonProps {
  sortKey: string
  currentSort: Sort
  onSort: (key: Sort) => void
  children: React.ReactNode
}

export interface Sort {
  key: string
  direction: 'asc' | 'desc'
}

function SortButton({ sortKey, currentSort, onSort, children }: SortButtonProps) {
  const isCurrent = currentSort.key === sortKey
  const isAscending = currentSort.direction === 'asc'

  return <Button
    onClick={() => {
      const newDirection = isCurrent && isAscending ? 'desc' : 'asc'
      onSort({ key: sortKey, direction: newDirection })
    }}
    aria-sort={isCurrent ? (isAscending ? 'ascending' : 'descending') : undefined}
    minimal
    className="flex items-center gap-1 first:rounded-tl-md last:rounded-tr-md"
  >
    {children}
    {isCurrent && <CaretDown className={classNames('transition-transform', isAscending && 'rotate-180')} />}
  </Button>
}

ItemList.Header = ItemListHeader
ItemList.SortableHeader = SortableItemListHeader
ItemList.SortButton = SortButton
ItemList.Row = ItemListRow
