import { FieldComponentProps } from 'libraries/forms'
import { RadioGroup } from 'libraries/forms/fieldComponents/basicComponents'
import { ViewAccess } from 'types/gql/graphql'
import { useT } from 'i18n'

export function ViewAccessSelector(props: FieldComponentProps<ViewAccess>) {
  const t = useT('components.viewAccessSelector')
  
  const options = [
    { value: ViewAccess.Public, label: t('public') },
    { value: ViewAccess.Limited, label: t('limited') },
  ]
  
  return <RadioGroup options={options} {...props} />
}
