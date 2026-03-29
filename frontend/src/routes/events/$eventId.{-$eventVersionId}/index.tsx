import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'

import { Event } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateWorkshop, useDeleteWorkshop } from 'services/workshops'

import { Button, Card, Collapse, H2 } from 'libraries/ui'
import { DanceSet, EventProgramRow } from 'components/event/EventProgramForm'
import { FileList } from 'components/files/FileList'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { newInstance, WorkshopEditor } from 'components/WorkshopEditor'
import { useFormatDateTime, useT, useTranslation } from 'i18n'

import { useCurrentEvent } from './-context'

type Workshop = Event['workshops'][0]

export const Route = createFileRoute('/events/$eventId/{-$eventVersionId}/')({
  component: RouteComponent,
})

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('pages.events.eventPage')
  const readOnly = event._versionId != undefined
  return <>
    <H2>{t('ballProgram')}</H2>
    <EventProgram event={event} />
    <H2>{t('workshops')}</H2>
    <EventWorkshops event={event} readOnly={readOnly} />
    <FileList title={t('files')} owner="events" owningId={event._id} />
  </>
}

function EventProgram({ event }: { event: Event }) {
  const { program } = event

  const t = useT('pages.events.eventPage')
  if (!program || program.danceSets.length === 0) {
    return <p>{t('noProgram')}</p>
  }

  return <Card>
    {program.danceSets.map((danceSet, index) =>
      <p key={index}>
        <strong>{danceSet.title}</strong>:{' '}
        {formatDances(danceSet.program)}
      </p>,
    )}
  </Card>

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
    <p>{useTranslation('components.workshopEditor.teachers')}: {teachers.map(teacher => teacher.name).join(', ')}</p>
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
