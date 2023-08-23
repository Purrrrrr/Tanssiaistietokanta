import React from 'react'
import {Link} from 'react-router-dom'

import {AdminOnly} from 'services/users'

import {Breadcrumb, Icon} from 'libraries/ui'
import {EventProgramEditor} from 'components/EventProgramEditor'
import {PageTitle} from 'components/PageTitle'
import {useT} from 'i18n'

import {Event} from 'types'

export default function EventProgramEditorPage({event}: {event: Event}) {
  const t = useT('pages.events.eventProgramPage', '')
  return <AdminOnly fallback={t('loginRequired')}>
    <Breadcrumb text={t('breadcrumbs.eventProgram')} />
    <p style={{margin: '10px 0'}}>
      <Link to=".."><Icon icon="arrow-left"/>{t('backToEvent')}</Link>
    </p>
    <PageTitle>{t('pageTitle')}</PageTitle>
    <EventProgramEditor eventId={event._id} program={event.program} />
  </AdminOnly>
}
