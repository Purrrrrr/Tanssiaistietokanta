import { createFileRoute } from '@tanstack/react-router'
import React, { useCallback, useState } from 'react'

import { Event } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useDeleteEvent, usePatchEvent } from 'services/events'
import { useCreateWorkshop, useDeleteWorkshop } from 'services/workshops'

import { DateField, DateRangeField, formFor, patchStrategy, SyncStatus, useAutosavingState } from 'libraries/forms'
import { Button, Card, Collapse, H2, Link } from 'libraries/ui'
import { DanceSet, EventProgramRow } from 'components/event/EventProgramForm'
import { JSONPatch } from 'components/event/EventProgramForm/patchStrategy'
import { FileList } from 'components/files/FileList'
import { EventGrantsEditor } from 'components/rights/EventGrantsEditor'
import { RequirePermissions } from 'components/rights/RequirePermissions'
import { VersionedPageTitle } from 'components/versioning/VersionedPageTitle'
import { VersionSidebarToggle } from 'components/versioning/VersionSidebarToggle'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { newInstance, WorkshopEditor } from 'components/WorkshopEditor'
import { useFormatDate, useFormatDateTime, useT, useTranslation } from 'i18n'

import { useCurrentEvent } from './-context'

type Workshop = Event['workshops'][0]

export const Route = createFileRoute('/events/$eventId/{-$eventVersionId}/')({
  component: RouteComponent,
})

const {
  Input,
  Form,
} = formFor<Event>()

const eventVersionLink = (id: string, versionId?: null | string) => versionId
  ? `/events/${id}/version/${versionId}`
  : `/events/${id}`

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('pages.events.eventPage')
  const { _versionId, _versionNumber } = event
  const readOnly = _versionId != undefined
  return <RequirePermissions requireRight="events:read" entityId={event._id}>
    <div className="flex justify-between items-center">
      <VersionedPageTitle showVersion={readOnly} versionNumber={_versionNumber}>
        {event.name}
      </VersionedPageTitle>
      <VersionSidebarToggle entityType="event" entityId={event._id} versionId={event._versionId ?? undefined} toVersionLink={eventVersionLink} />
    </div>
    <EventDetails event={event} readOnly={readOnly} />
    <H2>{t('ballProgram')}</H2>
    <EventProgram event={event} readOnly={readOnly} />
    <H2>{t('workshops')}</H2>
    <EventWorkshops event={event} readOnly={readOnly} />
    <FileList title={t('files')} owner="events" owningId={event._id} />
  </RequirePermissions>
}

function EventDetails({ event, readOnly }: { event: Event, readOnly: boolean }) {
  const [showEditor, setShowEditor] = useState(false)
  const t = useT('pages.events.eventPage')
  const formatDate = useFormatDate()
  const navigate = Route.useNavigate()
  const [deleteEvent] = useDeleteEvent({
    refetchQueries: ['getEvents'],
    onCompleted: () => navigate({ to: '/' }),
  })

  return <>
    <div className="flex clear-both justify-between mt-3">
      {t('eventDate')}: {formatDate(event.beginDate)} - {formatDate(event.endDate)}
      { readOnly ||
        <div>
          <RequirePermissions
            requireRight="events:modify"
            entityId={event._id}
            fallback={<Link to="/login" params={{ redirectTo: encodeURIComponent(window.location.pathname) }}>{t('loginToEdit')}</Link>}
          >
            <Button
              onClick={() => setShowEditor(!showEditor)}
              text={showEditor ? t('closeEditor') : t('openBasicDetailsEditor')}
            />
          </RequirePermissions>
          <DeleteButton
            requireRight="events:delete"
            entityId={event._id}
            onDelete={() => deleteEvent({ id: event._id })}
            text={t('deleteEvent')}
            confirmText={t('eventDeleteConfirmation', { eventName: event.name })}
          />
        </div>
      }
    </div>
    <RequirePermissions requireRight="events:modify" entityId={event._id}>
      <Collapse isOpen={showEditor} loadingMessage={t('loadingEditor')}>
        <EventDetailsForm event={event} />
      </Collapse>
    </RequirePermissions>
  </>
}

