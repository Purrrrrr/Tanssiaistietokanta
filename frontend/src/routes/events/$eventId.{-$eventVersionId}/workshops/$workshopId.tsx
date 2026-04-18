import { createFileRoute, getRouteApi, notFound } from '@tanstack/react-router'

import { Event } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useDeleteWorkshop } from 'services/workshops'

import { Breadcrumb, H2 } from 'libraries/ui'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { WorkshopEditor } from 'components/WorkshopEditor'
import { useT } from 'i18n'

import { useCurrentEvent } from '../-context'
import { WorkshopDocumentList } from '../-components/WorkshopDocumentList'

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
    breadcrumb: BreadcrumbComponent,
  },
})

function BreadcrumbComponent() {
  const event = getRouteApi('/events/$eventId/{-$eventVersionId}').useLoaderData()?.event
  const params = Route.useParams()
  const workshop = event?.workshops.find(w => w._id === params.workshopId)

  return <Breadcrumb
    to="/events/$eventId/{-$eventVersionId}/workshops/$workshopId"
    params={params}
    text={workshop?.name ?? '-'}
  />
}

function RouteComponent() {
  const event = useCurrentEvent()
  const { workshopId } = Route.useParams()
  const workshop = event.workshops.find(w => w._id === workshopId)
  if (!workshop) {
    throw notFound()
  }

  return <WorkshopCard
    workshop={workshop}
    eventId={event._id}
    reservedAbbreviations={event.workshops.filter(w => w._id !== workshop._id).map(w => w.abbreviation).filter(a => a) as string[]}
    beginDate={event.beginDate}
    endDate={event.endDate}
  />
}

function WorkshopCard(
  {
    workshop, reservedAbbreviations, beginDate, endDate, eventId,
  }: {
    workshop: Workshop
    eventId: string
    reservedAbbreviations: string[]
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
      minimal
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
    <WorkshopEditor eventId={eventId} workshop={workshop} reservedAbbreviations={reservedAbbreviations} beginDate={beginDate} endDate={endDate} />
    <WorkshopDocumentList />
  </>
}
