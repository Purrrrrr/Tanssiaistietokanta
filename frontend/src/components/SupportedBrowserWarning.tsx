import {useState} from 'react'

import {Alert} from 'libraries/overlays'
import {useT} from 'i18n'

const browsersLinks = {
  Firefox: 'https://www.mozilla.org/firefox/browsers/',
  Chrome: 'https://www.google.com/chrome/',
}

export function SupportedBrowserChecker() {
  const hasSupport = isSupported()

  return hasSupport ? null : <SupportedBrowserWarning />

}
export function SupportedBrowserWarning() {
  const t = useT('components.supportedBrowserWarning')
  const [showDialog, setShowDialog] = useState(true)

  return <Alert title={t('unsupportedBrowser')} isOpen={showDialog} onClose={() => setShowDialog(false)}
    onConfirm={() => {
      setShowDialog(false)
      window.open('https://www.mozilla.org/firefox/browsers/', '__blank')
    }}
    color="primary"
    cancelButtonText={t('continueAnyWay')}
    confirmButtonText={t('downloadBetterBrowser')}>
    <p>{t('siteMayNotWork')}</p>
    <p>
      {t('possibleSupportedBrowsers')}
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
  } catch (_ignored) {
    return false
  }
}
