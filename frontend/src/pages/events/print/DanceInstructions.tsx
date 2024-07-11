import {useCallback, useRef, useState} from 'react'
import classNames from 'classnames'

import {backendQueryHook, graphql} from 'backend'
import {usePatchDance} from 'services/dances'
import {useCallbackOnEventChanges} from 'services/events'

import {ClickToEditMarkdown, formFor, patchStrategy, Switch, useAutosavingState} from 'libraries/forms'
import {Button} from 'libraries/ui'
import {DanceDataImportButton} from 'components/DanceDataImportDialog'
import {LoadingState} from 'components/LoadingState'
import PrintViewToolbar from 'components/widgets/PrintViewToolbar'
import {useT} from 'i18n'
import {selectElement} from 'utils/selectElement'
import {showToast} from 'utils/toaster'
import {uniq} from 'utils/uniq'

import {Dance} from 'types'
import {DanceInstructionsQuery} from 'types/gql/graphql'

import './DanceInstructions.sass'

type Workshop = NonNullable<DanceInstructionsQuery['event']>['workshops'][0]

const { Form, Field } = formFor<Dance>()

export default function DanceInstructions({eventId}) {
  const t = useT('pages.events.danceInstructions')
  const dancesEl = useRef<HTMLElement>(null)
  const [showWorkshops, setShowWorkshops] = useState(true)
  const [hilightEmpty, setHilightEmpty] = useState(false)

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
        <Switch id="hilightEmpty" inline label={t('hilightEmpty')} value={hilightEmpty} onChange={setHilightEmpty}/>
        <Button text={t('selectAndCopy')} onClick={selectAndCopy}/>
        <Button text={t('print')} onClick={() => window.print()} />
      </p>
    </PrintViewToolbar>
    <DanceInstructionsView eventId={eventId} elementRef={dancesEl} hilightEmpty={hilightEmpty} showWorkshops={showWorkshops} />
  </>
}

function DanceInstructionsView({eventId, showWorkshops, hilightEmpty, elementRef}) {
  const t = useT('pages.events.danceInstructions')
  const {data, refetch, ...loadingState} = useDanceInstructions({eventId})

  if (!data?.event) return <LoadingState {...loadingState} refetch={refetch} />

  const {workshops} = data.event
  const dances = getDances(workshops)

  return <section className={classNames('dance-instructions', {'hilight-empty': hilightEmpty})} ref={elementRef}>
    {showWorkshops &&
      <>
        <h1>{t('workshops')}</h1>
        {workshops.map(workshop => <WorkshopDetails key={workshop._id} workshop={workshop} />)}
      </>
    }
    <h1>{t('danceInstructions')}</h1>

    {dances.map(dance => <InstructionsForDance key={dance._id} dance={dance} />)}
  </section>
}

const useDanceInstructions = backendQueryHook(graphql(`
query DanceInstructions($eventId: ID!) {
  event(id: $eventId) {
    _id
    workshops {
      _id
      name
      description
      instanceSpecificDances
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

interface Instance {
  dances?: {name: string, _id: string}[] | null
}

function getDances(workshops: {instances: Instance[]}[]) {
  const dances = uniq(workshops.flatMap(w => w.instances).flatMap(i => i.dances ?? []))
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

  return <div tabIndex={0} className={`dance-instructions-dance ${instructions ? 'not-empty' : 'empty'}`}>
    <Form value={dance} onChange={setDance}>
      <h2>
        {name}
        {' '}
        <DanceDataImportButton dance={dance} />
      </h2>
      <div className="instructions">
        <Field
          label=""
          labelStyle="hidden-nowrapper"
          path="instructions"
          component={ClickToEditMarkdown}
          componentProps={{markdownOverrides}}
        />
      </div>
    </Form>
  </div>
}

const markdownOverrides = {
  h1: { component: 'h3'},
  h2: { component: 'h4'},
  h3: { component: 'h5'},
  h4: { component: 'h6'},
  h5: { component: 'span'},
  a: { component: 'span' }
}

function WorkshopDetails({workshop}: {workshop: Workshop}) {
  const t = useT('pages.events.danceInstructions')
  const {name, description, instances } = workshop
  const dances = uniq(instances.flatMap(i => i.dances ?? []))

  return <div className="workshop">
    <h2>
      {name}
    </h2>
    <p className="description">{description}</p>
    <p>{t('dances')}: {dances.map(d => d.name).join(', ')}</p>
  </div>
}
