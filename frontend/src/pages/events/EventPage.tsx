import React from 'react'
import {Link} from 'react-router-dom'

import {useDeleteWorkshop} from 'services/workshops'

import {Card} from 'libraries/ui'
import {PageTitle} from 'components/PageTitle'
import {DeleteButton} from 'components/widgets/DeleteButton'
import {NavigateButton} from 'components/widgets/NavigateButton'
import {makeTranslate} from 'utils/translate'

const t = makeTranslate({
  ballProgram: 'Tanssiaisohjelma',
  noProgram: 'Ei ohjelmaa',
  editProgram: 'Muokkaa ohjelmaa',
  addProgram: 'Luo ohjelma',
  workshops: 'Työpajat',
  danceMasterCheatList: 'Tanssiaisjuontajan lunttilappu',
  printBallDanceList: 'Tulosta settilista',
  ballProgramSlideshow: 'Tanssiaisten diashow',
  dances: 'Tanssit',
  createWorkshop: 'Uusi työpaja',
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
    <NavigateButton href="print/dancemasters-cheatlist" target="_blank"
      text={t`danceMasterCheatList`} />
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
      <WorkshopLink workshop={workshop} key={workshop._id} />
    )}
    <NavigateButton adminOnly intent="primary" href="workshops/create"
      text={t`createWorkshop`} />
    <NavigateButton href="print/dance-cheatlist" target="_blank"
      text={t`danceCheatlist`} />
    <NavigateButton href="print/dance-instructions" target="_blank"
      text={t`danceInstructions`} />
  </>
}

function WorkshopLink({workshop}) {
  const [deleteWorkshop] = useDeleteWorkshop({refetchQueries: ['getEvent']})
  const {_id, abbreviation, name, description, dances} = workshop

  return <Card style={{clear: 'right'}}>
    <DeleteButton onDelete={() => deleteWorkshop({id: _id})}
      style={{float: 'right'}} text="Poista"
      confirmText={'Haluatko varmasti poistaa työpajan '+name+'?'}
    />
    <Link to={'workshops/'+workshop._id} ><h2>
      {name}
      {abbreviation &&
            <> ({abbreviation})</>
      }
    </h2></Link>
    <p>{description}</p>
    {t`dances` + ': '}
    {dances.map(d => d.name).join(', ')}
  </Card>
}
