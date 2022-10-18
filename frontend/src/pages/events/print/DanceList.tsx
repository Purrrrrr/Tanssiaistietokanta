import './DanceList.sass'

import {Button} from 'libraries/ui'
import {Switch} from 'libraries/forms2'
import React, {useState} from 'react'
import {backendQueryHook} from 'backend'

import {LoadingState} from 'components/LoadingState'
import PrintViewToolbar from 'components/widgets/PrintViewToolbar'
import {makeTranslate} from 'utils/translate'

const t = makeTranslate({
  showSideBySide: 'Näytä setit rinnakkain',
  print: 'Tulosta',
  emptyLinesAreRequestedDances: 'Tyhjät rivit ovat toivetansseja.',
  workshopNameIsInParenthesis: 'Suluissa opetussetti',
})

function DanceList({eventId}) {
  const {program, workshops, loadingState} = useBallProgram(eventId)
  const [sidebyside, setSidebyside] = useState(false)
  const colClass = (sidebyside ? ' three-columns' : '')

  if (!program) return <LoadingState {...loadingState} />

  return <div className={'danceList' + colClass}>
    <PrintViewToolbar>
      <Switch id="showSideBySide" inline label={t`showSideBySide`} value={sidebyside} onChange={setSidebyside}/>
      <Button text={t`print`} onClick={() => window.print()} />
    </PrintViewToolbar>
    <PrintFooterContainer footer={<Footer workshops={workshops.filter(w => w.abbreviation)} />}>
      {program.danceSets.map(
        ({name, program}, key) => {
          return <div key={key} className="section">
            <h2>{name}</h2>
            {program
              .map(row => row.item)
              .filter(item => item.__typename !== 'EventProgram' || item.showInLists)
              .map((item, i) =>
                <ProgramItem key={i} item={item} />
              )}
          </div>
        }
      )}
    </PrintFooterContainer>
  </div>
}

function Footer({workshops}) {
  if (!workshops.length) return <>{t`emptyLinesAreRequestedDances`}</>
  return <>
    {t`workshopNameIsInParenthesis`}
    {': '}
    {workshops.map(({abbreviation, name}) => `${abbreviation}=${name}`).join(', ')}
    {'. '}
    {t`emptyLinesAreRequestedDances`}
  </>
}

function ProgramItem({item}) {
  const teachedIn = (item.teachedIn ?? [])
    .map(workshop => workshop.abbreviation)
    .filter(a => a)
    .join(', ')
  return <p>
    {item.name ?? <RequestedDance />}
    {teachedIn && (' ('+teachedIn+')')
    }
  </p>
}

const RequestedDance = () => <>_________________________</>

function PrintFooterContainer({children, footer}) {
  return <>
    <table style={{width: '100%'}}>
      <thead><tr><td></td></tr></thead>
      <tfoot><tr><td>{footer}</td></tr></tfoot>
      <tbody><tr><td>{children}</td></tr></tbody>
    </table>
    <footer>{footer}</footer>
  </>
}

const useDanceList = backendQueryHook(`
query getDanceList($eventId: ID!) {
  event(id: $eventId) {
    _id
    program {
      danceSets {
        name
        program {
          item {
            __typename
            ... on ProgramItem {
              name
            }
            ... on Dance {
              teachedIn(eventId: $eventId) {
                name, abbreviation
              }
            }
            ... on EventProgram {
              showInLists
            }
          }
        }
      }
    }
    workshops {
      name, abbreviation
    }
  }
}`)

function useBallProgram(eventId) {
  const {data, ...loadingState} = useDanceList({eventId})
  const {program = null, workshops = null} = data ? data.event : {}
  return {program, workshops, loadingState}
}

export default DanceList
