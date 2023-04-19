import React from 'react'

import {BreadcrumbContext} from 'libraries/ui'

import DebugManager from './DebugManager'
import Navigation from './Navigation'

import './NavigationLayout.sass'

function NavigationLayout({children}) {
  if (navigationHidden()) {
    return <BreadcrumbContext children={children} />
  }

  return <BreadcrumbContext>
    <SkipToMainContent />
    <div id="layout">
      <Navigation/>
      <main id="main-content">
        {children}
      </main>
      <footer>
        Tanssitietokanta v. {process.env.REACT_APP_BUILD_TIME ?? 'DEV'}-{process.env.REACT_APP_COMMIT_REV ?? 'HEAD'}
        <a href="https://raw.githubusercontent.com/Purrrrrr/Tanssiaistietokanta/main/frontend/LICENSE">&copy; Tanssitietokannan tekijät</a>
        {process.env.NODE_ENV === 'development' &&  <DebugManager />}
      </footer>
    </div>
  </BreadcrumbContext>
}

function navigationHidden() {
  const isPrintPage = window.location.pathname.match(/\/(ball-program|print)(\/|$)/)
  return isPrintPage
}

function SkipToMainContent() {
  return <a id="skip-to-main-content" href="#main-content">Siirry pääsisältöön</a>
}

export default NavigationLayout
