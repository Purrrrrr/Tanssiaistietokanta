import { ErrorComponent as DefaultErrorComponent, ErrorComponentProps } from '@tanstack/react-router'

import { Button } from 'libraries/ui'
import NavigationLayout from 'components/NavigationLayout'
import { Page } from 'components/Page'
import LoginForm from 'components/rights/LoginForm'
import { useT } from 'i18n'
import { AccessDeniedError } from 'utils/routeUtils'

export default function ErrorComponent(props: ErrorComponentProps) {
  const { error, reset } = props
  const t = useT('')
  if (error instanceof AccessDeniedError) {
    return <NavigationLayout>
      <Page title={t('components.loginForm.login')}>
        <LoginForm onSuccess={reset} />
      </Page>
    </NavigationLayout>
  }
  return <NavigationLayout>
    <DefaultErrorComponent {...props} />
    <Button onClick={reset}>Try again</Button>
  </NavigationLayout>
}
