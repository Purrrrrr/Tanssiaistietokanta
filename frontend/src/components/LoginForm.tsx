import React, {useContext} from 'react'

import {UserContext} from 'services/users'

import {Button} from 'libraries/ui'

function LoginForm() {
  const {user, login, logout} = useContext(UserContext)
  return <>
    {user
      ? <Button onClick={logout}>Logout</Button>
      : <Button onClick={login}>Login</Button>}
  </>
}

export default LoginForm

