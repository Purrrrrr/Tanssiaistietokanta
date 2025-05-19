import { type ComponentProps, type ReactNode, forwardRef } from 'react'
import classNames from 'classnames'

interface MenuContainerProps {
  open: boolean
  children: ReactNode
}

export const MenuContainer = ({ children, open }: MenuContainerProps) => {
  return <div className={classNames(
    'absolute top-full z-50 w-fit transition-all origin-top bg-white shadow-black/40 shadow-md',
    open || 'scale-y-0 opacity-0',
  )}>
    {children}
  </div>
}

type MenuProps = Omit<ComponentProps<'ul'>, 'className'>

export const Menu = forwardRef<HTMLUListElement, MenuProps>(
  function Menu(props: MenuProps, ref) {
    return <ul ref={ref} {...props} />
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
