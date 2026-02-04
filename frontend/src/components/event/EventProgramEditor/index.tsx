import { useParams } from 'react-router-dom'

import { Event } from 'types'

import { ListEditorContext, SyncStatus } from 'libraries/forms'
import { Tab, Tabs } from 'libraries/ui'
import {
  DanceSet,
  EventProgramSettings,
  Field,
  Form,
  ListField,
  T,
  useEventProgramEditorForm,
} from 'components/event/EventProgramForm'
import { EventMetadataContext } from 'components/event/EventProgramForm/eventMetadata'
import { BackLink } from 'components/widgets/BackLink'
import { DurationField } from 'components/widgets/DurationField'
import { useT } from 'i18n'

import { getProgramName } from '../utils'
import {
  AddDanceSetButton,
  AddIntroductionButton,
  DuplicateDancesWarning,
  MissingDanceInstructionsCounterTag,
  MissingDancesWarning,
} from './components'
import { DanceSetEditor, IntroductoryInformation } from './components/setEditors'
import { DanceCategoryStats } from './components/stats'
import { SlideshowEditor } from './SlideshowEditor'

import './EventProgramEditor.sass'

interface EventProgramEditorProps {
  event: Event
}

export function EventProgramEditor({ event }: EventProgramEditorProps) {
  const { formProps, formProps: { value }, state } = useEventProgramEditorForm(event._id, event._versionId ?? undefined, event.program)
  const { tabId } = useParams()
  const t = useT('pages.events.eventProgramPage')

  return <Form {...formProps} className="eventProgramEditor">
    <BackLink to="../..">{t('backToEvent')}</BackLink>
    <h1>
      {t('pageTitle')}
      <SyncStatus style={{ marginLeft: '1ch', top: '3px' }} className="grow" state={state} />
    </h1>

    <EventMetadataContext program={value} workshops={event.workshops}>
      <Tabs id="programEditorTabs" renderActiveTabPanelOnly selectedTabId={tabId ?? 'main'}>
        <Tab id="main" href="../main" title={t('tabs.main')} panel={<MainEditor program={value} />} />
        <Tab
          id="slides"
          href="../slides"
          title={<>
            {t('tabs.slides')}
            <MissingDanceInstructionsCounterTag />
          </>}
          panel={<SlideshowEditor program={value} />} />
      </Tabs>
    </EventMetadataContext>
  </Form>
}

function MainEditor({ program }: { program: EventProgramSettings }) {
  const t = useT('components.eventProgramEditor')
  const { danceSets, introductions } = program

  return <section>
    <div className="flex flex-wrap gap-2 justify-between items-start">
      <Field label={t('fields.pauseDuration')} inline path="pauseBetweenDances" component={DurationField} />
      {introductions.program.length === 0 && <AddIntroductionButton />}
    </div>
    <MissingDancesWarning />
    <DuplicateDancesWarning program={program} />
    <ListEditorContext>
      <IntroductoryInformation />
      <ListField
        labelStyle="hidden"
        label=""
        path="danceSets"
        component={DanceSetEditor}
        renderConflictItem={danceSet => renderDanceSetValue(danceSet, t)} />
    </ListEditorContext>
    <div className="my-3.5">
      {danceSets.length === 0 && t('danceProgramIsEmpty')}
      <AddDanceSetButton />
    </div>
    <DanceCategoryStats />
  </section>
}

function renderDanceSetValue(danceSet: DanceSet, t: T) {
  const program = danceSet.program
    .map(i => getProgramName(i, t))
    .join(', ')
  return `${danceSet.title} (${program})`
}
