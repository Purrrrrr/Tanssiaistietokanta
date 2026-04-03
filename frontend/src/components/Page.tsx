import { useEffect, useState } from 'react'
import { Menu as MenuHamburger } from '@blueprintjs/icons'
import classNames from 'classnames'

import { SyncState } from 'libraries/forms'
import { Button } from 'libraries/ui'
import { useT, useTranslation } from 'i18n'
import { navigationHidden } from 'utils/routeUtils'

import { Menu } from './Menu'

import './Page.css'

export * from './Menu'

export interface PageContentProps extends VersionedPageTitleProps {
  logo?: React.ReactNode
  info?: React.ReactNode
  children?: React.ReactNode
  backLink?: React.ReactNode
  syncStatus?: SyncState
  toolbar?: React.ReactNode
  menu?: React.ReactNode
}

export function Page({ children, info, toolbar, backLink, menu, logo, ...props }: PageContentProps) {
  const [menuOpen, setMenuOpen] = useState<boolean>(true)
  const title = useVersionedName(props)
  useSetPageTitle(title)

  if (navigationHidden()) {
    return children
  }

  return <>
    <div className={classNames('page', (!!menu && menuOpen) && 'menu-open')}>
      <div className="page-background" />
      <div className="title flex flex-wrap items-center gap-4 text-amber-100 text-shadow-stone-600 text-shadow-lg">
        {logo}
        <h1 className="h1">{title}</h1>
        <div className="pb-3 text-lg ps-3">{info}</div>
      </div>
      {menu && <MenuToggle onClick={() => setMenuOpen(!menuOpen)} />}
      {toolbar && <div className="toolbar bg-white/60 backdrop-blur-md p-2 rounded-xl">{toolbar}</div>}
      {menu && <Menu className="menu" cssDimensionVariablePrefix="page-menu">{menu}</Menu>}
      <PageContent>
        <div className="backlink">{backLink}</div>
        {children}
      </PageContent>
    </div>
  </>
}

function MenuToggle({ onClick }: { onClick: () => void }) {
  return <div className="menu-toggle flex flex-col justify-end p-2">
    <Button minimal icon={<MenuHamburger />} onClick={onClick}>
      <span className="toggle-text font-bold">{useTranslation('navigation.menu')}</span>
    </Button>
  </div>
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">
    {children}
  </div>
}

function PageContent({ children }: { children: React.ReactNode }) {
  return <div className="content min-w-0">
    {children}
  </div>
}

interface VersionedPageTitleProps {
  title: string
  showVersion?: boolean // True by default
  versionNumber?: number | string | null
}

function useVersionedName({ title, showVersion, versionNumber }: VersionedPageTitleProps) {
  const tCommon = useT('common')

  return showVersion && versionNumber
    ? `${title} (${tCommon('version', { version: versionNumber })})`
    : title
}

function useSetPageTitle(title: string) {
  useEffect(() => {
    document.title = getPageMainTitle() + ' - ' + title
  }, [title])
}

let mainTitle: string
function getPageMainTitle() {
  mainTitle ??= document.title
  return mainTitle
}
