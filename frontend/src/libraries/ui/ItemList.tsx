import React from 'react'
import { InfoSign } from '@blueprintjs/icons'
import classNames from 'classnames'

const Collapse = React.lazy(() => import('./Collapse'))

type WrapPoint = 'md' | 'sm'

export interface ItemListProps {
  children?: React.ReactNode
  className?: string
  columns?: string | number
  'wrap-breakpoint'?: WrapPoint
  items: unknown[]
  emptyText: string
}

const listWrapClasses = {
  md: 'wrap-md md:grid',
  sm: 'wrap-sm sm:grid',
} satisfies Record<WrapPoint, string>

export default function ItemList({ children, className, items, emptyText, 'wrap-breakpoint': wrapPoint = 'sm', columns }: ItemListProps) {
  const columnCount = typeof columns === 'number' ? columns : undefined
  return <ul
    style={{ '--item-list-cols': columnCount } as React.CSSProperties}
    className={classNames(
      className,
      columnCount
        ? 'grid-cols-[repeat(var(--item-list-cols),minmax(0,1fr))]'
        : columns,
      'group mb-4 border-gray-200 border-b-1 w-full',
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
  'flex flex-wrap gap-4 items-center p-2',
  'group-[.wrap-md]:md:grid grid-cols-subgrid col-span-full',
  'group-[.wrap-sm]:sm:grid grid-cols-subgrid col-span-full',
)
const rowColorClassname = 'nth-of-type-[even]:bg-gray-100 border-x-1 border-gray-200'
const rowClasses = classNames(
  'first:border-t-1',
  rowColorClassname,
  commonRowClasses,
)

function ItemListHeader({ children }: { children: React.ReactNode }) {
  return <li className={classNames(commonRowClasses, 'font-bold border-b-1 border-gray-400')}>
    {children}
  </li>
}

interface ItemListRowProps {
  children?: React.ReactNode
  expandableContent?: React.ReactNode
  isOpen?: boolean
}

function ItemListRow({ children, expandableContent, isOpen }: ItemListRowProps) {
  return <>
    <li className={rowClasses}>
      {children}
    </li>
    {expandableContent &&
      <div className={classNames('col-span-full', rowColorClassname)}>
        <Collapse isOpen={isOpen}>{expandableContent}</Collapse>
      </div>
    }
  </>
}

function EmptyList({ text }: { text: React.ReactNode }) {
  return <div className="col-span-full py-4 text-base text-center border-b-0 border-gray-200 text-muted border-1">
    <InfoSign size={20} className="mr-2" />
    {text}
  </div>
}

ItemList.Header = ItemListHeader
ItemList.Row = ItemListRow
