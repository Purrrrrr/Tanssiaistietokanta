import classNames from 'classnames'

import { ColorClass, Link, RegularLink } from 'libraries/ui'
import { T, useTranslation } from 'i18n'

import DebugManager from './DebugManager'
import Navigation from './Navigation'
import { SidebarContainer, SidebarContext } from './SideBar'
import { SupportedBrowserChecker } from './SupportedBrowserWarning'

import './SkipToMainContent.css'

if (process.env.NODE_ENV === 'development') {
  import('./dev.css')
}

function NavigationLayout({ children }) {
  if (navigationHidden()) {
    return <>
      <SupportedBrowserChecker />
      {children}
    </>
  }

  return <SidebarContext>
    <SupportedBrowserChecker />
    <SkipToMainContent />
    <div id="layout">
      <Navigation />
      <div id="main-content">
        <main>{children}</main>
        <aside>
          <SidebarContainer />
        </aside>
      </div>
      <Footer />
    </div>
  </SidebarContext>
}

function navigationHidden() {
  const isPrintPage = window.location.pathname.match(/\/(ball-program|print)(\/|$)/)
  return isPrintPage
}

function SkipToMainContent() {
  // TODO style with tailwind
  return <RegularLink unstyled id="skip-to-main-content" href="#main-content"><T msg="navigation.moveToContent" /></RegularLink>
}

function Footer() {
  return <footer className={classNames(ColorClass.textMuted, 'text-right p-1')}>
    {process.env.NODE_ENV === 'development' &&
      <Link className="px-1 mr-1 border-gray-400 border-e" to="/ui-showcase">UI Showcase</Link>}
    <T msg="app.title" /> v. {process.env.REACT_APP_BUILD_TIME ?? 'DEV'}-{process.env.REACT_APP_COMMIT_REV ?? 'HEAD'}
    {' '}
    <LicenceLink />
    {process.env.NODE_ENV === 'development' &&
      <DebugManager />}
  </footer>
}

function LicenceLink() {
  return <RegularLink href={useTranslation('app.licenceLink')}>&copy; <T msg="app.copyright" /></RegularLink>
}

export default NavigationLayout
