import { type ComponentProps, forwardRef } from 'react'
import classNames from 'classnames'

type MenuProps = Omit<ComponentProps<'ul'>, 'className'>

export const Menu = forwardRef<HTMLUListElement, MenuProps>(
  function Menu(props: MenuProps, ref) {
    return <ul className="overflow-auto max-h-[60dvh] " ref={ref} {...props} />
  }
)

interface MenuItemProps extends Omit<ComponentProps<'li'>, 'className'> {
  highlight?: boolean
}

export const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(
  function MenuItem({ highlight, ...props }: MenuItemProps, ref) {
    return <li ref={ref} {...props} className={classNames('flex items-center px-2 py-1.5 transition-colors', highlight && 'bg-blue-200' ) } />
  }
)
