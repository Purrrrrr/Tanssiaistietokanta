import {useState} from 'react'

import {DanceCheatListQuery} from 'types/gql/graphql'

import {backendQueryHook, graphql} from 'backend'
import {useCallbackOnEventChanges} from 'services/events'

import {NumberInput, Switch} from 'libraries/forms'
import {Button} from 'libraries/ui'
import {LoadingState} from 'components/LoadingState'
import { A4Page, PrintPageContainer, PrintViewToolbar, RepeatingGrid } from 'components/print'
import {PrintTable} from 'components/PrintTable'
import {useT} from 'i18n'
import {uniq} from 'utils/uniq'

import './DanceCheatList.sass'

type Workshop = NonNullable<DanceCheatListQuery['event']>['workshops'][0]

const useCheatList = backendQueryHook(graphql(`
query DanceCheatList($eventId: ID!) {
  event(id: $eventId) {
    _id, _versionId
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
  const [cols, setCols] = useState(2)
  const [rows, setRows] = useState(2)
  const [landscape, setLandscape] = useState(true)
  const [helpText, setHelptext] = useState(true)
  const {data, ...loadingState} = useCheatList({eventId})
  if (!data?.event) return <LoadingState {...loadingState} />
  const {workshops} = data.event

  return <PrintPageContainer>
    <div className="dance-cheatsheet-page">
      <PrintViewToolbar>
        <div className="flex items-center gap-2 *:mb-0!">
          <label htmlFor="cols">{t('cols')}</label>
          <NumberInput
            inline
            id="cols"
            size={2}
            min={1}
            max={10}
            value={cols}
            onChange={setCols}
          />
          <label htmlFor="rows">{t('rows')}</label>
          <NumberInput
            inline
            id="rows"
            size={2}
            min={1}
            max={10}
            value={rows}
            onChange={setRows}
          />
          <span> = {t('nrOfCopies', { count: rows * cols })}</span>
          <Switch id="landscape" inline label={t('landscape')} value={landscape} onChange={setLandscape}/>
          <Switch id="helpText" inline label={t('showHelpText')} value={helpText} onChange={setHelptext}/>
          <Button text={t('print')} onClick={() => window.print()} />
        </div>
      </PrintViewToolbar>
      <A4Page onePage landscape={landscape}>
        <RepeatingGrid cols={normalize(cols)} rows={normalize(rows)} repeatChildren>
          <DanceCheatListView workshops={workshops} helpText={helpText} />
        </RepeatingGrid>
      </A4Page>
    </div>
  </PrintPageContainer>
}

const normalize = (n: number) => isNaN(n)
  ? 1
  : n < 1
    ? 1 : n

function DanceCheatListView({workshops, helpText}) {
  const t = useT('pages.events.danceCheatlist')
  return <div className="dance-cheatsheet">
    {helpText && <p>{t('helpText')}</p>}
    {workshops.map(workshop =>
      <WorkshopDances key={workshop._id} workshop={workshop} />)}
  </div>
}

function WorkshopDances({workshop }: {workshop: Workshop}) {
  const t = useT('pages.events.danceCheatlist')
  const {name, instances } = workshop
  const dances = uniq(instances.flatMap(i => i.dances ?? []))
  return <>
    <h2>{name}</h2>
    {dances.length === 0 ?
      <p>{t('noDances')}</p> :
      <PrintTable className="w-full" headings={[t('danceName'), t('iCanDanceThis')]}>
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
