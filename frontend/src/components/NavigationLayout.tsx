import { Link } from 'react-router-dom'

import {BreadcrumbContext} from 'libraries/ui'
import {T, useTranslation} from 'i18n'

import DebugManager from './DebugManager'
import {GlobalLoadingState}  from './LoadingState'
import Navigation from './Navigation'
import { SidebarContainer, SidebarContext } from './SideBar'
import {SupportedBrowserChecker} from './SupportedBrowserWarning'

import './NavigationLayout.sass'

function NavigationLayout({children}) {
  if (navigationHidden()) {
    return <BreadcrumbContext>
      <GlobalLoadingState>
        <SupportedBrowserChecker />
        {children}
      </GlobalLoadingState>
    </BreadcrumbContext>
  }

  return <BreadcrumbContext>
    <GlobalLoadingState>
      <SidebarContext>
        <SupportedBrowserChecker />
        <SkipToMainContent />
        <div id="layout">
          <Navigation/>
          <main id="main-content">
            {children}
          </main>
          <aside>
            <SidebarContainer />
          </aside>
          <footer>
            {process.env.NODE_ENV === 'development' &&
              <Link className="px-1 mr-1 border-gray-400 border-e" to="/ui-showcase">UI Showcase</Link>}
            <T msg="app.title" /> v. {process.env.REACT_APP_BUILD_TIME ?? 'DEV'}-{process.env.REACT_APP_COMMIT_REV ?? 'HEAD'}
            {' '}
            <LicenceLink />
            {process.env.NODE_ENV === 'development' &&
              <DebugManager />}
          </footer>
        </div>
      </SidebarContext>
    </GlobalLoadingState>
  </BreadcrumbContext>
}

function navigationHidden() {
  const isPrintPage = window.location.pathname.match(/\/(ball-program|print)(\/|$)/)
  return isPrintPage
}

function SkipToMainContent() {
  return <a id="skip-to-main-content" href="#main-content"><T msg="navigation.moveToContent" /></a>
}

function LicenceLink() {
  return <a href={useTranslation('app.licenceLink')}>&copy; <T msg="app.copyright" /></a>
}

export default NavigationLayout
