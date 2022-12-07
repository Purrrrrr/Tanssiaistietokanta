import React, {useState} from 'react'

import {AdminOnly} from 'services/users'
import {useCreateWorkshop, useDeleteWorkshop} from 'services/workshops'

import {Button, Card, Collapse} from 'libraries/ui'
import {PageTitle} from 'components/PageTitle'
import {DeleteButton} from 'components/widgets/DeleteButton'
import {NavigateButton} from 'components/widgets/NavigateButton'
import {WorkshopEditor} from 'components/WorkshopEditor'
import {makeTranslate} from 'utils/translate'

const t = makeTranslate({
  ballProgram: 'Tanssiaisohjelma',
  noProgram: 'Ei ohjelmaa',
  editProgram: 'Muokkaa ohjelmaa',
  addProgram: 'Luo ohjelma',
  workshops: 'Työpajat',
  printBallDanceList: 'Tulosta settilista',
  ballProgramSlideshow: 'Tanssiaisten diashow',
  dances: 'Tanssit',
  createWorkshop: 'Uusi työpaja',
  newWorkshop: 'Uusi työpaja',
  danceCheatlist: 'Osaan tanssin -lunttilappu',
  danceInstructions: 'Työpajojen tanssiohjeet',
  requestedDance: {
    one: 'Toivetanssi',
    other: '%(count)s toivetanssia'
  }
})

export default function EventPage({event}) {
  return <>
    <PageTitle>{event.name}</PageTitle>
    <t.h2>ballProgram</t.h2>
    <EventProgram program={event.program} />
    <t.h2>workshops</t.h2>
    <EventWorkshops workshops={event.workshops} eventId={event._id} />
  </>
}

function EventProgram({program}) {
  if (!program || program.danceSets.length === 0) {
    return <>
      <t.p>noProgram</t.p>
      <NavigateButton adminOnly intent="primary" href="program" text={t`addProgram`} />
    </>
  }

  return <>
    {program.danceSets.map((danceSet, index) =>
      <p key={index} >
        <strong>{danceSet.title}</strong>:{' '}
        {formatDances(danceSet.program)}
      </p>
    )}
    <NavigateButton adminOnly intent="primary" href="program" text={t`editProgram`} />
    <NavigateButton href="print/ball-dancelist" target="_blank"
      text={t`printBallDanceList`} />
    <NavigateButton href="ball-program" target="_blank"
      text={t`ballProgramSlideshow`} />
  </>
}

function formatDances(program) {
  const danceNames = program
    .filter(({item}) => item.__typename !== 'EventProgram' || item.showInLists)
    .map(row => row.item.name)
    .filter(a => a)
  const requestedDanceCount = program.filter(isRequestedDance).length
  if (requestedDanceCount) {
    danceNames.push(t.pluralize('requestedDance', requestedDanceCount))
  }

  return danceNames.join(', ')
}
const isRequestedDance = row => row.item.__typename === 'RequestedDance'

function EventWorkshops({workshops, eventId}) {
  return <>
    {workshops.map(workshop =>
      <WorkshopCard workshop={workshop} key={workshop._id} />
    )}
    <CreateWorkshopButton eventId={eventId} />
    <NavigateButton href="print/dance-cheatlist" target="_blank"
      text={t`danceCheatlist`} />
    <NavigateButton href="print/dance-instructions" target="_blank"
      text={t`danceInstructions`} />
  </>
}

function CreateWorkshopButton({eventId}) {
  const [createWorkshop] = useCreateWorkshop()

  return <AdminOnly>
    <Button
      onClick={() => createWorkshop({eventId: eventId, workshop: {name: t`newWorkshop`, danceIds: []}})}
      intent="primary"
      text={t`createWorkshop`}
    />
  </AdminOnly>
}

function WorkshopCard({workshop}) {
  const [showEditor, setShowEditor] = useState(false)
  const [deleteWorkshop] = useDeleteWorkshop({refetchQueries: ['getEvent']})
  const {_id, abbreviation, name, description, dances} = workshop

  return <Card style={{clear: 'right'}}>
    <DeleteButton onDelete={() => deleteWorkshop({id: _id})}
      style={{float: 'right'}} text="Poista"
      confirmText={'Haluatko varmasti poistaa työpajan '+name+'?'}
    />
    <Button
      onClick={() => setShowEditor(!showEditor)}
      intent="primary"
      style={{float: 'right'}} text="Muokkaa"
    />
    <h2>
      {name}
      {abbreviation &&
            <> ({abbreviation})</>
      }
    </h2>
    {showEditor || <>
      <p>{description}</p>
      {t`dances` + ': '}
      {dances.map(d => d.name).join(', ')}
    </>}
    <Collapse isOpen={showEditor}>
      <WorkshopEditor workshop={workshop} />
    </Collapse>
  </Card>
}
