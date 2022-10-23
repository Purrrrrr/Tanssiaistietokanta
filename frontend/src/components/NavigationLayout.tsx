import React from 'react'

import {BreadcrumbContext} from 'libraries/ui'

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
      <footer>Tanssitietokanta v. 2022-10-23 <a href="https://raw.githubusercontent.com/Purrrrrr/Tanssiaistietokanta/main/frontend/LICENSE">&copy; Tanssitietokannan tekijät</a></footer>
    </div>
  </BreadcrumbContext>
}

function navigationHidden() {
  const param = getUrlParam('hideUI')
  const isPrintPage = window.location.pathname.includes('/print/')
  const paramDefault = isPrintPage ? 'true' : 'false'
  return (param ?? paramDefault) !== 'false'
}

function getUrlParam(param : string) {
  const query = window.location.search
  const params = new URLSearchParams(query.substring(1))
  return params.get(param)
}

function SkipToMainContent() {
  return <a id="skip-to-main-content" href="#main-content">Siirry pääsisältöön</a>
}

export default NavigationLayout
