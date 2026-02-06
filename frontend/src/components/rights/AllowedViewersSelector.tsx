import { useUsers } from 'services/users'

import { FieldComponentProps, RadioGroup } from 'libraries/forms'
import { Button } from 'libraries/ui'
import { Cross } from 'libraries/ui/icons'
import { useT } from 'i18n'

import { UserSelector } from './UserSelector'

export const AllowEveryone = 'everyone'
export const AllowLoggedIn = 'group:user'
export const allowUser = (userId: string) => `user:${userId}`

export default function AllowedViewersSelector({ value, ...props }: FieldComponentProps<string[]>) {
  const t = useT('domain.allowedViewers')
  const choice = valueToChoice(value)
  const [users] = useUsers()
  const chosenUsers = getUserIds(value)
    .map(userId => users.find(u => u._id === userId))
    .filter(user => user !== undefined)
  return <>
    <RadioGroup<Choice>
      {...props}
      value={choice}
      onChange={value => props.onChange(choiceToValue(value))}
      options={[
        { label: t('everyone'), value: AllowEveryone },
        { label: t('loggedIn'), value: AllowLoggedIn },
        { label: t('chosenUsers'), value: 'users' },
      ]}
    />
    {choice === 'users' &&
      <fieldset className="flex flex-row w-max gap-1 my-3">
        <legend className="float-left py-1 pe-1">{t('chosenUsers')}: </legend>
        {chosenUsers.map(user =>
          <div key={user._id} className="flex items-center ps-3 bg-gray-50 hover:bg-gray-100 rounded-2xl">
            <span>{user.name}</span>
            <Button
              minimal
              color="danger"
              title={t('removeUser', { name: user.name })}
              onClick={() => props.onChange(value?.filter(v => v !== allowUser(user._id)) ?? [])}
            >
              <Cross />
            </Button>
          </div>,
        )}
        <UserSelector
          placeholder={t('addUser')}
          id={`${props.id}-users`}
          excludeFromSearch={chosenUsers}
          value={null}
          noResultsText={t('noUsers')}
          onChange={user => user && props.onChange([
            ...value ?? [],
            allowUser(user._id),
          ])}
        />
      </fieldset>
    }
  </>
}

type Choice = typeof AllowEveryone | typeof AllowLoggedIn | 'users'

function valueToChoice(value: string[] | undefined | null): Choice {
  if (value?.includes(AllowEveryone)) return AllowEveryone
  if (value?.includes(AllowLoggedIn)) return AllowLoggedIn
  return 'users'
}

function choiceToValue(choice: Choice): string[] {
  if (choice === AllowEveryone) return [AllowEveryone]
  if (choice === AllowLoggedIn) return [AllowLoggedIn]
  return []
}

function getUserIds(value: string[] | undefined | null): string[] {
  return value?.filter(v => v.startsWith('user:')).map(v => v.split(':')[1]) ?? []
}
