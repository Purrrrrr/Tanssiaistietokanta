import { createFileRoute } from '@tanstack/react-router'

import { useUsers } from 'services/users'

import { ItemList } from 'libraries/ui'
import { LoadingState } from 'components/LoadingState'
import { Page } from 'components/Page'
import { useT } from 'i18n'

export const Route = createFileRoute('/users')({
  component: UsersPage,
  staticData: {
    // requireRights: 'users:list',
  },
})

function UsersPage() {
  const t = useT('routes.users.list')
  const label = useT('domain.user')
  const [users, requestState] = useUsers()

  return <Page title={t('pageTitle')} background="ball">
    <LoadingState {...requestState} />
    <ItemList
      items={users}
      emptyText={t('noUsers')}
      className="max-w-200"
      defaultSort="name"
      labelTranslator={label}
      columns={[
        { key: 'name' },
        { key: 'username' },
        {
          key: 'sessionId',
          label: '',
        },
      ]}
    />
  </Page>
}
