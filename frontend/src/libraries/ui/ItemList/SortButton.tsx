import React from 'react'
import classNames from 'classnames'

import { SortState } from './types'

import { Button } from '../Button'
import { Icon } from '../Icon'

interface SortButtonProps {
  sortKey: string | number
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
    text={children}
    rightIcon={isCurrent && <Icon icon="caretDown" className={classNames('transition-transform', isAscending && 'rotate-180')} />}
  />
}
