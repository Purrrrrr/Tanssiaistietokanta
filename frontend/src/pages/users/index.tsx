import { useUsers } from 'services/users'

import { ItemList } from 'libraries/ui'
import { LoadingState } from 'components/LoadingState'
import { PageTitle } from 'components/PageTitle'
import { RequirePermissions } from 'components/rights/RequirePermissions'
import { useT } from 'i18n'

function UsersPage() {
  const t = useT('pages.users.userList')
  const [users, requestState] = useUsers()

  return <>
    <PageTitle>{t('pageTitle')}</PageTitle>
    <RequirePermissions requireRight="events:read">
      <LoadingState {...requestState} />
      <ItemList columns="grid-cols-[1fr_1fr_1fr] gap-x-4" items={users} emptyText={t('noUsers')} className="max-w-200">
        <ItemList.Header>
          <span>{t('name')}</span>
          <span>{t('username')}</span>
        </ItemList.Header>
        {users.map(user =>
          <ItemList.Row key={user._id}>
            <span>{user.name}</span>
            <span>{user.username}</span>
            <span>{user.sessionId}</span>
          </ItemList.Row>,
        )}
      </ItemList>
    </RequirePermissions>
  </>
}

export default UsersPage
