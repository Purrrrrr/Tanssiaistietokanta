import { ListEditorContext } from 'libraries/forms'
import { H2 } from 'libraries/ui'
import {
  DanceSet,
  Field,
  ListField,
  T,
  useValueAt,
} from 'components/event/EventProgramForm'
import { DurationField } from 'components/widgets/DurationField'
import { useT, useTranslation } from 'i18n'

import { getProgramName } from '../utils'
import {
  AddDanceSetButton,
  AddIntroductionButton,
  DuplicateDancesWarning,
  MissingDancesWarning,
} from './components'
import { DanceSetEditor, IntroductoryInformation } from './components/setEditors'
import { DanceCategoryStats } from './components/stats'

import './EventProgramEditor.sass'

export function MainEditor() {
  const program = useValueAt('')
  const t = useT('components.eventProgramEditor')
  const { danceSets, introductions } = program

  return <section>
    <H2>{useTranslation('pages.events.eventProgramPage.pageTitle')}</H2>
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
