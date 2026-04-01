import { createLink } from '@tanstack/react-router'
import { ComponentProps } from 'react'
import { Share } from '@blueprintjs/icons'
import classNames from 'classnames'

import { omitPermissionCheckingProps, withPermissionChecking } from 'libraries/access-control'
import { useDimensionCssVariables } from 'utils/useDimensionCssVariables'

interface MenuProps {
  className?: string
  children: React.ReactNode
  cssDimensionVariablePrefix?: string
}

export function Menu({ className, children, cssDimensionVariablePrefix }: MenuProps) {
  const ref = useDimensionCssVariables(cssDimensionVariablePrefix)

  return <menu className={className}>
    <div className="menu-measure-container flex-col bg-gray-50 rounded min-w-52 py-3" ref={ref}>{children}</div>
  </menu>
}

export function MenuSection({ children, title }: { children: React.ReactNode, title: React.ReactNode }) {
  return <>
    <h2 className="px-4 min-[800px]:my-3 text-lg font-bold">{title}</h2>
    <ul className="max-[800px]:flex flex-wrap">
      {children}
    </ul>
  </>
}

export function MenuItem({ children, selected }: { children: React.ReactNode, selected?: boolean }) {
  return <li className={classNames(
    'py-1.5 px-4 hover:bg-stone-200',
    selected && 'font-bold',
  )}>
    {children}
  </li>
}

interface MenuLinkProps extends ComponentProps<'a'> {
  text?: React.ReactNode
  icon?: React.ReactNode
}

export const MenuLink = createLink(withPermissionChecking(({ children, href, text, icon, ...props }: MenuLinkProps) => {
  const active = props['data-status'] === 'active'
  const openNewTab = props.target === '_blank'
  return <MenuItem selected={active}>
    <a
      {...omitPermissionCheckingProps(props)}
      className={classNames('flex gap-2 w-full', active ? 'text-sky-900' : 'text-link')}
      href={href}
    >
      {text}
      {children}
      {icon ?? (openNewTab && <Share />)}
    </a>
  </MenuItem>
}))
