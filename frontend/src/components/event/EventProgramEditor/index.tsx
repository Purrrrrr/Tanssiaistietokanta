import { useNavigate, useParams } from 'react-router-dom'

import {Event} from 'types'

import {ListEditorContext, SyncStatus} from 'libraries/forms'
import {Tab, Tabs} from 'libraries/ui'
import {
  DanceSet,
  EventProgramSettings,
  Field,
  Form,
  ListField,
  programItemToString,
  T,
  useEventProgramEditorForm,
} from 'components/event/EventProgramForm'
import { EventMetadataContext } from 'components/event/EventProgramForm/eventMetadata'
import {BackLink} from 'components/widgets/BackLink'
import {DurationField} from 'components/widgets/DurationField'
import {useT} from 'i18n'

import {
  AddDanceSetButton,
  AddIntroductionButton,
  DuplicateDancesWarning,
  MissingDanceInstructionsCounterTag,
  MissingDancesWarning,
} from './components'
import { DanceSetEditor, IntroductoryInformation } from './components/setEditors'
import { DanceCategoryStats } from './components/stats'
import { SlideshowEditor} from './SlideshowEditor'

import './EventProgramEditor.sass'

export { programItemToString }

interface EventProgramEditorProps {
  event: Event
}

export function EventProgramEditor({event}: EventProgramEditorProps) {
  const {formProps, formProps: { value }, state} = useEventProgramEditorForm(event._id, event._versionId ?? undefined, event.program)
  const { tabId } = useParams()
  const navigate = useNavigate()
  const changeTab = (nextTabId: string) => navigate(`../${nextTabId}`)
  const t = useT('pages.events.eventProgramPage')

  return <Form {...formProps} className="eventProgramEditor">
    <BackLink to="../..">{t('backToEvent')}</BackLink>
    <h1>
      {t('pageTitle')}
      <SyncStatus style={{marginLeft: '1ch', top: '3px'}} className="grow" state={state} />
    </h1>

    <EventMetadataContext program={value} workshops={event.workshops}>
      <Tabs id="programEditorTabs" renderActiveTabPanelOnly selectedTabId={tabId ?? 'main'} onChange={changeTab}>
        <Tab id="main" title={t('tabs.main')} panel={<MainEditor program={value} />} />
        <Tab
          id="slides"
          title={<>
            {t('tabs.slides')}
            <MissingDanceInstructionsCounterTag />
          </>}
          panel={<SlideshowEditor program={value} />} />
      </Tabs>
    </EventMetadataContext>
  </Form>
}

function MainEditor({ program }: {program: EventProgramSettings }) {
  const t = useT('components.eventProgramEditor')
  const {danceSets, introductions} = program

  return <section>
    <div className="flex flex-wrap items-start justify-between gap-2">
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
        renderConflictItem={item => renderDanceSetValue(item, t)} />
    </ListEditorContext>
    <div className="my-3.5">
      {danceSets.length === 0 && t('danceProgramIsEmpty')}
      <AddDanceSetButton />
    </div>
    <DanceCategoryStats />
  </section>
}

function renderDanceSetValue(item: DanceSet, t: T) {
  const program = item.program.map(i => programItemToString(i, t)).join(', ')
  return `${item.title} (${program})`
}
