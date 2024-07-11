import {useState} from 'react'

import {backendQueryHook, graphql} from 'backend'
import {useCallbackOnEventChanges} from 'services/events'

import {Selector, Switch} from 'libraries/forms'
import {AutosizedSection, Button} from 'libraries/ui'
import {CenteredContainer} from 'components/CenteredContainer'
import {LoadingState} from 'components/LoadingState'
import {PageTitle} from 'components/PageTitle'
import {PrintTable} from 'components/PrintTable'
import PrintViewToolbar from 'components/widgets/PrintViewToolbar'
import {useT} from 'i18n'
import {uniq} from 'utils/uniq'

import {DanceCheatListQuery} from 'types/gql/graphql'

import './DanceCheatList.sass'

type Workshop = NonNullable<DanceCheatListQuery['event']>['workshops'][0]

const useCheatList = backendQueryHook(graphql(`
query DanceCheatList($eventId: ID!) {
  event(id: $eventId) {
    _id
    workshops {
      _id
      name
      instanceSpecificDances
      instances {
        dances {
          _id
          name
        }
      }
    }
  }
}`), ({refetch, variables}) => {
  if (variables === undefined) throw new Error('Unknown event id')
  useCallbackOnEventChanges(variables.eventId, refetch)
})

export default function DanceCheatList({eventId}) {
  const t = useT('pages.events.danceCheatlist')
  const [repeats, setRepeats] = useState(4)
  const [helpText, setHelptext] = useState(true)
  const {data, ...loadingState} = useCheatList({eventId})
  if (!data?.event) return <LoadingState {...loadingState} />
  const {workshops} = data.event
  const copyCountStr = count => t('nrOfCopies', {count})

  return <div className={`dance-cheatsheet-page repeat-${repeats}`}>
    <PrintViewToolbar>
      <Selector<number>
        selectedItem={repeats}
        items={[1, 2, 4, 6, 8]}
        onSelect={setRepeats}
        getItemText={copyCountStr}
        text={copyCountStr(repeats)}
        alwaysEnabled
      />
      <span>{t('show')}{' '}</span>
      <Switch id="helpText" inline label={t('showHelpText')} value={helpText} onChange={setHelptext}/>
      <Button text={t('print')} onClick={() => window.print()} />
    </PrintViewToolbar>
    <main>
      {Array(repeats).fill(1).map((_, i) =>
        <DanceCheatListView key={`${repeats}-${i}`} workshops={workshops} helpText={helpText} />
      )}
    </main>
  </div>
}

function DanceCheatListView({workshops, helpText}) {
  const t = useT('pages.events.danceCheatlist')
  return <AutosizedSection>
    <CenteredContainer className="dance-cheatsheet">
      {helpText && <p>{t('helpText')}</p>}
      {workshops.map(workshop =>
        <WorkshopDances key={workshop._id} workshop={workshop} />)}
    </CenteredContainer>
  </AutosizedSection>
}

function WorkshopDances({workshop }: {workshop: Workshop}) {
  const t = useT('pages.events.danceCheatlist')
  const {name, instances } = workshop
  const dances = uniq(instances.flatMap(i => i.dances ?? []))
  return <>
    <PageTitle>{name}</PageTitle>
    {dances.length === 0 ?
      <p>{t('noDances')}</p> :
      <PrintTable headings={[t('danceName'), t('iCanDanceThis')]}>
        {dances.map(dance =>
          <tr key={dance._id}>
            <td>
              {dance.name}
            </td>
            <td />
          </tr>
        )}
      </PrintTable>
    }
  </>
}
