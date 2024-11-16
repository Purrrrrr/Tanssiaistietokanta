import {TypedStringPath} from 'libraries/forms'
import { EventProgramSettings, Field, useValueAt } from 'components/event/EventProgramForm'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {useT} from 'i18n'

export function InheritedSlideStyleSelector(
  {path, text}:
  {
    path: TypedStringPath<string, EventProgramSettings>
    text: string
  }
) {
  const t = useT('components.eventProgramEditor')
  const defaultSlideStyleId = useValueAt('slideStyleId')

  return <Field
    label={text}
    labelStyle="beside"
    inline
    path={path}
    component={SlideStyleSelector}
    componentProps={{text, inheritsStyles: true, inheritedStyleId: defaultSlideStyleId, inheritedStyleName: t('fields.eventDefaultStyle')}}
  />
}
