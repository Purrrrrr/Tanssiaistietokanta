import { useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'

import { getCurrentUser, login, logout, subscribeToAuthChanges } from 'backend/authentication'
import { AdminOnly } from 'services/users'

import { AnchorButton, Breadcrumbs, Button } from 'libraries/ui'
import { useTranslation } from 'i18n'

function Navigation() {
  return <nav className="flex relative z-10 flex-wrap justify-between items-center px-3.5 h-auto bg-white shadow-sm min-h-12.5 shadow-stone-600/30">
    <div className="grow">
      <Breadcrumbs label={useTranslation('navigation.breadcrumbs')} />
    </div>
    <div>
      <AdminOnly>
        <NavButton icon={<span className="mr-1.5">💃</span>} href="/dances" text={useTranslation('navigation.dances')} />
      </AdminOnly>
      <FakeLogin />
    </div>
  </nav>
}

function NavButton({ href, ...props }) {
  const navigate = useNavigate()
  return <AnchorButton minimal {...props} href={href}
    onClick={(e) => { e.preventDefault(); navigate(href) }}
  />
}

function FakeLogin() {
  const user = useSyncExternalStore(subscribeToAuthChanges, getCurrentUser)

  if (user) {
    return <span>
      {user.email}
      <Button onClick={logout}>Logout</Button>
    </span>
  }

  return <Button onClick={() => { login('test@example.com', 'supersecret') }}>Login</Button>
}

export default Navigation
