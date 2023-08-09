import React, {useState} from 'react'

import {Alert} from 'libraries/dialog'
import {makeTranslate} from 'utils/translate'

const t = makeTranslate({
  unsupportedBrowser: 'Selaimesi ei ole tuettu',
  continueAnyWay: 'Jatka sivustolle',
  downloadBetterBrowser: 'Lataa uusin Firefox',
  siteMayNotWork: 'Selaimesi ei tue kaikkia tämän sivuston käyttämiä ominaisuuksia. Jos jatkat, sivusto ei välttämättä toimi tarkoituksenmukaisesti.',
  possibleSupportedBrowsers: 'Tanssitietokanta on kehitetty ja testattu enimmäkseen Firefoxilla, mutta se tukee ainakin seuraavien selaimien uusimpia versioita:'
})

const browsersLinks = {
  Firefox: 'https://www.mozilla.org/firefox/browsers/',
  Chrome: 'https://www.google.com/chrome/',
}

export function SupportedBrowserChecker() {
  const hasSupport = isSupported()

  return hasSupport ? null : <SupportedBrowserWarning />

}
export function SupportedBrowserWarning() {
  const [showDialog, setShowDialog] = useState(true)

  return <Alert title={t`unsupportedBrowser`} isOpen={showDialog} onClose={() => setShowDialog(false)}
    onConfirm={() => {
      setShowDialog(false)
      window.open('https://www.mozilla.org/firefox/browsers/', '__blank')
    }}
    intent="primary"
    cancelButtonText={t`continueAnyWay`}
    confirmButtonText={t`downloadBetterBrowser`}>
    <p>{t`siteMayNotWork`}</p>
    <p>
      {t`possibleSupportedBrowsers`}
    </p>
    <ul>
      {Object.entries(browsersLinks).map(([name, url]) => <li key={name}><a href={url}>{name}</a></li>)}
    </ul>
  </Alert>

}

function isSupported(): boolean {
  try {
    return CSS.supports('width: 1cqw')
      && typeof Symbol === 'function'
      && typeof Object.assign === 'function'
      && typeof Promise === 'function'
  } catch (e) {
    return false
  }
}