function EventDetailsForm({ event }: { event: Event }) {
  const t = useT('pages.events.eventPage')
  const [patchEvent] = usePatchEvent()
  const patch = useCallback(
    (eventPatch: JSONPatch) => patchEvent({ id: event._id, event: eventPatch }),
    [event._id, patchEvent],
  )
  const { state, formProps } = useAutosavingState<Event, JSONPatch>(event, patch, patchStrategy.jsonPatch)

  return <Form {...formProps}>
    <Card>
      <SyncStatus state={state} floatRight />
      <Input label={t('eventName')} path="name" required containerClassName="w-100" />
      <div className="flex gap-6">
        <DateRangeField<Event>
          id="eventDate"
          label={t('eventDate')}
          beginPath="beginDate"
          endPath="endDate"
          required
        />
        <DateField<Event>
          label={(t('ballDateTime'))}
          path="program.dateTime"
          showTime
          minDate={formProps.value.beginDate}
          maxDate={formProps.value.endDate}
        />
      </div>
      <EventGrantsEditor eventId={event._id} />
    </Card>
  </Form>
}

function EventProgram({ event, readOnly }: { event: Event, readOnly: boolean }) {
  const { program } = event

  const t = useT('pages.events.eventPage')
  if (!program || program.danceSets.length === 0) {
    return <>
      <p>{t('noProgram')}</p>
      {readOnly ||
        <NavigateButton
          requireRight="events:modify"
          entityId={event._id}
          color="primary"
          from={Route.id}
          to="./program/{-$tabId}/{-$slideId}"
          text={t('addProgram')}
        />}
    </>
  }

  return <>
    <Card>
      {program.danceSets.map((danceSet, index) =>
        <p key={index}>
          <strong>{danceSet.title}</strong>:{' '}
          {formatDances(danceSet.program)}
        </p>,
      )}
    </Card>
    <p>
      <NavigateButton
        requireRight="events:modify"
        entityId={event._id}
        from={Route.id}
        to="./program/{-$tabId}/{-$slideId}"
        color={readOnly ? undefined : 'primary'}
        text={readOnly ? t('viewProgram') : t('editProgram')}
      />
      <NavigateButton from={Route.id} to="./print/ball-dancelist" target="_blank"
        text={t('printBallDanceList')} />
      <NavigateButton from={Route.id} to="./ball-program/{-$slideId}" target="_blank"
        text={t('ballProgramSlideshow')} />
    </p>
  </>

  function formatDances(program: DanceSet['program']) {
    const danceNames = program
      .filter(row => row.type === 'Dance' || row.eventProgram?.showInLists)
      .map(row => row.dance ?? row.eventProgram)
      .filter(item => item != null)
      .map(item => item.name)
    const requestedDanceCount = program.filter(isRequestedDance).length
    if (requestedDanceCount) {
      danceNames.push(t('requestedDance', { count: requestedDanceCount }))
    }

    return danceNames.join(', ')
  }
}

const isRequestedDance = (row: EventProgramRow) => row.type === 'RequestedDance'

function EventWorkshops({ event, readOnly }: { event: Event, readOnly: boolean }) {
  const { workshops, _id: eventId, beginDate, endDate } = event
  const t = useT('pages.events.eventPage')
  return <>
    <div className="my-4">
      {workshops.map(workshop =>
        <WorkshopCard
          workshop={workshop}
          eventId={eventId}
          readOnly={readOnly}
          key={workshop._id}
          reservedAbbreviations={workshops.filter(w => w._id !== workshop._id).map(w => w.abbreviation).filter(a => a) as string[]}
          beginDate={beginDate}
          endDate={endDate}
        />,
      )}
    </div>
    <p>
      {readOnly || <CreateWorkshopButton eventId={eventId} startDate={beginDate} />}
      <NavigateButton
        from={Route.id}
        to="./print/dance-cheatlist"
        target="_blank"
        text={t('danceCheatlist')} />
      <NavigateButton
        from={Route.id}
        href="./print/dance-instructions"
        target="_blank"
        text={t('danceInstructions')} />
    </p>
  </>
}

