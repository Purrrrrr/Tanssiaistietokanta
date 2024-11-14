import React from 'react'

import {FieldComponentProps, formFor, TypedStringPath} from 'libraries/forms'
import {DanceChooser} from 'components/widgets/DanceChooser'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {useT} from 'i18n'

import {Dance} from 'types'

import {DanceProgram, EventProgramItem, EventProgramSettings, RequestedDance} from '../types'

const {
  Field,
  useValueAt,
} = formFor<EventProgramSettings>()

export const DanceProgramChooser = React.memo(function DanceProgramChooser({value, onChange, ...props} : FieldComponentProps<EventProgramItem, HTMLElement>) {
  const t = useT('components.eventProgramEditor')
  return <DanceChooser
    key={value?._id}
    value={value?._id ? value as Dance : null}
    onChange={(dance, e) => onChange(
      dance
        ? {...dance, __typename: 'Dance'} as DanceProgram
        : {__typename: 'RequestedDance'} as RequestedDance,
      e
    )}
    allowEmpty
    emptyText={t('programTypes.RequestedDance')}
    {...props}
  />
})

export function InheritedSlideStyleSelector(
  {path, text, showLabel}:
  {
    path: TypedStringPath<string, EventProgramSettings>
    text: string
    showLabel?: boolean
  }
) {
  const t = useT('components.eventProgramEditor')
  const defaultSlideStyleId = useValueAt('slideStyleId')

  return <Field
    label={text}
    labelStyle={showLabel ? undefined : 'hidden'}
    inline={showLabel ? undefined : true}
    path={path}
    component={SlideStyleSelector}
    componentProps={{text, inheritsStyles: true, inheritedStyleId: defaultSlideStyleId, inheritedStyleName: t('fields.eventDefaultStyle')}}
  />
}
