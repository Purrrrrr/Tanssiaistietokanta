import React from 'react'
import classNames from 'classnames'

const Collapse = React.lazy(() => import('./Collapse'))

type WrapPoint = 'md' | 'sm'

export interface ItemListProps {
  children?: React.ReactNode
  'wrap-breakpoint'?: WrapPoint
}

const listWrapClasses = {
  'md': 'wrap-md md:table',
  'sm': 'wrap-sm sm:table'
} satisfies Record<WrapPoint, string>

export default function ItemList({ children, 'wrap-breakpoint': wrapPoint = 'sm' }: ItemListProps) {
  return <ul
    className={classNames(
      'group mb-4 border-gray-100 border-1 w-full',
      listWrapClasses[wrapPoint],
    )}
  >
    {children}
  </ul>
}

const rowClasses = classNames(
  'flex flex-wrap justify-end items-center *:p-2 even:bg-gray-100',
  'group-[.wrap-md]:md:table-row group-[.wrap-md]:md:*:table-cell',
  'group-[.wrap-sm]:sm:table-row group-[.wrap-sm]:sm:*:table-cell',
)

interface ItemListRowProps {
  children?: React.ReactNode
  expandableContent?: React.ReactNode
  isOpen?: boolean
}

function ItemListRow({ children, expandableContent, isOpen }: ItemListRowProps) {
  if (expandableContent !== undefined) {
    // The tr/td tags are a hack, not sure if full width is possible otherwise
    return <>
      <ItemListRow>{children}</ItemListRow>
      <tr>
        <td colSpan={100}>
          <Collapse isOpen={isOpen}>{expandableContent}</Collapse>
        </td>
      </tr>
    </>
  }

  return <li className={rowClasses}>{children}</li>
}

ItemList.Row = ItemListRow
