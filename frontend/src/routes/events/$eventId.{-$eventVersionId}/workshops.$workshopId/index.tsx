import { createFileRoute, notFound } from '@tanstack/react-router'

import { Event } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useDeleteWorkshop } from 'services/workshops'

import { H2 } from 'libraries/ui'
import { DocumentList } from 'components/document/DocumentList'
import { FileList } from 'components/files/FileList'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { WorkshopEditor } from 'components/WorkshopEditor'
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
  const eventId = event._id
  const t = useT('routes.events.event.workshop')
  const [deleteWorkshop] = useDeleteWorkshop({ refetchQueries: ['getEvent'] })
  const { _id, abbreviation, name } = workshop
  const navigate = Route.useNavigate()

  return <>
    <DeleteButton
      minimal
      requireRight="workshops:delete"
      owner="events"
      owningId={eventId}
      onDelete={async () => {
        await addGlobalLoadingAnimation(deleteWorkshop({ id: _id }))
        navigate({
          to: '/events/$eventId/{-$eventVersionId}',
          params: { eventId },
        })
      }}
      className="float-right" text={t('delete')}
      confirmText={t('deleteConfirmation')}
    />
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
