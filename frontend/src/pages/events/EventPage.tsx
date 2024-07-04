import React, {useCallback, useState} from 'react'

import {usePatchEvent} from 'services/events'
import {AdminOnly} from 'services/users'
import {useCreateWorkshop, useDeleteWorkshop} from 'services/workshops'

import {DateRangeField, formFor, patchStrategy, SyncStatus, useAutosavingState} from 'libraries/forms'
import {Button, Card, Collapse} from 'libraries/ui'
import {useGlobalLoadingAnimation} from 'components/LoadingState'
import {PageTitle} from 'components/PageTitle'
import {DeleteButton} from 'components/widgets/DeleteButton'
import {NavigateButton} from 'components/widgets/NavigateButton'
import {newInstance, WorkshopEditor} from 'components/WorkshopEditor'
import {useFormatDate, useT} from 'i18n'
import { guid } from 'utils/guid'

import {Event, EventProgram as EventProgramType} from 'types'

type Workshop = Event['workshops'][0]

const {
  Input,
  Form
} = formFor<Event>()

export default function EventPage({event}: {event: Event}) {
  const t = useT('pages.events.eventPage')
  return <>
    <PageTitle>
      {event.name}
    </PageTitle>
    <EventDetails event={event} />
    <h2>{t('ballProgram')}</h2>
    <EventProgram program={event.program} />
    <h2>{t('workshops')}</h2>
    <EventWorkshops event={event} />
  </>
}

function EventDetails({event}: {event: Event}) {
  const [showEditor, setShowEditor] = useState(false)
  const t = useT('pages.events.eventPage')
  const formatDate = useFormatDate()
  return <>
    <p>
      {t('eventDate')}: {formatDate(new Date(event.beginDate))} - {formatDate(new Date(event.endDate))}
    </p>
    <p>
      <Button
        onClick={() => setShowEditor(!showEditor)}
        text={showEditor ? t('closeEditor') : t('openBasicDetailsEditor')}
      />
    </p>
    <Collapse isOpen={showEditor}>
      <EventDetailsForm event={event} />
    </Collapse>
  </>
}

function EventDetailsForm({event}: {event: Event}) {
  const t = useT('pages.events.eventPage')
  const [patchEvent] = usePatchEvent()
  const patch = useCallback(
    (eventPatch: Partial<Event>) => patchEvent({ id: event._id, event: eventPatch}),
    [event._id, patchEvent]
  )
  const {state, formProps} = useAutosavingState<Event, Partial<Event>>(event, patch, patchStrategy.partial)

  return <Form {...formProps}>
    <Card>
      <SyncStatus state={state} floatRight/>
      <Input label={t('eventName')} path="name" />
      <DateRangeField<Event>
        id="eventDate"
        label={t('eventDate')}
        beginLabel={t('beginDate')}
        beginPath="beginDate"
        endLabel={t('endDate')}
        endPath="endDate"
        required
      />
    </Card>
  </Form>
}

function EventProgram({program}: {program: EventProgramType}) {
  const t = useT('pages.events.eventPage')
  if (!program || program.danceSets.length === 0) {
    return <>
      <p>{t('noProgram')}</p>
      <NavigateButton adminOnly intent="primary" href="program" text={t('addProgram')} />
    </>
  }

  return <>
    <Card>
      {program.danceSets.map((danceSet, index) =>
        <p key={index} >
          <strong>{danceSet.title}</strong>:{' '}
          {formatDances(danceSet.program)}
        </p>
      )}
    </Card>
    <p>
      <NavigateButton adminOnly intent="primary" href="program" text={t('editProgram')} />
      <NavigateButton href="print/ball-dancelist" target="_blank"
        text={t('printBallDanceList')} />
      <NavigateButton href="ball-program" target="_blank"
        text={t('ballProgramSlideshow')} />
    </p>
  </>

  function formatDances(program) {
    const danceNames = program
      .filter(({item}) => item.__typename !== 'EventProgram' || item.showInLists)
      .map(row => row.item.name)
      .filter(a => a)
    const requestedDanceCount = program.filter(isRequestedDance).length
    if (requestedDanceCount) {
      danceNames.push(t('requestedDance', {count: requestedDanceCount}))
    }

    return danceNames.join(', ')
  }
}

const isRequestedDance = row => row.item.__typename === 'RequestedDance'

function EventWorkshops({event}: {event: Event}) {
  const {workshops, _id: eventId} = event
  const t = useT('pages.events.eventPage')
  return <>
    <>
      {workshops.map(workshop =>
        <WorkshopCard
          workshop={workshop}
          key={workshop._id}
          reservedAbbreviations={workshops.filter(w => w._id !== workshop._id).map(w => w.abbreviation).filter(a => a) as string[]}
        />
      )}
    </>
    <p>
      <CreateWorkshopButton eventId={eventId} startDate={event.beginDate} />
      <NavigateButton href="print/dance-cheatlist" target="_blank"
        text={t('danceCheatlist')} />
      <NavigateButton href="print/dance-instructions" target="_blank"
        text={t('danceInstructions')} />
    </p>
  </>
}

function CreateWorkshopButton({eventId}) {
  const t = useT('pages.events.eventPage')
  const addLoadingAnimation = useGlobalLoadingAnimation()
  const [createWorkshop] = useCreateWorkshop()

  return <AdminOnly>
    <Button
      onClick={() => addLoadingAnimation(createWorkshop(newWorkshop({eventId, name: t('newWorkshop')})))}
      intent="primary"
      text={t('createWorkshop')}
    />
  </AdminOnly>
}

function newWorkshop({eventId, name}) {
  return {
    eventId: eventId,
    workshop: {
      name,
      instanceSpecificDances: false,
      instances: [
        {_id: guid(), danceIds: []}
      ]
    }
  }
}

function WorkshopCard({workshop, reservedAbbreviations}: {workshop: Workshop, reservedAbbreviations: string[]}) {
  const t = useT('pages.events.eventPage')
  const addLoadingAnimation = useGlobalLoadingAnimation()
  const [showEditor, setShowEditor] = useState(false)
  const [deleteWorkshop] = useDeleteWorkshop({refetchQueries: ['getEvent']})
  const {_id, abbreviation, name, description, instances} = workshop
  const dances = instances.flatMap(i => i.dances ?? [])

  return <Card style={{clear: 'right'}}>
    <DeleteButton onDelete={() => addLoadingAnimation(deleteWorkshop({id: _id}))}
      style={{float: 'right'}} text="Poista"
      confirmText={'Haluatko varmasti poistaa työpajan '+name+'?'}
    />
    <Button
      onClick={() => setShowEditor(!showEditor)}
      style={{float: 'right'}} text={showEditor ? t('closeEditor') : t('openEditor')}
    />
    <h2>
      {name}
      {abbreviation &&
            <> ({abbreviation})</>
      }
    </h2>
    {showEditor || <>
      <p>{description}</p>
      {t('dances') + ': '}
      {dances.map(d => d.name).join(', ')}
    </>}
    <Collapse isOpen={showEditor}>
      <WorkshopEditor workshop={workshop} reservedAbbreviations={reservedAbbreviations} />
    </Collapse>
  </Card>
}
