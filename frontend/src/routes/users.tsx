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
    <ItemList columns="grid-cols-[1fr_1fr_1fr] gap-x-4" items={users} emptyText={t('noUsers')} className="max-w-200">
      <ItemList.Header>
        <span>{label('name')}</span>
        <span>{label('username')}</span>
      </ItemList.Header>
      {users.map(user =>
        <ItemList.Row key={user._id}>
          <span>{user.name}</span>
          <span>{user.username}</span>
          <span>{user.sessionId}</span>
        </ItemList.Row>,
      )}
    </ItemList>
  </Page>
}
