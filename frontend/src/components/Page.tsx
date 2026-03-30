import { createLink } from '@tanstack/react-router'
import { ComponentProps, useState } from 'react'
import { Menu as MenuHamburger, Share } from '@blueprintjs/icons'
import classNames from 'classnames'

import { omitPermissionCheckingProps, withPermissionChecking } from 'libraries/access-control'
import { SyncState } from 'libraries/forms'
import { Button } from 'libraries/ui'
import { navigationHidden } from 'utils/routeUtils'

import { PageTitle } from './PageTitle'
import { VersionedPageTitle } from './versioning/VersionedPageTitle'

import './Page.css'

export interface PageContentProps {
  title: string
  info?: React.ReactNode
  showVersion?: boolean
  versionNumber?: string | number | null
  children?: React.ReactNode
  backLink?: React.ReactNode
  syncStatus?: SyncState
  toolbar?: React.ReactNode
  menu?: React.ReactNode
}

export function Page({ children, title, info, showVersion, versionNumber, toolbar, backLink, menu }: PageContentProps) {
  const [menuOpen, setMenuOpen] = useState<boolean>(shouldMenuBeOpen)
  if (navigationHidden()) {
    return children
  }

  return <>
    {backLink}
    <div className={classNames('page', (!!menu && menuOpen) && 'menu-open')}>
      <div className="title flex flex-wrap items-end gap-4">
        {showVersion && versionNumber
          ? <VersionedPageTitle versionNumber={versionNumber}>{title}</VersionedPageTitle>
          : <PageTitle>{title}</PageTitle>
        }
        <div className="pb-3 text-lg ps-3">{info}</div>
      </div>
      {menu && <div className="menu-toggle col-span-full">
        <Button minimal icon={<MenuHamburger />} className="" onClick={() => setMenuOpen(!menuOpen)} />
      </div>}
      {toolbar && <div className="toolbar">{toolbar}</div>}
      {menu && <Menu open={menuOpen}>{menu}</Menu>}
      <PageContent>{children}</PageContent>
    </div>
  </>
}

function shouldMenuBeOpen() {
  return true || window.innerWidth > 768
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">
    {children}
  </div>
}

function Menu({ children, open }: { children: React.ReactNode, open?: boolean }) {
  if (navigationHidden()) {
    return null
  }

  const classes = classNames(
    'menu flex-col bg-gray-50 rounded min-w-52 py-3',
    open && 'open',
  )

  return <div className={classes}>
    {children}
  </div>
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

function PageContent({ children }: { children: React.ReactNode }) {
  if (navigationHidden()) {
    return children
  }

  return <div className="content min-w-0">
    {children}
  </div>
}
