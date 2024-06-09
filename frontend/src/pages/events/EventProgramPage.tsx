import React from 'react'

import {EventProgramEditor} from 'components/EventProgramEditor'
import {PageTitle} from 'components/PageTitle'
import {BackLink} from 'components/widgets/BackLink'
import {useT} from 'i18n'

import {Event} from 'types'

export default function EventProgramEditorPage({event}: {event: Event}) {
  const t = useT('pages.events.eventProgramPage')
  return <>
    <BackLink to="../..">{t('backToEvent')}</BackLink>
    <PageTitle>{t('pageTitle')}</PageTitle>
    <EventProgramEditor eventId={event._id} program={event.program} />
  </>
}
