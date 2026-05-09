import { createFileRoute, notFound } from '@tanstack/react-router'

import { Event } from 'types'

import { H2 } from 'libraries/ui'
import { DocumentList } from 'components/document/DocumentList'
import { FileList } from 'components/files/FileList'
import { DeleteWorkshopButton } from 'components/workshops/DeleteWorkshopButton'
import { WorkshopEditor } from 'components/workshops/WorkshopEditor'
import { useT } from 'i18n'

import { useCurrentEvent } from '../-context'

type Workshop = Event['workshops'][0]

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/workshops/$workshopId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const event = useCurrentEvent()
  const { workshopId } = Route.useParams()
  const workshop = event.workshops.find(w => w._id === workshopId)
  if (!workshop) {
    throw notFound()
  }

  return <WorkshopCard
    workshop={workshop}
    event={event}
    reservedAbbreviations={event.workshops.filter(w => w._id !== workshop._id).map(w => w.abbreviation).filter(a => a) as string[]}
  />
}

function WorkshopCard(
  {
    workshop, reservedAbbreviations, event,
  }: {
    workshop: Workshop
    event: Event
    reservedAbbreviations: string[]
  },
) {
  const params = Route.useParams()
  const t = useT('routes.events.event.workshop')
  const { _id, abbreviation, name } = workshop
  const navigate = Route.useNavigate()

  return <>
    <DeleteWorkshopButton
      workshop={workshop}
      eventId={params.eventId}
      onDelete={() => navigate({ to: '/events/$eventId/{-$eventVersionId}', params })} />
    <H2>
      {name}
      {abbreviation &&
            <> ({abbreviation})</>
      }
    </H2>
    <WorkshopEditor event={event} workshop={workshop} reservedAbbreviations={reservedAbbreviations} />
    <DocumentList
      title={t('documents')}
      owner="workshops"
      owningId={_id}
    />
    <FileList title={t('files')} owner="workshops" owningId={workshop._id} />
  </>
}
