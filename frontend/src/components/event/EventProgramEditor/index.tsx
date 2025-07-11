import React, {useCallback, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Cross } from '@blueprintjs/icons'

import {Event} from 'types'

import {ActionButton as Button, DragHandle, ListEditorContext, SyncStatus} from 'libraries/forms'
import {Card, ColorClass, H2, HTMLTable, Tab, Tabs} from 'libraries/ui'
import { DanceProgramChooser } from 'components/event/DanceProgramChooser'
import {
  DanceProgramPath,
  DanceSet,
  DanceSetPath,
  EventProgramRow,
  EventProgramSettings,
  Field,
  Form,
  Input,
  ListField,
  ProgramItemPath,
  programItemToString,
  ProgramSectionPath,
  RemoveItemButton,
  T,
  useAppendToList,
  useEventProgramEditorForm,
  useOnChangeFor,
  useValueAt,
} from 'components/event/EventProgramForm'
import { EventMetadataContext } from 'components/event/EventProgramForm/eventMetadata'
import { ProgramTypeIcon } from 'components/event/ProgramTypeIcon'
import {BackLink} from 'components/widgets/BackLink'
import {Duration} from 'components/widgets/Duration'
import {DurationField} from 'components/widgets/DurationField'
import {useT, useTranslation} from 'i18n'
import {guid} from 'utils/guid'

import {
  AddDanceSetButton,
  AddIntroductionButton,
  DuplicateDancesWarning,
  IntervalMusicSwitch,
  MissingDanceInstructionsCounterTag,
  MissingDancesWarning,
  useCreateNewEventProgramItem,
} from './components'
import { DanceSetNameEditor } from './components/DanceSetNameEditor'
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
      <ListField labelStyle="hidden" label="" path="danceSets" component={DanceSetEditor} renderConflictItem={item => renderDanceSetValue(item, t)} />
    </ListEditorContext>
    <div className="my-3.5">
      {danceSets.length === 0 && t('danceProgramIsEmpty')}
      <AddDanceSetButton />
    </div>
    <DanceCategoryStats />
  </section>
}

function IntroductoryInformation() {
  const t = useT('components.eventProgramEditor')
  const infos = useValueAt('introductions.program')
  if (infos.length === 0) return null

  return <Card marginClass="my-4" noPadding className="min-w-fit">
    <H2 className="px-2.5 py-1 bg-gray-50">
      <span>{t('titles.introductoryInformation')}</span>
    </H2>
    <ProgramListEditor path="introductions" />
  </Card>
}

const DanceSetEditor = React.memo(function DanceSetEditor({itemIndex, dragHandle} : {itemIndex: number, dragHandle: DragHandle}) {
  const id = useValueAt(`danceSets.${itemIndex}._id`)

  return <Card marginClass="my-4" noPadding className="min-w-fit" id={id}>
    <div className="flex flex-wrap justify-end px-2.5 py-1 bg-gray-50">
      <H2 className="grow">
        <DanceSetNameEditor itemIndex={itemIndex} />
      </H2>
      {dragHandle}
      <RemoveItemButton path="danceSets" index={itemIndex} className="delete" text={useTranslation('components.eventProgramEditor.buttons.removeDanceSet')} />
    </div>
    <ProgramListEditor path={`danceSets.${itemIndex}`} />
  </Card>
})

function ProgramListEditor({path}: {path: ProgramSectionPath}) {
  const t = useT('components.eventProgramEditor')
  const tableRef = useRef(null)
  const programPath = `${path}.program` as const
  const onAddItem = useAppendToList(programPath)
  const accessibilityContainer = useRef<HTMLDivElement>(null)
  const programRow = useValueAt(path)
  const getType = useCallback((item: EventProgramRow) => item.item.__typename, [])
  const isIntroductionsSection = path.startsWith('introductions')
  const accepts = useMemo(() => isIntroductionsSection ? ['EventProgram'] : ['Dance', 'RequestedDance', 'EventProgram'], [isIntroductionsSection])
  const newEventProgramItem = useCreateNewEventProgramItem()
  if (!programRow) return null
  const { program } = programRow
  const intervalMusicDuration = isIntroductionsSection
    ? 0
    : (programRow as DanceSet).intervalMusic?.duration ?? 0

  return <>
    <div ref={accessibilityContainer} />
    <HTMLTable ref={tableRef} compact bordered className="programList">
      {program.length === 0 ||
          <thead>
            <tr>
              <th/>
              <th>{t('columnTitles.name')}</th><th colSpan={2}>{t('columnTitles.duration')}</th>
            </tr>
          </thead>
      }
      <tbody className="*:odd:bg-gray-100/80">
        <ListField
          labelStyle="hidden-nowrapper"
          label=""
          itemType={getType}
          acceptsTypes={accepts}
          droppableElement={tableRef.current}
          isTable
          path={programPath}
          component={ProgramItemEditor}
          renderConflictItem={item => programItemToString(item, t)}
          accessibilityContainer={accessibilityContainer.current
            ??
            undefined}
        />
        {program.length === 0 &&
            <tr>
              <td className={`${ColorClass.textMuted} p-0`} colSpan={5}>{t('programListIsEmpty')}</td>
            </tr>
        }
        {intervalMusicDuration > 0 && <IntervalMusicEditor danceSetPath={path as DanceSetPath} />}
      </tbody>
      <tfoot>
        <tr className="eventProgramFooter">
          <td colSpan={2} className="add-spacing">
            <ProgramItemCounters program={programRow.program} />
            {isIntroductionsSection ||
              <Button
                text={t('buttons.addDance')}
                rightIcon={<ProgramTypeIcon type="Dance" />}
                onClick={() => onAddItem({item: {__typename: 'RequestedDance'}, slideStyleId: null, _id: guid()})}
                className="addDance" />
            }
            {isIntroductionsSection
              ? <AddIntroductionButton />
              : <Button
                text={t('buttons.addInfo')}
                rightIcon={<ProgramTypeIcon type="EventProgram" />}
                onClick={() => onAddItem(newEventProgramItem)}
                className="addInfo"
              />
            }
            {isIntroductionsSection ||
              <IntervalMusicSwitch inline label={t('fields.intervalMusicAtEndOfSet')} path={`${path}.intervalMusic` as `danceSets.${number}.intervalMusic`} />
            }
          </td>
          <td colSpan={2} className="add-spacing">
            <DanceSetDuration program={program} intervalMusicDuration={intervalMusicDuration} />
          </td>
        </tr>
      </tfoot>
    </HTMLTable>
  </>
}

