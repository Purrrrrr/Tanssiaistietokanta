import { type ComponentProps, Fragment, ReactNode } from 'react'
import classNames from 'classnames'

import { InternalItemData, SelectorProps } from './types'

type MenuProps = Omit<ComponentProps<'ul'>, 'className'>

export function Menu(props: MenuProps) {
  return <ul className="overflow-auto p-1 grow" {...props} />
}

export function renderMenuItems<T>(
  itemData: InternalItemData<T>,
  titleRenderer: (title: string) => ReactNode = defaultTitleRenderer,
  itemRenderer: (item: T, index: number) => ReactNode,
) {
  let startingIndex = 0

  return itemData.categories.map(category => {
    const result = <Fragment key={category.title}>
      {itemData.showCategories && titleRenderer(category.title)}
      {category.items.map((item, index) => (itemRenderer(item, index + startingIndex)))}
    </Fragment>
    startingIndex += category.items.length
    return result
  })
}

const defaultTitleRenderer = (title: string) => <strong className="block py-1.5 px-1">{title}</strong>

interface MenuItemProps extends ComponentProps<'li'> {
  highlight?: boolean
  hilightedClassName?: string
}

export function MenuItem({ highlight, className, hilightedClassName, ...props }: MenuItemProps) {
  return <li
    {...props}
    className={classNames(
      className ?? 'flex items-center px-2 min-h-7.5',
      'transition-colors',
      highlight && (hilightedClassName ?? 'bg-blue-200'),
    )}
  />
}

export function toMenuItemProps<T>(
  item: T,
  { itemClassName, hilightedItemClassName, itemIcon, itemRenderer, itemToString = String }: SelectorProps<T>,
): Pick<MenuItemProps, 'className' | 'hilightedClassName' | 'children'> {
  return {
    className: itemClassName,
    hilightedClassName: hilightedItemClassName,
    children: <>

      {itemIcon?.(item)}
      {(itemRenderer ?? itemToString)(item)}
    </>,
  }
}
