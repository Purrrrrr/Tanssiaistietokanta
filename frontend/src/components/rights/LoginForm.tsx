import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { login } from 'services/users'

import { formFor } from 'libraries/forms'
import { ErrorMessage } from 'libraries/forms/validation'
import { Button, H2 } from 'libraries/ui'
import { useT } from 'i18n'

export interface LoginFields {
  username: string
  password: string
}

const { Form, Input } = formFor<LoginFields>()

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [value, setValue] = useState<LoginFields>({ username: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const t = useT('components.loginForm')

  const onSubmit = async ({ username, password }: LoginFields) => {
    const user = await login(username, password)
    if (!user) {
      setError('Invalid username or password')
    } else if (redirectTo) {
      navigate(redirectTo)
    }
  }

  return <Form value={value} onChange={setValue} onSubmit={onSubmit} errorDisplay="onSubmit">
    <H2>{t('login')}</H2>
    {error && <ErrorMessage error={{ errors: [error] }} />}
    <div className="flex gap-3">
      <Input path="username" label={t('username')} required />
      <Input path="password" label={t('password')} required componentProps={{ type: 'password' }} />
    </div>
    <Button color="primary" type="submit">{t('login')}</Button>
  </Form>
}
