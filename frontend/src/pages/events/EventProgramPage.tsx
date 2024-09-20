import {EventProgramEditor} from 'components/EventProgramEditor'
import {PageTitle} from 'components/PageTitle'
import {useT} from 'i18n'

import {Event} from 'types'

export default function EventProgramEditorPage({event}: {event: Event}) {
  const t = useT('pages.events.eventProgramPage')
  return <>
    <PageTitle noRender>{t('pageTitle')}</PageTitle>
    <EventProgramEditor eventId={event._id} eventVersionId={event._versionId ?? undefined} program={event.program} />
  </>
}
