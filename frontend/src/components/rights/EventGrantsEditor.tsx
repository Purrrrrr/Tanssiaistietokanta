import { Event, EventInput } from 'types'

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
  const [users] = useUsers()
  const currentUser = useCurrentUser()
  const isAdmin = currentUser?.groups.includes('admins') ?? false
  const canEdit = useRight('events:manage-access', { entityId: eventId })

  const grants = useValueAt('accessControl.grants')
  const addGrant = useAppendToList('accessControl.grants')
  const organizerCount = grants.filter(g => g.role === 'organizer').length

  const excludedUserIds = grants
    .filter(g => g.principal.startsWith('user:'))
    .map(g => ({ _id: g.principal.substring(5) }))

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
  const grantRows = grants.map(grant => ({
    ...grant,
    principalText: formatPrincipal(grant.principal),
    readOnly: !canEdit
      || (!isAdmin && grant.role === 'organizer' && (grant.principal === `user:${currentUser?._id}` || organizerCount <= 1)),
  }))

  return (
    <section>
      <H2 className="mb-4">{t('accessRights')}</H2>
      <Field path="accessControl.viewAccess" label={t('allowedViewers')} labelStyle="beside" component={ViewAccessSelector} readOnly={!canEdit} />
      <Fieldset label={t('grants')} className="w-max">
        <ItemList
          marginClass=""
          items={grantRows}
          emptyText={t('noGrants')}
          reflowAt={false}
          labelTranslator={t}
          columns={[
            {
              key: 'principalText',
              label: t('principal'),
              width: 'minmax(240px, max-content)',
            },
            {
              key: 'role',
              width: 'max-content',
              content: (grant, { index }) => <Field
                path={`accessControl.grants.${index}.role`}
                component={EventRoleSelector}
                readOnly={grant.readOnly}
                label={t('role')}
                labelStyle="hidden"
              />,
              sortBy: null,
            },
          ]}
          actions={canEdit && ((grant, index) => <RemoveGrantButton
            index={index}
            disabled={grant.readOnly}
            principal={grant.principalText}
          />)}
        />
        {canEdit &&
          <UserSelector
            id="add-user-grant"
            aria-label={t('addGrant')}
            value={null}
            onChange={user => user && addGrant({
              _id: randomId(),
              principal: `user:${user._id}`,
              role: 'viewer',
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

function RemoveGrantButton({ index, disabled, principal }: { index: number, disabled: boolean, principal: string }) {
  const t = useT('components.grantEditor')
  const removeGrant = useRemoveFromList('accessControl.grants', index)

  return <DeleteButton
    onDelete={removeGrant}
    confirmText={t('confirmRemove', { user: principal })}
    text={t('remove')}
    color="danger"
    minimal
    disabled={disabled}
  />
}