function ProgramItemCounters({program}: {program: EventProgramRow[]}) {
  const t = useT('components.eventProgramEditor')
  const itemsByType = Object.groupBy(
    program,
    row => row.item.__typename,
  )
  const emptyPlaceholder = '-'
  const counts = [
    t('danceCount', { count: itemsByType.Dance?.length ?? 0 }),
    t('requestedDanceCount', { count: itemsByType.RequestedDance?.length ?? 0 }),
    t('otherProgramCount', { count: itemsByType.EventProgram?.length ?? 0 }),
  ].filter(count => count !== emptyPlaceholder).join(', ')

  return counts && <p>{counts}</p>
}

interface ProgramItemEditorProps {
  dragHandle: DragHandle
  path: `${ProgramSectionPath}.program`
  itemIndex: number
}

const ProgramItemEditor = React.memo(function ProgramItemEditor({dragHandle, path, itemIndex} : ProgramItemEditorProps) {
  const t = useT('components.eventProgramEditor')
  const itemPath = `${path}.${itemIndex}` as ProgramItemPath
  const item = useValueAt(itemPath)

  if (!item) return null
  const {__typename } = item.item
  const editableDuration = __typename === 'EventProgram'

  return <React.Fragment>
    <td>
      <ProgramTypeIcon type={__typename} className="size-7" />
    </td>
    <td>
      <div className="flex">
        <ProgramDetailsEditor path={itemPath} />
      </div>
    </td>
    <td className={editableDuration ? '' : 'add-spacing'}>
      {editableDuration
        ? <Field label={t('fields.eventProgram.duration')} inline labelStyle="hidden" path={`${itemPath}.item.duration`} component={DurationField} />
        : <Duration value={__typename !== 'RequestedDance' ? item.item.duration : 0} />
      }
    </td>
    <td>
      {dragHandle}
      <RemoveItemButton path={path} index={itemIndex} title={t('buttons.remove')} icon={<Cross />} className="deleteItem" />
    </td>
  </React.Fragment>
})


function renderDanceSetValue(item: DanceSet, t: T) {
  const program = item.program.map(i => programItemToString(i, t)).join(', ')
  return `${item.title} (${program})`
}

function ProgramDetailsEditor({path}: {path: ProgramItemPath}) {
  const t = useT('components.eventProgramEditor')
  const __typename = useValueAt(`${path}.item.__typename`)
  //If something is deleted useValueAt may return undefined
  if (__typename === undefined) return null

  switch(__typename) {
    case 'Dance':
    case 'RequestedDance':
      return <Field
        label={t('dance')}
        labelStyle="hidden"
        containerClassName="w-full"
        path={`${path as DanceProgramPath}.item`}
        component={DanceProgramChooser}
      />
    case 'EventProgram':
      return <Input
        label={t('fields.eventProgram.name')}
        labelStyle="hidden"
        containerClassName="w-full"
        path={`${path}.item.name`}
        required
      />
  }
}

function IntervalMusicEditor({danceSetPath}: {danceSetPath: DanceSetPath}) {
  const t = useT('components.eventProgramEditor')
  const intervalMusicPath = `${danceSetPath}.intervalMusic` as const
  const durationPath = `${danceSetPath}.intervalMusic.duration` as const
  const onSetIntervalMusic = useOnChangeFor(intervalMusicPath)

  return <tr className="intervalMusicDuration">
    <td><ProgramTypeIcon type="IntervalMusic" className="size-7" /></td>
    <td>
      <div className="flex gap-2">
        {t('programTypes.IntervalMusic')}
        <Field
          label={t('dance')}
          labelStyle="hidden"
          containerClassName="grow"
          path={`${danceSetPath}.intervalMusic.dance`}
          component={DanceProgramChooser}
        />
      </div>
    </td>
    <td>
      <Field label={t('fields.intervalMusicDuration')} inline labelStyle="hidden" path={durationPath} component={DurationField} />
    </td>
    <td>
      <Button title={t('buttons.remove')} color="danger" icon={<Cross />} onClick={() => onSetIntervalMusic(null)} className="delete" />
    </td>
  </tr>
}

function DanceSetDuration({ program, intervalMusicDuration}: { program: EventProgramRow[], intervalMusicDuration: number}) {
  const t = useT('components.eventProgramEditor')
  const pause = useValueAt('pauseBetweenDances')
  const duration = program.map(({item}) => item.duration ?? 0).reduce((y, x) => x+y, 0)
  const durationWithPauses = duration + pause*program.length + intervalMusicDuration

  return <>
    <strong><Duration value={durationWithPauses}/></strong>{' '+t('duration.pausesIncluded')}
    <br />
    <strong><Duration value={duration}/></strong>{' '+t('duration.dances')}
  </>
}
