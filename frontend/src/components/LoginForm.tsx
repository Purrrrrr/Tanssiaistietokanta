import { useContext } from 'react'

import { UserContext } from 'services/users'

import { Button } from 'libraries/ui'
import { useT } from 'i18n'

function LoginForm() {
  const t = useT('components.loginForm')
  const { user, login, logout } = useContext(UserContext)
  return <>
    {user
      ? <Button onClick={logout}>{t('logout')}</Button>
      : <Button onClick={login}>{t('login')}</Button>}
  </>
}

export default LoginForm
