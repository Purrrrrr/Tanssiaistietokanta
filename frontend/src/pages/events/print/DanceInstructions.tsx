import { MarkdownToJSX } from 'markdown-to-jsx/react'
import React, { useCallback, useRef, useState } from 'react'
import { Edit } from '@blueprintjs/icons'
import classNames from 'classnames'

import { Dance, EditableDance } from 'types'
import { DanceInstructionsQuery } from 'types/gql/graphql'

import { backendQueryHook, cleanMetadataValues, graphql } from 'backend'
import { sortDances, usePatchDance } from 'services/dances'
import { useCallbackOnEventChanges } from 'services/events'

import { formFor, patchStrategy, Switch, SyncStatus, useAutosavingState } from 'libraries/forms'
import { Button, H2, Markdown, showToast } from 'libraries/ui'
import { InstructionEditor } from 'components/dance/DanceEditor'
import { WikipageSelector } from 'components/dance/WikipageSelector'
import { LoadingState } from 'components/LoadingState'
import { PrintViewToolbar } from 'components/print'
import { useFormatDateTime, useT, useTranslation } from 'i18n'
import { selectElement } from 'utils/selectElement'
import { uniq } from 'utils/uniq'

import './DanceInstructions.sass'
import { RequirePermissions } from 'components/rights/RequirePermissions'

type Workshop = NonNullable<DanceInstructionsQuery['event']>['workshops'][0]

const { Form, Field } = formFor<Dance>()

