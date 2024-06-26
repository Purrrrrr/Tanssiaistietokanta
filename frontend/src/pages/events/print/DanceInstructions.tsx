import {useCallback, useRef, useState} from 'react'

import {backendQueryHook, graphql} from 'backend'
import {usePatchDance} from 'services/dances'
import {useCallbackOnEventChanges} from 'services/events'

import {ClickToEditMarkdown, patchStrategy, Switch, useAutosavingState} from 'libraries/forms'
import {Button} from 'libraries/ui'
import {DanceDataImportButton} from 'components/DanceDataImportDialog'
import {LoadingState} from 'components/LoadingState'
import PrintViewToolbar from 'components/widgets/PrintViewToolbar'
import {useT} from 'i18n'
import {selectElement} from 'utils/selectElement'
import {showToast} from 'utils/toaster'
import {uniq} from 'utils/uniq'

import {Dance, Event} from 'types'

import './DanceInstructions.sass'

const useDanceInstructions= backendQueryHook(graphql(`
query DanceInstructions($eventId: ID!) {
  event(id: $eventId) {
    _id
    workshops {
      _id
      name
      description
      instances {
        _id
        dances {
          _id
          name
          instructions
          formation
          category
        }
      }
    }
  }
}`), ({refetch, variables}) => {
  if (variables === undefined) throw new Error('Unknown event id')
  useCallbackOnEventChanges(variables.eventId, refetch)
})

export default function DanceInstructions({eventId}) {
  const t = useT('pages.events.danceInstructions')
  const {data, refetch, ...loadingState} = useDanceInstructions({eventId})
  const dancesEl = useRef<HTMLElement>(null)
  const [showWorkshops, setShowWorkshops] = useState(true)

  if (!data?.event) return <LoadingState {...loadingState} refetch={refetch} />

  const {workshops} = data.event
  const dances = getDances(workshops)

  function selectAndCopy() {
    selectElement(dancesEl.current)
    document.execCommand('copy')
    showToast({message: t('instructionsCopied')})
    window.getSelection()?.removeAllRanges()
  }

  return <>
    <PrintViewToolbar maxHeight={180}>
      <p>{t('clickInstructionsToEdit')}</p>
      <p>{t('defaultStylingDescription')}</p>
      <p>
        <Switch id="showWorkshops" inline label={t('showWorkshops')} value={showWorkshops} onChange={setShowWorkshops}/>
        <Button text={t('selectAndCopy')} onClick={selectAndCopy}/>
        <Button text={t('print')} onClick={() => window.print()} />
      </p>
    </PrintViewToolbar>
    <section className="dance-instructions" ref={dancesEl}>
      {showWorkshops &&
        <>
          <h1>{t('workshops')}</h1>
          {workshops.map(workshop => <Workshop key={workshop._id} workshop={workshop} />)}
        </>
      }
      <h1>{t('danceInstructions')}</h1>

      {dances.map(dance => <InstructionsForDance key={dance._id} dance={dance} />)}
    </section>
  </>
}

function getDances(workshops: Event['workshops']) {
  const dances = uniq(workshops.flatMap(w => w.instances).flatMap(i => i.dances))
  dances.sort((a, b) => a.name.localeCompare(b.name))
  return dances
}

function InstructionsForDance({dance: danceInDatabase} : {dance: Dance}) {
  const [patchDance] = usePatchDance()
  const onChange = useCallback(
    (dance) => patchDance({
      id: danceInDatabase._id,
      dance,
    }),
    [danceInDatabase, patchDance]
  )
  const {value: dance, onChange: setDance} = useAutosavingState<Dance, Partial<Dance>>(danceInDatabase, onChange, patchStrategy.partial)

  const {name, instructions} = dance

  return <div tabIndex={0} className="dance-instructions-dance">
    <h2>
      {name}
      {' '}
      <DanceDataImportButton dance={dance} />
    </h2>
    <ClickToEditMarkdown
      id={'instructions-'+dance._id}
      value={instructions}
      onChange={(instructions) => typeof instructions === 'function'
        ? setDance(dance => ({...dance, instructions: instructions(dance.instructions ?? '')}), 'instructions')
        : setDance({...dance, instructions}, 'instructions')
      }
      markdownOverrides={markdownOverrides}
    />
  </div>
}

const markdownOverrides = {
  h1: { component: 'h2'},
  h2: { component: 'h3'},
  h3: { component: 'h4'},
  h4: { component: 'h5'},
  h5: { component: 'h6'},
  a: { component: 'span' }
}

function Workshop({workshop}) {
  const t = useT('pages.events.danceInstructions')
  const {name, description, instances } = workshop
  const dances = instances.flatMap(i => i.dances)

  return <div className="workshop">
    <h2>
      {name}
    </h2>
    <p className="description">{description}</p>
    <p>{t('dances')}: {dances.map(d => d.name).join(', ')}</p>
  </div>
}
