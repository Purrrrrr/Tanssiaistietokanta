import { ViewAccess } from 'types/gql/graphql'

import { FieldComponentProps } from 'libraries/forms'
import { RadioGroup } from 'libraries/forms/fieldComponents/basicComponents'
import { useT } from 'i18n'

export function ViewAccessSelector(props: FieldComponentProps<ViewAccess>) {
  const t = useT('domain.event.accessControl.viewAccess')

  const options = [
    { value: ViewAccess.Public, label: t('public') },
    { value: ViewAccess.Limited, label: t('limited') },
  ]

  return <RadioGroup options={options} {...props} />
}
