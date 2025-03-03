import React from 'react'

import {Dance} from 'types'

import {FieldComponentProps} from 'libraries/forms'
import {DanceProgram, EventProgramItem, RequestedDance} from 'components/event/EventProgramForm'
import {DanceChooser} from 'components/widgets/DanceChooser'
import {useT} from 'i18n'

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
