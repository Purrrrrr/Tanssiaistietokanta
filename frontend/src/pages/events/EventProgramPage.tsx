import {EventProgramEditor} from 'components/event/EventProgramEditor'
import {PageTitle} from 'components/PageTitle'
import {useT} from 'i18n'

import {Event} from 'types'

export default function EventProgramEditorPage({event}: {event: Event}) {
  const t = useT('pages.events.eventProgramPage')
  return <>
    <PageTitle noRender>{t('pageTitle')}</PageTitle>
    <EventProgramEditor event={event} />
  </>
}
