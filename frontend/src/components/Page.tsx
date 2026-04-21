import { useMatches } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Menu as MenuHamburger } from '@blueprintjs/icons'
import classNames from 'classnames'

import { SyncState } from 'libraries/forms'
import { Button } from 'libraries/ui'
import { Breadcrumb, BreadcrumbsContainer } from 'libraries/ui/Breadcrumbs'
import { useT, useTranslation } from 'i18n'
import { navigationHidden } from 'utils/routeUtils'

import { Menu } from './Menu'

import './Page.css'

export * from './Menu'

export interface PageContentProps extends VersionedPageTitleProps {
  background?: 'default' | 'dances' | 'volunteers' | 'ball'
  logo?: React.ReactNode
  info?: React.ReactNode
  children?: React.ReactNode
  syncStatus?: SyncState
  toolbar?: React.ReactNode
  menu?: React.ReactNode
}

export function Page({ children, info, toolbar, menu, logo, background, ...props }: PageContentProps) {
  const [menuOpen, setMenuOpen] = useState<boolean>(true)
  const title = useVersionedName(props)
  useSetPageTitle(title)

  if (navigationHidden()) {
    return children
  }

  return <>
    <div className={classNames('page', (!!menu && menuOpen) && 'menu-open', background && `background-${background}`)}>
      <div className="page-background" />
      <div className="flex flex-wrap gap-x-4 items-center title">
        {logo}
        <h1 className="text-amber-100 h1 text-shadow-stone-600 text-shadow-lg">{title}</h1>
        <div className="pb-3 text-lg text-amber-100 ps-3 text-shadow-stone-600 text-shadow-lg">{info}</div>
        {toolbar && <div className="p-2 rounded-xl toolbar bg-white/60 backdrop-blur-md">{toolbar}</div>}
      </div>
      <div className="flex navigation">
        {menu && <MenuToggle onClick={() => setMenuOpen(!menuOpen)} />}
        <Breadcrumbs />
      </div>
      {menu && <Menu className="menu" cssDimensionVariablePrefix="page-menu">{menu}</Menu>}
      <PageContent>
        {children}
      </PageContent>
    </div>
  </>
}

function Breadcrumbs() {
  const T = useT('')
  const matches = useMatches()
  const breadcrumbs = matches
    .map(route => route.staticData?.breadcrumb ? ({ route, breadcrumb: route.staticData.breadcrumb }) : null)
    .filter(r => r !== null)

  return <BreadcrumbsContainer label={useTranslation('navigation.breadcrumbs')}>
    {breadcrumbs.length > 1 && breadcrumbs.map(({ route, breadcrumb }) =>
      typeof breadcrumb === 'function'
        ? renderComponent(breadcrumb, route.id)
        : (
          <Breadcrumb
            key={route.id}
            to={route.pathname}
            params={route.params}
            text={T(breadcrumb)}
          />
        ),
    )}
  </BreadcrumbsContainer>
}

const renderComponent = (Crumb: () => React.ReactNode, key: string) => <Crumb key={key} />

function MenuToggle({ onClick }: { onClick: () => void }) {
  return <div className="flex flex-col justify-end p-2">
    <Button minimal icon={<MenuHamburger />} onClick={onClick}>
      <span className="sr-only">{useTranslation('navigation.menu')}</span>
    </Button>
  </div>
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 items-center">
    {children}
  </div>
}

function PageContent({ children }: { children: React.ReactNode }) {
  return <div className="min-w-0 content">
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
