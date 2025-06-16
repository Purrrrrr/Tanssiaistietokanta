import { MouseEvent, ReactNode } from 'react'
import classNames from 'classnames'

export interface TagProps {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => unknown
  children: ReactNode
  color?: string
  bg?: string
}


export function TagButton({ onClick, children, color, bg }: TagProps) {
  return <button
    type="button"
    onClick={onClick}
    style={{
      color,
      backgroundColor: bg,
    }}
    className={classNames(
      'cursor-pointer rounded-sm p-1.5 focus:outline-2! hover:brightness-110 focus:outline-green-500',
      !color && 'text-white',
      !bg && 'bg-green-700',
    )}>
    {children}
  </button>
}

