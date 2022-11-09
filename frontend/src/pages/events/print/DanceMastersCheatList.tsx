import React from 'react'

import {backendQueryHook, graphql} from 'backend'
import {useCallbackOnEventChanges} from 'services/events'

import {Button} from 'libraries/ui'
import {EditableDanceProperty} from 'components/EditableDanceProperty'
import {LoadingState} from 'components/LoadingState'
import {PrintTable} from 'components/PrintTable'
import PrintViewToolbar from 'components/widgets/PrintViewToolbar'
import {makeTranslate} from 'utils/translate'

import './DanceMastersCheatList.sass'

const t = makeTranslate({
  print: 'Tulosta',
  noDances: 'Ei tansseja',
  addDescription: 'Lisää kuvaus',
  addPrelude: 'Lisää alkusoitto',
  introductions: 'Alkutiedotukset',
  requestedDance: 'Toivetanssi',
})

const useCheatList = backendQueryHook(graphql(`
query getDanceMastersCheatList($eventId: ID!) {
  event(id: $eventId) {
    _id
    program {
      introductions {
        title
        program {
          item {
            ... on ProgramItem {
              name
            }
          }
        }
      }
      danceSets {
        title
        program {
          item {
            __typename
            ... on Dance {
              _id
              description
              prelude
            }
            ... on ProgramItem {
              name
            }
          }
        }
      }
    }
  }
}`), ({refetch, variables}) => {
  if (variables === undefined) throw new Error('Unknown event id')
  useCallbackOnEventChanges(variables.eventId, refetch)
})

export default function DanceMastersCheatList({eventId}) {
  const {data, ...loadingState} = useCheatList({eventId})
  if (!data?.event) return <LoadingState {...loadingState} />

  return <>
    <PrintViewToolbar>
      <Button text={t`print`} onClick={() => window.print()} />
    </PrintViewToolbar>
    <DanceMastersCheatListView program={data.event.program} />
  </>
}

function DanceMastersCheatListView({program}) {
  const {introductions, danceSets} = program
  return <PrintTable className="dancemasters-cheatlist">
    {introductions.program.length > 0 &&
      <>
        <HeaderRow>{t`introductions`}</HeaderRow>
        {introductions.program.map((row, i) =>
          <SimpleRow key={i} text={row.item.name} />
        )}
      </>
    }
    {danceSets.map((danceSet, index) =>
      <DanceSetRows key={index} danceSet={danceSet} />
    )}
  </PrintTable>
}

function DanceSetRows({danceSet: {title, program}}) {
  return <>
    <HeaderRow>{title}</HeaderRow>
    {program.map(({item}, i) => {
      switch(item.__typename) {
        case 'Dance':
          return <DanceRow key={i} dance={item} />
        case 'RequestedDance':
          return <SimpleRow key={i} text={t`requestedDance`} />
        default:
          return <SimpleRow key={i} className="info" text={item.name} />
      }
    })}
  </>
}

function DanceRow({dance}) {
  return <tr>
    <td>{dance.name}</td>
    <td>
      <EditableDanceProperty dance={dance} property="description" addText={t`addDescription`} type="markdown" inline />
    </td>
    <td>
      <EditableDanceProperty dance={dance} property="prelude" addText={t`addPrelude`} inline />
    </td>
  </tr>
}

function HeaderRow({children}) {
  return <tr className="header"><th colSpan={3}>{children}</th></tr>
}

function SimpleRow({className, text} : {className?: string, text: React.ReactNode}) {
  return <tr className={className}><td colSpan={3}>{text}</td></tr>
}
