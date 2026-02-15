import { Event, EventInput } from 'types'
import { GrantRole } from 'types/gql/graphql'

import { useCurrentUser, useUsers } from 'services/users'

import { formFor } from 'libraries/forms'
import { Fieldset } from 'libraries/formsV2/components/containers/Fieldset'
import { Button, ItemList } from 'libraries/ui'
import { useT } from 'i18n'
import { guid } from 'utils/guid'

import { EventRoleSelector } from './EventRoleSelector'
import { UserSelector } from './UserSelector'
import { ViewAccessSelector } from './ViewAccessSelector'

type EventAccessControl = Pick<Event & EventInput, 'accessControl'>

const {
  Field, useValueAt, useAppendToList, useRemoveFromList,
} = formFor<EventAccessControl>()

export function EventGrantsEditor() {
  const t = useT('components.grantEditor')

  const grants = useValueAt('accessControl.grants')
  const addGrant = useAppendToList('accessControl.grants')
  const organizerCount = grants.filter(g => g.role === GrantRole.Organizer).length

  const excludedUserIds = grants
    .filter(g => g.principal.startsWith('user:'))
    .map(g => ({ _id: g.principal.substring(5) }))

  // const hasLoggedInGrant = grants.some(g => g.principal === 'group:user')

  return (
    <Fieldset label={t('grants')} className="w-max">
      <ItemList noMargin items={grants} columns="grid-cols-[max-content_max-content_max-content]" emptyText={t('noGrants')} wrap-breakpoint="none">
        <ItemList.Header>
          <span>{t('principal')}</span>
          <span>{t('role')}</span>
          <span />
        </ItemList.Header>
        {grants.map((grant, index) => <GrantEditor key={grant._id} index={index} organizerCount={organizerCount} />)}
      </ItemList>

      <UserSelector
        id="add-user-grant"
        aria-label={t('addGrant')}
        value={null}
        onChange={user => user && addGrant({
          _id: guid(),
          principal: `user:${user._id}`,
          role: GrantRole.Viewer,
        })}
        placeholder={t('addGrant')}
        excludeFromSearch={excludedUserIds}
        noResultsText={t('nothingToAdd')}
      />
      <Field path="accessControl.viewAccess" label={t('allowedViewers')} component={ViewAccessSelector} />
    </Fieldset>
  )
}

function GrantEditor({ index, organizerCount }: { index: number, organizerCount: number }) {
  const grantPath = `accessControl.grants.${index}` as const
  const grant = useValueAt(grantPath)
  const t = useT('components.grantEditor')
  const removeGrant = useRemoveFromList('accessControl.grants', index)
  const currentUser = useCurrentUser()
  const [users] = useUsers()

  const formatPrincipal = (principal: string) => {
    if (principal === 'group:user') {
      return t('loggedInUsers')
    }
    if (principal.startsWith('user:')) {
      const userId = principal.substring(5)
      return users.find(u => u._id === userId)?.name ?? userId
    }
    return principal
  }

  const disabled = !currentUser?.groups.includes('admins') && grant.role === GrantRole.Organizer
    && (grant.principal === `user:${currentUser?._id}` || organizerCount <= 1)

  return <ItemList.Row>
    <span>{formatPrincipal(grant.principal)}</span>
    {disabled
      ? <span>{t(`roles.${grant.role}`)}</span>
      :
      <Field
        path={`${grantPath}.role`}
        component={EventRoleSelector}
        label={t('role')}
        labelStyle="hidden"
      />
    }
    <Button
      onClick={removeGrant}
      text={t('remove')}
      color="danger"
      // disabled={!canRemoveGrant(grant)}
      disabled={disabled}
    />
  </ItemList.Row>
}
