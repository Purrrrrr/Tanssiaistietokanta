import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Event } from 'types'

import { RequirePermissions } from 'libraries/access-control'
import { Button, Card, H2, Link } from 'libraries/ui'
import { Edit } from 'libraries/ui/icons'
import { DanceSet, EventProgramRow } from 'components/event/EventProgramForm'
import { FileList } from 'components/files/FileList'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { useFormatDateTime, useT } from 'i18n'

import { CreateWorkshopCard } from './-components/CreateWorkshopCard'
import { useCurrentEvent } from './-context'

type Workshop = Event['workshops'][0]

export const Route = createFileRoute('/events/$eventId/{-$eventVersionId}/')({
  component: RouteComponent,
})

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('routes.events.event.index')
  const readOnly = event._versionId != undefined
  return <>
    <H2>{t('ballProgram')}</H2>
    <EventProgram event={event} />
    <EventWorkshops event={event} readOnly={readOnly} />
    <FileList title={t('files')} owner="events" owningId={event._id} />
  </>
}

function EventProgram({ event }: { event: Event }) {
  const { program } = event
  const formatDateTime = useFormatDateTime()

  const t = useT('routes.events.event.index')
  if (!program || program.danceSets.length === 0) {
    return <p>{t('noProgram')}</p>
  }

  return <section className="@container">
    <p>
      {t('ballDateTime', { dateTime: formatDateTime(event.program.dateTime) })}
      <RequirePermissions requireRight="events:modify" entityId={event._id}>
        {' '}
        {t('youCanEditProgramOnPages')}
        {' '}
        <Link
          to="/events/$eventId/{-$eventVersionId}/program/main"
          params={{ eventId: event._id, eventVersionId: event._versionId ?? undefined }}
        >
          {t('editProgram')}
        </Link>
        {' '}
        {t('and')}
        {' '}
        <Link
          to="/events/$eventId/{-$eventVersionId}/program/slides/{-$slideId}"
          params={{ eventId: event._id, eventVersionId: event._versionId ?? undefined }}
        >
          {t('editSlideShow')}
        </Link>
        .
      </RequirePermissions>
    </p>
    <div className="@3xl:grid grid-cols-[repeat(auto-fit,minmax(auto,16rem))] gap-2 mb-4 @3xl:text-center">
      {program.danceSets.map((danceSet, index) =>
        <Card key={index} className="@3xl:px-2 py-2 @max-3xl:border-0 @max-3xl:shadow-none" noPadding marginClass="">
          <strong className="text-lg">{danceSet.title}</strong>:{' '}
          <ul className="mt-1 @max-3xl:comma-separated-list @max-3xl:inline">
            {formatDances(danceSet.program)}
          </ul>
        </Card>,
      )}
    </div>
  </section>

  function formatDances(program: DanceSet['program']) {
    const danceNames = program
      .filter(row => row.type === 'Dance' || row.eventProgram?.showInLists)
      .map(row => row.dance ?? row.eventProgram)
      .filter(item => item != null && '_id' in item)
      .map(item => ({ name: item.name, id: item._id }))
    const requestedDanceCount = program.filter(isRequestedDance).length
    if (requestedDanceCount) {
      danceNames.push({ name: t('requestedDance', { count: requestedDanceCount }), id: 'requestedDances' })
    }

    return danceNames.map(({ name, id }) => <li key={id} className="py-0.5">{name}</li>)
  }
}

const isRequestedDance = (row: EventProgramRow) => row.type === 'RequestedDance'

function EventWorkshops({ event, readOnly }: { event: Event, readOnly: boolean }) {
  const [showCreate, setShowCreate] = useState(false)
  const t = useT('routes.events.event.index')
  const { workshops, _id: eventId, beginDate } = event
  return <div className="w-auto grid grid-cols-2 items-center">
    <H2 className="">{t('workshops')}</H2>
    {readOnly ||
      <Button
        className="justify-self-end"
        requireRight="workshops:create"
        owner="events"
        owningId={eventId}
        onClick={() => setShowCreate(true)}
        color="primary"
        text={t('createWorkshop')}
      />
    }
    <div className="col-span-full my-4 sm:grid grid-cols-[repeat(auto-fill,minmax(32rem,1fr))] gap-4 items-stretch">
      {workshops.map(workshop =>
        <WorkshopCard key={workshop._id} workshop={workshop} />,
      )}
      {showCreate && <CreateWorkshopCard eventId={eventId} startDate={beginDate} onClose={() => setShowCreate(false)} />}
    </div>
  </div>
}

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const params = Route.useParams()
  const formatDateTime = useFormatDateTime()
  const { abbreviation, name, instanceSpecificDances, instances, description, volunteerAssignments } = workshop

  const teachers = volunteerAssignments
    .filter(a => a.role.type === 'TEACHER')
    .flatMap(a => a.volunteers)

  return <Card className="flex flex-col" marginClass="" noPadding>
    <div className="grid grid-cols-[1fr_auto] grid-rows-2 px-6 pt-4 pb-2">
      <h2 className="font-bold text-xl">
        {name}
        {abbreviation &&
          <> ({abbreviation})</>
        }
      </h2>
      <NavigateButton className="-mt-2 -mr-4" paddingClass="p-3" minimal color="primary" icon={<Edit size={20} />} to="/events/$eventId/{-$eventVersionId}/workshops/$workshopId" params={{ ...params, workshopId: workshop._id }} />
      <div className="text-lg">{teachers.map(teacher => teacher.name).join(', ')}</div>
    </div>
    <p className="px-6 not-empty:py-2">{description}</p>
    <div className="grow flex flex-wrap items-stretch justify-stretch gap-[1px] bg-gray-200 pt-[1px]">
      {instanceSpecificDances
        ? instances.map(instance =>
          <>
            <div key={instance._id} className="p-6 grow bg-white">
              <h3 className="mb-3 text-base font-bold">{formatDateTime(new Date(instance.dateTime))}</h3>
              <DanceList dances={instance.dances ?? []} />
            </div>
          </>,
        )
        : <div className="p-6 grow bg-white">
          <h3 className="mb-3 text-base font-bold">{instances.map(instance => formatDateTime(new Date(instance.dateTime))).join(', ')}</h3>
          <DanceList dances={instances[0].dances ?? []} />
        </div>
      }
    </div>
  </Card>
}

function DanceList({ dances }: { dances: { _id: string, name: string }[] }) {
  return <ul>
    {dances.map(d => <li key={d._id}>{d.name}</li>)}
  </ul>
}
