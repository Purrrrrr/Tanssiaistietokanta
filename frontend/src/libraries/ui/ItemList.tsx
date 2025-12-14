import React from 'react'
import classNames from 'classnames'

const Collapse = React.lazy(() => import('./Collapse'))

type WrapPoint = 'md' | 'sm'

export interface ItemListProps {
  children?: React.ReactNode
  columns?: string | number
  'wrap-breakpoint'?: WrapPoint
}

const listWrapClasses = {
  md: 'wrap-md md:grid',
  sm: 'wrap-sm sm:grid',
} satisfies Record<WrapPoint, string>

export default function ItemList({ children, 'wrap-breakpoint': wrapPoint = 'sm', columns }: ItemListProps) {
  const columnCount = typeof columns === 'number' ? columns : undefined
  return <ul
    style={{ '--item-list-cols': columnCount } as React.CSSProperties}
    className={classNames(
      columnCount
        ? 'grid-cols-[repeat(var(--item-list-cols),minmax(0,1fr))]'
        : columns,
      'group mb-4 border-gray-100 border-b-1 w-full',
      columns && listWrapClasses[wrapPoint],
    )}
  >
    {children}
  </ul>
}

const commonRowClasses = classNames(
  'flex flex-wrap gap-4 items-center p-2',
  'group-[.wrap-md]:md:grid grid-cols-subgrid col-span-full',
  'group-[.wrap-sm]:sm:grid grid-cols-subgrid col-span-full',
)
const rowColorClassname = 'nth-of-type-[even]:bg-gray-100 border-x-1 border-gray-100'
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

ItemList.Header = ItemListHeader
ItemList.Row = ItemListRow
