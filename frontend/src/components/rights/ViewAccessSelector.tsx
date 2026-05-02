import { ViewAccess } from 'types/gql/graphql'

import { FieldComponentProps } from 'libraries/forms'
import { RadioGroup } from 'libraries/forms/fieldComponents/basicComponents'
import { useT } from 'i18n'

export function ViewAccessSelector(props: FieldComponentProps<ViewAccess>) {
  const t = useT('domain.event.accessControl.viewAccess')
  return <RadioGroup options={[ViewAccess.Public, ViewAccess.Limited]} optionToString={t} {...props} />
}
