import React, { useCallback, useState } from 'react'

import { Event, EventProgram as EventProgramType } from 'types'

import { usePatchEvent } from 'services/events'
import { AdminOnly } from 'services/users'
import { useCreateWorkshop, useDeleteWorkshop } from 'services/workshops'

import { DateField, DateRangeField, formFor, patchStrategy, SyncStatus, useAutosavingState } from 'libraries/forms'
import { Button, Card, Collapse, H2 } from 'libraries/ui'
import { JSONPatch } from 'components/event/EventProgramForm/patchStrategy'
import { useGlobalLoadingAnimation } from 'components/LoadingState'
import { VersionedPageTitle } from 'components/versioning/VersionedPageTitle'
import { VersionSidebarToggle } from 'components/versioning/VersionSidebarToggle'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { newInstance, WorkshopEditor } from 'components/WorkshopEditor'
import { useFormatDate, useFormatDateTime, useT, useTranslation } from 'i18n'

type Workshop = Event['workshops'][0]

const {
  Input,
  Form,
} = formFor<Event>()

const eventVersionLink = (id: string, versionId?: null | string) => versionId
  ? `/events/${id}/version/${versionId}`
  : `/events/${id}`

export default function EventPage({ event }: { event: Event }) {
  const t = useT('pages.events.eventPage')
  const { _versionId, _versionNumber } = event
  const readOnly = _versionId != undefined
  return <>
    <VersionedPageTitle showVersion={readOnly} versionNumber={_versionNumber}>
      {event.name}
    </VersionedPageTitle>
    <VersionSidebarToggle entityType="event" entityId={event._id} versionId={event._versionId ?? undefined} toVersionLink={eventVersionLink} />
    <EventDetails event={event} readOnly={readOnly} />
    <H2>{t('ballProgram')}</H2>
    <EventProgram program={event.program} readOnly={readOnly} />
    <H2>{t('workshops')}</H2>
    <EventWorkshops event={event} readOnly={readOnly} />
  </>
}

function EventDetails({ event, readOnly }: { event: Event, readOnly: boolean }) {
  const [showEditor, setShowEditor] = useState(false)
  const t = useT('pages.events.eventPage')
  const formatDate = useFormatDate()
  return <>
    <p>
      {t('eventDate')}: {formatDate(event.beginDate)} - {formatDate(event.endDate)}
    </p>
    { readOnly ||
      <p>
        <Button
          onClick={() => setShowEditor(!showEditor)}
          text={showEditor ? t('closeEditor') : t('openBasicDetailsEditor')}
        />
      </p>
    }
    <Collapse isOpen={showEditor}>
      <EventDetailsForm event={event} />
    </Collapse>
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
      <div className="flex gap-6">
        <Input label={t('eventName')} path="name" required containerClassName="w-100" />
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
    </Card>
  </Form>
}

function EventProgram({ program, readOnly }: { program: EventProgramType, readOnly: boolean }) {
  const t = useT('pages.events.eventPage')
  if (!program || program.danceSets.length === 0) {
    return <>
      <p>{t('noProgram')}</p>
      {readOnly || <NavigateButton adminOnly color="primary" href="program" text={t('addProgram')} />}
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
      {readOnly
        ? <NavigateButton adminOnly href="program/main" text={t('viewProgram')} />
        : <NavigateButton adminOnly color="primary" href="program/main" text={t('editProgram')} />}
      <NavigateButton href="print/ball-dancelist" target="_blank"
        text={t('printBallDanceList')} />
      <NavigateButton href="ball-program" target="_blank"
        text={t('ballProgramSlideshow')} />
    </p>
  </>

  function formatDances(program) {
    const danceNames = program
      .filter(({ item }) => item.__typename !== 'EventProgram' || item.showInLists)
      .map(row => row.item.name)
      .filter(a => a)
    const requestedDanceCount = program.filter(isRequestedDance).length
    if (requestedDanceCount) {
      danceNames.push(t('requestedDance', { count: requestedDanceCount }))
    }

    return danceNames.join(', ')
  }
}

const isRequestedDance = row => row.item.__typename === 'RequestedDance'

function EventWorkshops({ event, readOnly }: { event: Event, readOnly: boolean }) {
  const { workshops, _id: eventId, beginDate, endDate } = event
  const t = useT('pages.events.eventPage')
  return <>
    <div className="my-4">
      {workshops.map(workshop =>
        <WorkshopCard
          workshop={workshop}
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
      <NavigateButton href="print/dance-cheatlist" target="_blank"
        text={t('danceCheatlist')} />
      <NavigateButton href="print/dance-instructions" target="_blank"
        text={t('danceInstructions')} />
    </p>
  </>
}

function CreateWorkshopButton({ eventId, startDate }) {
  const t = useT('pages.events.eventPage')
  const addLoadingAnimation = useGlobalLoadingAnimation()
  const [createWorkshop] = useCreateWorkshop()

  return <AdminOnly>
    <Button
      onClick={() => addLoadingAnimation(createWorkshop(newWorkshop({ eventId, name: t('newWorkshop') }, startDate)))}
      color="primary"
      text={t('createWorkshop')}
    />
  </AdminOnly>
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
    workshop, reservedAbbreviations, beginDate, endDate, readOnly,
  }: {
    workshop: Workshop
    reservedAbbreviations: string[]
    readOnly: boolean
    beginDate: string
    endDate: string
  },
) {
  const t = useT('pages.events.eventPage')
  const addLoadingAnimation = useGlobalLoadingAnimation()
  const [showEditor, setShowEditor] = useState(false)
  const [deleteWorkshop] = useDeleteWorkshop({ refetchQueries: ['getEvent'] })
  const { _id, abbreviation, name } = workshop

  return <Card marginClass="" style={{ clear: 'right' }}>
    { readOnly ||
      <>
        <DeleteButton onDelete={() => addLoadingAnimation(deleteWorkshop({ id: _id }))}
          className="float-right" text="Poista"
          confirmText={'Haluatko varmasti poistaa työpajan ' + name + '?'}
        />
        <Button
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
    <Collapse isOpen={showEditor}>
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
