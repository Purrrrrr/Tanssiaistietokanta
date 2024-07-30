import React, {useCallback, useRef, useState} from 'react'
import classNames from 'classnames'

import {backendQueryHook, graphql} from 'backend'
import {sortDances, usePatchDance} from 'services/dances'
import {useCallbackOnEventChanges} from 'services/events'

import {ClickToEditMarkdown, formFor, patchStrategy, Switch, useAutosavingState} from 'libraries/forms'
import {Button} from 'libraries/ui'
import {DanceDataImportButton} from 'components/DanceDataImportDialog'
import {LoadingState} from 'components/LoadingState'
import PrintViewToolbar from 'components/widgets/PrintViewToolbar'
import {useFormatDateTime, useT} from 'i18n'
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
  const [showDances, setShowDances] = useState(true)
  const [showShortInstructions, setShowShortInstructions] = useState(false)
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
        <Switch id="showDances" inline label={t('showDances')} value={showDances} onChange={setShowDances}/>
        {showDances &&
          <>
            <Switch id="showShortInstructions" inline label={t('showShortInstructions')} value={showShortInstructions} onChange={setShowShortInstructions}/>
            <Switch id="hilightEmpty" inline label={t('hilightEmpty')} value={hilightEmpty} onChange={setHilightEmpty}/>
          </>
        }
        <Button text={t('selectAndCopy')} onClick={selectAndCopy}/>
        <Button text={t('print')} onClick={() => window.print()} />
      </p>
    </PrintViewToolbar>
    <DanceInstructionsView
      eventId={eventId}
      elementRef={dancesEl}
      hilightEmpty={hilightEmpty}
      showWorkshops={showWorkshops}
      showDances={showDances}
      showShortInstructions={showShortInstructions}
    />
  </>
}

function DanceInstructionsView({eventId, showWorkshops, showDances, hilightEmpty, showShortInstructions, elementRef}) {
  const t = useT('pages.events.danceInstructions')
  const {data, refetch, ...loadingState} = useDanceInstructions({eventId})

  if (!data?.event) return <LoadingState {...loadingState} refetch={refetch} />

  const {workshops} = data.event
  const dances = getDances(workshops)

  return <section className={classNames('dance-instructions', {'hilight-empty': hilightEmpty, showShortInstructions})} ref={elementRef}>
    {showWorkshops &&
      <section className="workshops">
        <h1>{t('workshops')}</h1>
        {workshops.map(workshop => <WorkshopDetails key={workshop._id} workshop={workshop} />)}
      </section>
    }
    {showDances &&
      <section className="dances">
        <h1>{t('danceInstructions')}</h1>
        {dances.map(dance => <InstructionsForDance key={dance._id} dance={dance} showShortInstructions={showShortInstructions} />)}
      </section>
    }
  </section>
}

const useDanceInstructions = backendQueryHook(graphql(`
query DanceInstructions($eventId: ID!) {
  event(id: $eventId) {
    _id
    _versionId
    workshops {
      _id
      name
      description
      instanceSpecificDances
      instances {
        _id
        dateTime
        dances {
          _id
          name
          description
          instructions
          formation
          category
          source
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
  return sortDances(dances)
}

function InstructionsForDance({dance: danceInDatabase, showShortInstructions} : {dance: Dance, showShortInstructions: boolean}) {
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

  return <div className={`dance-instructions-dance ${instructions ? 'not-empty' : 'empty'}`}>
    <Form value={dance} onChange={setDance}>
      <h2>
        {name}
        {' '}
        <DanceDataImportButton dance={dance} />
      </h2>
      <div className={showShortInstructions ? 'description' : 'instructions'}>
        <Field
          label=""
          labelStyle="hidden-nowrapper"
          path={showShortInstructions ? 'description' : 'instructions'}
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
  const {name, description, instanceSpecificDances, instances } = workshop
  const formatDateTime = useFormatDateTime()

  return <div className="workshop">
    <h2>
      {name}
    </h2>
    <p className="description">{description}</p>
    {instanceSpecificDances
      ? instances.map(instance =>
        <React.Fragment key={instance._id}>
          <h3>{formatDateTime(new Date(instance.dateTime))}</h3>
          <p>
            {t('dances')} : {instance?.dances?.map(d => d.name)?.join(', ')}
          </p>
        </React.Fragment>
      )
      : <>
        <h3>{instances.map(instance => formatDateTime(new Date(instance.dateTime))).join(', ')}</h3>
        <p>{t('dances') + ': '}{instances[0]?.dances?.map(d => d.name)?.join(', ')}</p>
      </>
    }
  </div>
}
