import { Event, EventInput } from 'types'
import { EventGrantRole } from 'types/gql/graphql'

import { useCurrentUser, useUsers } from 'services/users'

import { useRight } from 'libraries/access-control'
import { formFor } from 'libraries/forms'
import { Fieldset } from 'libraries/formsV2/components/containers/Fieldset'
import { H2, ItemList } from 'libraries/ui'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'
import randomId from 'utils/randomId'

import { EventRoleSelector } from './EventRoleSelector'
import { UserSelector } from './UserSelector'
import { ViewAccessSelector } from './ViewAccessSelector'

type EventAccessControl = Pick<Event & EventInput, 'accessControl'>

const {
  Field, useValueAt, useAppendToList, useRemoveFromList,
} = formFor<EventAccessControl>()

export function EventGrantsEditor({ eventId }: { eventId?: string }) {
  const t = useT('components.grantEditor')
  const canEdit = useRight('events:manage-access', { entityId: eventId })

  const grants = useValueAt('accessControl.grants')
  const addGrant = useAppendToList('accessControl.grants')
  const organizerCount = grants.filter(g => g.role === EventGrantRole.Organizer).length

  const excludedUserIds = grants
    .filter(g => g.principal.startsWith('user:'))
    .map(g => ({ _id: g.principal.substring(5) }))

  return (
    <section>
      <H2 className="mb-4">{t('accessRights')}</H2>
      <Field path="accessControl.viewAccess" label={t('allowedViewers')} labelStyle="beside" component={ViewAccessSelector} readOnly={!canEdit} />
      <Fieldset label={t('grants')} className="w-max">
        <ItemList noMargin items={grants} columns="grid-cols-[max-content_max-content_max-content]" emptyText={t('noGrants')} wrap-breakpoint="none">
          <ItemList.Header>
            <span>{t('principal')}</span>
            <span>{t('role')}</span>
            <span />
          </ItemList.Header>
          {grants.map((grant, index) => <GrantEditor key={grant._id} index={index} organizerCount={organizerCount} disabled={!canEdit} />)}
        </ItemList>

        {canEdit &&
          <UserSelector
            id="add-user-grant"
            aria-label={t('addGrant')}
            value={null}
            onChange={user => user && addGrant({
              _id: randomId(),
              principal: `user:${user._id}`,
              role: EventGrantRole.Viewer,
            })}
            placeholder={t('addGrant')}
            excludeFromSearch={excludedUserIds}
            noResultsText={t('nothingToAdd')}
            className="mb-2"
          />
        }
      </Fieldset>
    </section>
  )
}

function GrantEditor({ index, organizerCount, disabled }: { index: number, organizerCount: number, disabled: boolean }) {
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
  const principal = formatPrincipal(grant.principal)

  const rowDisabled = disabled
    || (!currentUser?.groups.includes('admins') && grant.role === EventGrantRole.Organizer && (grant.principal === `user:${currentUser?._id}` || organizerCount <= 1))

  return <ItemList.Row>
    <span className="min-w-60">{principal}</span>
    <Field
      path={`${grantPath}.role`}
      component={EventRoleSelector}
      readOnly={rowDisabled}
      label={t('role')}
      labelStyle="hidden"
    />
    {!disabled &&
      <DeleteButton
        onDelete={removeGrant}
        confirmText={t('confirmRemove', { user: principal })}
        text={t('remove')}
        color="danger"
        minimal
        disabled={rowDisabled}
      />
    }
  </ItemList.Row>
}
