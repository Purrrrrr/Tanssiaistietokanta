import React from 'react'
import classNames from 'classnames'

import { SortState } from './types'

import { CaretDown } from 'libraries/ui/icons'

import { Button } from '../Button'

interface SortButtonProps {
  sortKey: string
  currentSort: SortState | null
  onSort: (key: SortState) => void
  children: React.ReactNode
  className?: string
  tooltip?: React.ReactNode
}

export function SortButton({ sortKey, currentSort, onSort, className, children, tooltip }: SortButtonProps) {
  const isCurrent = currentSort?.key === sortKey
  const isAscending = currentSort?.direction === 'asc'

  return <Button
    onClick={() => {
      const newDirection = isCurrent && isAscending ? 'desc' : 'asc'
      onSort({ key: sortKey, direction: newDirection })
    }}
    aria-sort={isCurrent ? (isAscending ? 'ascending' : 'descending') : undefined}
    minimal
    className={classNames(className, 'flex gap-1 items-center w-full')}
    tooltip={tooltip}
  >
    {children}
    {isCurrent && <CaretDown className={classNames('transition-transform', isAscending && 'rotate-180')} />}
  </Button>
}
