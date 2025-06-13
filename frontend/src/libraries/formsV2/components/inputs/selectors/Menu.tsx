import { type ComponentProps, forwardRef } from 'react'
import classNames from 'classnames'

import { SelectorProps } from './types'

type MenuProps = Omit<ComponentProps<'ul'>, 'className'>

export const Menu = forwardRef<HTMLUListElement, MenuProps>(
  function Menu(props: MenuProps, ref) {
    return <ul className="overflow-auto p-1 grow" ref={ref} {...props} />
  }
)

interface MenuItemProps extends ComponentProps<'li'> {
  highlight?: boolean
  hilightedClassName?: string
}

export const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(
  function MenuItem({ highlight, className, hilightedClassName, ...props }: MenuItemProps, ref) {
    return <li
      ref={ref}
      {...props}
      className={classNames(
        className ?? 'flex items-center px-2 py-1.5',
        'transition-colors',
        highlight && (hilightedClassName ?? 'bg-blue-200')
      )}
    />
  }
)

export function toMenuItemProps<T>(
  item: T,
  { itemClassName, hilightedItemClassName, itemIcon, itemRenderer, itemToString = String }: SelectorProps<T>
): Pick<MenuItemProps, 'className' | 'hilightedClassName' | 'children'> {
  return {
    className: itemClassName,
    hilightedClassName: hilightedItemClassName,
    children: <>

      {itemIcon?.(item)}
      {(itemRenderer ?? itemToString)(item)}
    </>
  }
}
