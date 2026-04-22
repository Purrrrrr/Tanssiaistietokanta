import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Event } from 'types'

import { RequirePermissions } from 'libraries/access-control'
import { DocumentViewer } from 'libraries/lexical/DocumentViewer'
import { Card, H2, Link } from 'libraries/ui'
import { Edit } from 'libraries/ui/icons'
import { DocumentList } from 'components/document/DocumentList'
import { DanceSet, EventProgramRow } from 'components/event/EventProgramForm'
import { FileList } from 'components/files/FileList'
import { AddButton } from 'components/widgets/AddButton'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { PageSection } from 'components/widgets/PageSection'
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
    <DocumentList
      title={t('documents')}
      owner="events"
      owningId={event._id}
    />
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
  return <PageSection
    title={t('workshops')}
    toolbar={readOnly ||
      <AddButton
        className="justify-self-end"
        requireRight="workshops:create"
        owner="events"
        owningId={eventId}
        onClick={() => setShowCreate(true)}
        text={t('createWorkshop')}
      />
    }>
    {workshops.length === 0 && <p>{t('noWorkshops')}</p>}
    {workshops.length > 0 &&
      <div className="col-span-full gap-4 items-stretch my-4 sm:grid grid-cols-[repeat(auto-fill,minmax(32rem,1fr))]">
        {workshops.map(workshop =>
          <WorkshopCard key={workshop._id} workshop={workshop} />,
        )}
        {showCreate && <CreateWorkshopCard eventId={eventId} startDate={beginDate} onClose={() => setShowCreate(false)} />}
      </div>
    }
  </PageSection>
}

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const params = Route.useParams()
  const formatDateTime = useFormatDateTime()
  const { abbreviation, name, instanceSpecificDances, instances, description, volunteerAssignments } = workshop

  const teachers = volunteerAssignments
    .filter(a => a.role.type === 'TEACHER')
    .flatMap(a => a.volunteers)

  return <Card className="flex flex-col" marginClass="" noPadding>
    <div className="grid grid-rows-2 px-6 pt-4 mb-2 grid-cols-[1fr_auto]">
      <h2 className="text-xl font-bold">
        {name}
        {abbreviation &&
          <> ({abbreviation})</>
        }
      </h2>
      <NavigateButton className="-mt-2 -mr-4" paddingClass="p-3" minimal color="primary" icon={<Edit size={20} />} to="/events/$eventId/{-$eventVersionId}/workshops/$workshopId" params={{ ...params, workshopId: workshop._id }} />
      <div className="text-lg">{teachers.map(teacher => teacher.name).join(', ')}</div>
    </div>
    <DocumentViewer className="px-6 mb-4" document={description} placeholder={null} />
    <div className="flex flex-wrap items-stretch bg-gray-200 grow justify-stretch gap-[1px] pt-[1px]">
      {instanceSpecificDances
        ? instances.map(instance =>
          <>
            <div key={instance._id} className="p-6 bg-white grow">
              <h3 className="mb-3 text-base font-bold">{formatDateTime(new Date(instance.dateTime))}</h3>
              <DanceList dances={instance.dances ?? []} />
            </div>
          </>,
        )
        : <div className="p-6 bg-white grow">
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