function CreateWorkshopButton({ eventId, startDate }) {
  const t = useT('pages.events.eventPage')
  const [createWorkshop] = useCreateWorkshop()

  return <Button
    requireRight="workshops:create"
    owner="events"
    owningId={eventId}
    onClick={() => addGlobalLoadingAnimation(createWorkshop(newWorkshop({ eventId, name: t('newWorkshop') }, startDate)))}
    color="primary"
    text={t('createWorkshop')}
  />
}

function newWorkshop({ eventId, name }, startDate) {
  const { dances: _, ...instance } = newInstance(undefined, startDate)
  return {
    eventId: eventId,
    workshop: {
      name,
      instanceSpecificDances: false,
      instances: [
        { danceIds: [], description: '', ...instance },
      ],
    },
  }
}

function WorkshopCard(
  {
    workshop, reservedAbbreviations, beginDate, endDate, readOnly, eventId,
  }: {
    workshop: Workshop
    eventId: string
    reservedAbbreviations: string[]
    readOnly: boolean
    beginDate: string
    endDate: string
  },
) {
  const t = useT('pages.events.eventPage')
  const [showEditor, setShowEditor] = useState(false)
  const [deleteWorkshop] = useDeleteWorkshop({ refetchQueries: ['getEvent'] })
  const { _id, abbreviation, name } = workshop

  return <Card marginClass="" style={{ clear: 'right' }}>
    { readOnly ||
      <>
        <DeleteButton
          requireRight="workshops:delete"
          owner="events"
          owningId={eventId}
          onDelete={() => addGlobalLoadingAnimation(deleteWorkshop({ id: _id }))}
          className="float-right" text="Poista"
          confirmText={'Haluatko varmasti poistaa työpajan ' + name + '?'}
        />
        <Button
          requireRight="workshops:modify"
          owner="events"
          owningId={eventId}
          onClick={() => setShowEditor(!showEditor)}
          className="float-right" text={showEditor ? t('closeEditor') : t('openEditor')}
        />
      </>
    }
    <H2>
      {name}
      {abbreviation &&
            <> ({abbreviation})</>
      }
    </H2>
    {showEditor || <WorkshopSummary workshop={workshop} />}
    <Collapse isOpen={showEditor} loadingMessage={t('loadingEditor')}>
      <WorkshopEditor workshop={workshop} reservedAbbreviations={reservedAbbreviations} beginDate={beginDate} endDate={endDate} />
    </Collapse>
  </Card>
}

function WorkshopSummary({ workshop }: { workshop: Workshop }) {
  const t = useT('pages.events.eventPage')
  const formatDateTime = useFormatDateTime()
  const { instanceSpecificDances, instances, description, teachers } = workshop

  return <>
    <p>{description}</p>
    <p>{useTranslation('components.workshopEditor.teachers')}: {teachers}</p>
    {instanceSpecificDances
      ? instances.map(instance =>
        <React.Fragment key={instance._id}>
          <h3 className="my-1 text-base font-bold">{formatDateTime(new Date(instance.dateTime))}</h3>
          <p>
            {t('dances')} : {instance?.dances?.map(d => d.name)?.join(', ')}
          </p>
        </React.Fragment>,
      )
      : <>
        <h3 className="my-1 text-base font-bold">{instances.map(instance => formatDateTime(new Date(instance.dateTime))).join(', ')}</h3>
        <p>{t('dances') + ': '}{instances[0]?.dances?.map(d => d.name)?.join(', ')}</p>
      </>
    }
  </>
}
