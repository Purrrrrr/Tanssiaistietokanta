import { useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import { Person as User } from '@blueprintjs/icons'

import { getCurrentUser, logout, subscribeToAuthChanges } from 'backend/authentication'

import MenuButton from 'libraries/formsV2/components/MenuButton'
import { AnchorButton, Breadcrumbs, Button } from 'libraries/ui'
import { useT, useTranslation } from 'i18n'

import { NavigateButton } from './widgets/NavigateButton'

function Navigation() {
  return <nav className="flex relative z-10 flex-wrap justify-between items-center px-3.5 h-auto bg-white shadow-sm min-h-12.5 shadow-stone-600/30">
    <div className="grow">
      <Breadcrumbs label={useTranslation('navigation.breadcrumbs')} />
    </div>
    <div className="flex items-center">
      <NavButton requireRight="dances:read" icon={<span className="mr-0.5">💃</span>} href="/dances" text={useTranslation('navigation.dances')} />
      <div className="mx-1 self-stretch w-[1px] bg-stone-300" />
      <LoginStatus />
    </div>
  </nav>
}

function NavButton({ href, ...props }) {
  const navigate = useNavigate()
  return <AnchorButton minimal {...props} href={href}
    onClick={(e) => { e.preventDefault(); navigate(href) }}
  />
}

function LoginStatus() {
  const user = useSyncExternalStore(subscribeToAuthChanges, getCurrentUser)
  const t = useT('navigation')

  if (user) {
    return <span>
      <MenuButton text={user.name} buttonRenderer={props => <Button minimal icon={<User className="mt-[1px] mr-0.5 text-amber-600" />} {...props} />}>
        <Button minimal onClick={logout}>{t('logout')}</Button>
      </MenuButton>
    </span>
  }

  return <NavigateButton
    minimal
    href="/login"
    icon={<User className="mt-[1px] text-orange-500" />}
    text={t('login')}
  />
}

export default Navigation
