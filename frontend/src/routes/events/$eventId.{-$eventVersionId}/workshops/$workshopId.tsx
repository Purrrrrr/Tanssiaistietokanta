import { createFileRoute, notFound } from '@tanstack/react-router'

import { Event } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useDeleteWorkshop } from 'services/workshops'

import { H2 } from 'libraries/ui'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { WorkshopEditor } from 'components/WorkshopEditor'
import { useT } from 'i18n'

import { useCurrentEvent } from '../-context'

type Workshop = Event['workshops'][0]

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/workshops/$workshopId',
)({
  component: RouteComponent,
  staticData: {
    requireRights: ({ eventId }) => ({
      rights: 'workshops:modify',
      owner: 'events',
      owningId: eventId,
    }),
  },
})

function RouteComponent() {
  const event = useCurrentEvent()
  const readOnly = event._versionId != undefined
  const { workshopId } = Route.useParams()
  const workshop = event.workshops.find(w => w._id === workshopId)
  if (!workshop) {
    throw notFound()
  }

  return <WorkshopCard
    workshop={workshop}
    eventId={event._id}
    readOnly={readOnly}
    reservedAbbreviations={event.workshops.filter(w => w._id !== workshop._id).map(w => w.abbreviation).filter(a => a) as string[]}
    beginDate={event.beginDate}
    endDate={event.endDate}
  />
}

function WorkshopCard(
  {
    workshop, reservedAbbreviations, readOnly, beginDate, endDate, eventId,
  }: {
    workshop: Workshop
    eventId: string
    reservedAbbreviations: string[]
    readOnly: boolean
    beginDate: string
    endDate: string
  },
) {
  const t = useT('routes.events.event.workshop')
  const [deleteWorkshop] = useDeleteWorkshop({ refetchQueries: ['getEvent'] })
  const { _id, abbreviation, name } = workshop
  const navigate = Route.useNavigate()

  return <>
    <DeleteButton
      requireRight="workshops:delete"
      owner="events"
      owningId={eventId}
      onDelete={async () => {
        await addGlobalLoadingAnimation(deleteWorkshop({ id: _id }))
        navigate({ to: Route.parentRoute.to })
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
    { readOnly || <WorkshopEditor workshop={workshop} reservedAbbreviations={reservedAbbreviations} beginDate={beginDate} endDate={endDate} />}
  </>
}