export default function DanceInstructions({ eventId }) {
  const t = useT('pages.events.danceInstructions')
  const dancesEl = useRef<HTMLElement>(null)
  const [showWorkshops, setShowWorkshops] = useState(true)
  const [showDances, setShowDances] = useState(true)
  const [showShortInstructions, setShowShortInstructions] = useState(false)
  const [hilightEmpty, setHilightEmpty] = useState(false)

  function selectAndCopy() {
    selectElement(dancesEl.current)
    document.execCommand('copy')
    showToast({ message: t('instructionsCopied') })
    window.getSelection()?.removeAllRanges()
  }

  return <>
    <PrintViewToolbar maxHeight={180}>
      <p>{t('clickInstructionsToEdit')}</p>
      <p>{t('defaultStylingDescription')}</p>
      <p>
        <Switch id="showWorkshops" inline label={t('showWorkshops')} value={showWorkshops} onChange={setShowWorkshops} />
        <Switch id="showDances" inline label={t('showDances')} value={showDances} onChange={setShowDances} />
        {showDances &&
          <>
            <Switch id="showShortInstructions" inline label={t('showShortInstructions')} value={showShortInstructions} onChange={setShowShortInstructions} />
            <Switch id="hilightEmpty" inline label={t('hilightEmpty')} value={hilightEmpty} onChange={setHilightEmpty} />
          </>
        }
        <Button text={t('selectAndCopy')} onClick={selectAndCopy} />
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

function DanceInstructionsView({ eventId, showWorkshops, showDances, hilightEmpty, showShortInstructions, elementRef }) {
  const t = useT('pages.events.danceInstructions')
  const { data, refetch, ...loadingState } = useDanceInstructions({ eventId })
  const formatDateTime = useFormatDateTime()

  if (!data?.event) return <LoadingState {...loadingState} refetch={refetch} />

  const { workshops, program } = data.event
  const dances = getDances(workshops)

  return <section className={classNames('dance-instructions', { 'hilight-empty': hilightEmpty, showShortInstructions })} ref={elementRef}>
    {showWorkshops &&
      <section className="workshops">
        <h1>{t('workshops')}</h1>
        {workshops.map(workshop => <WorkshopDetails key={workshop._id} workshop={workshop} />)}
        {program.dateTime && <>
          <H2>
            {t('ball')}
          </H2>
          <p className="font-bold">{formatDateTime(program.dateTime)}</p>
        </>}
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
    program {
      dateTime
    }
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
          wikipageName
          wikipage {
            instructions
          }
        }
      }
    }
  }
}`), ({ refetch, variables }) => {
  if (variables === undefined) throw new Error('Unknown event id')
  useCallbackOnEventChanges(variables.eventId, refetch)
})

interface Instance {
  dances?: { name: string, _id: string }[] | null
}

function getDances(workshops: { instances: Instance[] }[]) {
  const dances = uniq(workshops.flatMap(w => w.instances).flatMap(i => i.dances ?? []))
  return sortDances(dances)
}

function InstructionsForDance({ dance, showShortInstructions }: { dance: Dance, showShortInstructions: boolean }) {
  const [editorOpen, setEditorOpen] = useState(false)
  const field = showShortInstructions ? 'description' : 'instructions' as const
  const value = dance[field] ?? ''

  return <div className={`dance-instructions-dance ${value.trim() !== '' ? 'not-empty' : 'empty'}`}>
    <H2>
      {dance.name}
      <RequirePermissions right="dances:modify">
        <Button
          color="primary"
          minimal
          icon={<Edit />}
          aria-label={useTranslation(editorOpen ? 'common.closeEditor' : 'common.edit')}
          onClick={() => setEditorOpen(!editorOpen)}
        />
      </RequirePermissions>
    </H2>
    <div className={field}>
      {editorOpen
        ? <DanceFieldEditor dance={dance} field={field} />
        : <Markdown options={{ overrides: markdownOverrides }} children={dance[field] ?? ''} />
      }
    </div>
  </div>
}

function DanceFieldEditor({ dance: danceInDatabase, field }: { dance: Dance, field: 'description' | 'instructions' }) {
  const t = useT('domain.dance')
  const [patchDance] = usePatchDance()
  const onPatch = useCallback(
    (dance) => patchDance({
      id: danceInDatabase._id,
      dance: cleanMetadataValues(dance),
    }),
    [danceInDatabase, patchDance],
  )
  const { value, onChange, state } = useAutosavingState<EditableDance, Partial<EditableDance>>(danceInDatabase, onPatch, patchStrategy.partial)

  return <Form value={value} onChange={onChange}>
    <SyncStatus state={state} floatRight />
    <Field
      label={t(field)}
      path={field}
      component={InstructionEditor}
      componentProps={{ danceId: danceInDatabase._id, wikipage: danceInDatabase.wikipage, markdownOverrides }}
    />
    <Field label={t('wikipageName')} path="wikipageName" component={WikipageSelector} componentProps={{ possibleName: danceInDatabase.name }} />
  </Form>
}

const markdownOverrides = {
  h1: { component: 'h3' },
  h2: { component: 'h4' },
  h3: { component: 'h5' },
  h4: { component: 'h6' },
  h5: { component: 'span' },
  a: { component: 'span' },
} as MarkdownToJSX.Overrides

function WorkshopDetails({ workshop }: { workshop: Workshop }) {
  const t = useT('pages.events.danceInstructions')
  const { name, description, instanceSpecificDances, instances } = workshop
  const formatDateTime = useFormatDateTime()

  return <div className="workshop">
    <H2>
      {name}
    </H2>
    <p className="description">{description}</p>
    {instanceSpecificDances
      ? instances.map(instance =>
        <React.Fragment key={instance._id}>
          <h3 className="font-bold">{formatDateTime(new Date(instance.dateTime))}</h3>
          <p>
            {t('dances')} : {instance?.dances?.map(d => d.name)?.join(', ')}
          </p>
        </React.Fragment>,
      )
      : <>
        <h3 className="font-bold">{instances.map(instance => formatDateTime(new Date(instance.dateTime))).join(', ')}</h3>
        <p>{t('dances') + ': '}{instances[0]?.dances?.map(d => d.name)?.join(', ')}</p>
      </>
    }
  </div>
}
