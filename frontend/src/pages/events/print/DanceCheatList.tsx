import React, {useState} from 'react'
import classNames from 'classnames'

import {backendQueryHook, graphql} from 'backend'
import {useCallbackOnEventChanges} from 'services/events'

import {Switch} from 'libraries/forms'
import {Button} from 'libraries/ui'
import {CenteredContainer} from 'components/CenteredContainer'
import {EditableDanceProperty} from 'components/EditableDanceProperty'
import {LoadingState} from 'components/LoadingState'
import {PageTitle} from 'components/PageTitle'
import {PrintTable} from 'components/PrintTable'
import PrintViewToolbar from 'components/widgets/PrintViewToolbar'
import {useT} from 'i18n'

import './DanceCheatList.sass'

const useCheatList = backendQueryHook(graphql(`
query DanceCheatList($eventId: ID!) {
  event(id: $eventId) {
    _id
    workshops {
      _id
      name
      dances {
        _id
        name
        description
      }
    }
  }
}`), ({refetch, variables}) => {
  if (variables === undefined) throw new Error('Unknown event id')
  useCallbackOnEventChanges(variables.eventId, refetch)
})

export default function DanceCheatList({eventId}) {
  const t = useT('pages.events.danceCheatlist')
  const [mini, setMini] = useState(false)
  const [helpText, setHelptext] = useState(true)
  const {data, ...loadingState} = useCheatList({eventId})
  if (!data?.event) return <LoadingState {...loadingState} />

  return <>
    <PrintViewToolbar>
      <Switch id="miniView" inline label={t('miniView')} value={mini} onChange={setMini}/>
      <Switch id="helpText" inline label={t('showHelpText')} value={helpText} onChange={setHelptext}/>
      <Button text={t('print')} onClick={() => window.print()} />
    </PrintViewToolbar>
    <DanceCheatListView workshops={data.event.workshops} mini={mini} helpText={helpText} />
  </>
}

function DanceCheatListView({workshops, mini, helpText}) {
  const t = useT('pages.events.danceCheatlist')
  return <CenteredContainer className={classNames('dance-cheatsheet', {mini})}>
    {helpText && <p>{t('helpText')}</p>}
    {workshops.map(workshop =>
      <WorkshopDances key={workshop._id} workshop={workshop} mini={mini} />)}
  </CenteredContainer>
}

function WorkshopDances({workshop, mini}) {
  const t = useT('pages.events.danceCheatlist')
  const {name, dances} = workshop
  return <>
    <PageTitle>{name}</PageTitle>
    {dances.length === 0 ?
      <p>{t('noDances')}</p> :
      <PrintTable headings={[t('danceName'), t('iCanDanceThis')]}>
        {dances.map(dance =>
          <tr key={dance._id}>
            <td>
              {mini
                ? dance.name
                : <>
                  <strong>{dance.name}</strong>
                  <div>
                    <EditableDanceProperty dance={dance} property="description" type="markdown" addText={t('addDescription')} />
                  </div>
                </>
              }
            </td>
            <td />
          </tr>
        )}
      </PrintTable>
    }
  </>
}
