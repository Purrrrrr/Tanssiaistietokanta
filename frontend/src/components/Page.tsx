import { createLink } from '@tanstack/react-router'
import { ComponentProps } from 'react'
import classNames from 'classnames'

import { omitPermissionCheckingProps, withPermissionChecking } from 'libraries/access-control'
import { SyncState } from 'libraries/forms'
import { navigationHidden } from 'utils/routeUtils'

import { PageTitle } from './PageTitle'
import { VersionedPageTitle } from './versioning/VersionedPageTitle'
import { Share } from '@blueprintjs/icons'

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
  if (navigationHidden()) {
    return children
  }

  return <div className="grid grid-cols-[auto_1fr] grid-rows-[auto_auto_1fr] gap-4">
    <div className="col-span-full">
      {backLink}
    </div>
    <div className="col-span-full -mb-4 flex items-end gap-4">
      {showVersion && versionNumber
        ? <VersionedPageTitle versionNumber={versionNumber}>{title}</VersionedPageTitle>
        : <PageTitle>{title}</PageTitle>
      }
      <div className="grow text-lg ps-3 pb-3">{info}</div>
      {toolbar}
    </div>
    {menu && <Menu>{menu}</Menu>}
    <PageContent>{children}</PageContent>
  </div>
}

function Menu({ children }: { children: React.ReactNode }) {
  if (navigationHidden()) {
    return null
  }

  return <div className="min-w-52 bg-gray-50 rounded flex flex-col">
    {children}
  </div>
}

export function MenuSection({ children, title }: { children: React.ReactNode, title: React.ReactNode }) {
  return <>
    <h2 className="px-4 font-bold my-3 text-lg">{title}</h2>
    <ul className="mb-3">
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

  return <div className="col-start-2 min-w-0">
    {children}
  </div>
}
