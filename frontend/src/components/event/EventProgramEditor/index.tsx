import React, {useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {Event} from 'types'

import {ActionButton as Button, DragHandle, ListEditorContext, SyncStatus} from 'libraries/forms'
import {Card, ColorClass, HTMLTable, Tab, Tabs} from 'libraries/ui'
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
import { EventMetadataContext, useWorkshops } from 'components/event/EventProgramForm/eventMetadata'
import { ProgramTypeIcon } from 'components/event/ProgramTypeIcon'
import {BackLink} from 'components/widgets/BackLink'
import { ColoredTag } from 'components/widgets/ColoredTag'
import {Duration} from 'components/widgets/Duration'
import {DurationField} from 'components/widgets/DurationField'
import {useT, useTranslation} from 'i18n'
import {guid} from 'utils/guid'

import {
  AddDanceSetButton,
  AddIntroductionButton,
  DuplicateDancesWarning,
  IntervalMusicSwitch,
  MissingDancesWarning,
  useCreateNewEventProgramItem,
} from './components'
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
  const changeTab = (nextTabId: string) =>
    navigate(tabId ? `../${nextTabId}` : nextTabId)

  return <Form {...formProps} className="eventProgramEditor">
    <BackLink to="..">{useTranslation('pages.events.eventProgramPage.backToEvent')}</BackLink>
    <h1>
      {useTranslation('pages.events.eventProgramPage.pageTitle')}
      <SyncStatus style={{marginLeft: '1ch', top: '3px'}} className="grow" state={state} />
    </h1>

    <EventMetadataContext program={value} workshops={event.workshops}>
      <Tabs id="programEditorTabs" renderActiveTabPanelOnly selectedTabId={tabId ?? 'main'} onChange={changeTab}>
        <Tab id="main" title="Tanssiohjelma" panel={<MainEditor program={value} workshops={event.workshops} />} />
        <Tab id="slides" title="Diashow" panel={<SlideshowEditor program={value} />} />
      </Tabs>
    </EventMetadataContext>
  </Form>
}

function MainEditor({ program, workshops }: {program: EventProgramSettings, workshops: Event['workshops']}) {
  const t = useT('components.eventProgramEditor')
  const {danceSets, introductions} = program

  return <section>
    <div className="main-toolbar">
      <Field label={t('fields.pauseDuration')} inline path="pauseBetweenDances" component={DurationField} />
      {introductions.program.length === 0 && <AddIntroductionButton />}
    </div>
    <MissingDancesWarning program={program} workshops={workshops} />
    <DuplicateDancesWarning program={program} />
    <ListEditorContext>
      <IntroductoryInformation />
      <ListField labelStyle="hidden" label="" path="danceSets" component={DanceSetEditor} renderConflictItem={item => renderDanceSetValue(item, t)} />
    </ListEditorContext>
    <div className="addDanceSetButtons">
      {danceSets.length === 0 && t('danceProgramIsEmpty')}
      <AddDanceSetButton />
    </div>
  </section>
}

function IntroductoryInformation() {
  const t = useT('components.eventProgramEditor')
  const infos = useValueAt('introductions.program')
  if (infos.length === 0) return null

  return <Card className="danceset">
    <div className="flex sectionTitleRow">
      <h2>
        <span>{t('titles.introductoryInformation')}</span>
      </h2>
    </div>
    <ProgramListEditor path="introductions" />
  </Card>
}

const DanceSetEditor = React.memo(function DanceSetEditor({itemIndex, dragHandle} : {itemIndex: number, dragHandle: DragHandle}) {
  const id = useValueAt(`danceSets.${itemIndex}._id`)

  return <Card className="danceset" id={id}>
    <div className="flex sectionTitleRow">
      <h2>
        <DanceSetNameEditor itemIndex={itemIndex} />
      </h2>
      {dragHandle}
      <RemoveItemButton path="danceSets" index={itemIndex} className="delete" text={useTranslation('components.eventProgramEditor.buttons.removeDanceSet')} />
    </div>
    <ProgramListEditor path={`danceSets.${itemIndex}`} />
  </Card>
})

function DanceSetNameEditor({ itemIndex } : { itemIndex: number }) {
  const label = useTranslation('components.eventProgramEditor.fields.danceSetName')
  const name = useValueAt(`danceSets.${itemIndex}.title`)

  const [editingName, setEditingName] = useState(false)
  const buttonTitle = useTranslation(editingName ? 'common.closeEditor' : 'components.eventProgramEditor.buttons.editDanceSetName')

  return <>
    {editingName
      ? <Input labelStyle="hidden" label={label} path={`danceSets.${itemIndex}.title`} inline />
      : name
    }
    <Button
      color="primary"
      minimal
      icon={editingName ? 'cross' : 'edit' }
      title={buttonTitle}
      aria-label={buttonTitle}
      onClick={() => setEditingName(!editingName)}
    />
  </>
}

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
      <tbody>
        <ListField labelStyle="hidden-nowrapper" label="" itemType={getType} acceptsTypes={accepts} droppableElement={tableRef.current} isTable path={programPath} component={ProgramItemEditor} renderConflictItem={item => programItemToString(item, t)} accessibilityContainer={accessibilityContainer.current ?? undefined} />
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

  return <React.Fragment>
    <td>
      <ProgramTypeIcon type={__typename} />
    </td>
    <td>
      <div className="flex eventProgramItemEditor">
        <ProgramDetailsEditor path={itemPath} />
      </div>
    </td>
    <td className="add-spacing">
      <Duration value={__typename !== 'RequestedDance' ? item.item.duration : 0} />
    </td>
    <td>
      {dragHandle}
      <RemoveItemButton path={path} index={itemIndex} title={t('buttons.remove')} icon="cross" className="deleteItem" />
    </td>
  </React.Fragment>
})


function renderDanceSetValue(item: DanceSet, t: T) {
  const program = item.program.map(i => programItemToString(i, t)).join(', ')
  return `${item.title} (${program})`
}

function ProgramDetailsEditor({path}: {path: ProgramItemPath}) {
  const __typename = useValueAt(`${path}.item.__typename`)
  //If something is deleted useValueAt may return undefined
  if (__typename === undefined) return null

  switch(__typename) {
    case 'Dance':
    case 'RequestedDance':
      return <DanceItemEditor path={path as DanceProgramPath} />
    case 'EventProgram':
      return <EventProgramItemEditor path={path} />
  }
}

function DanceItemEditor({path}: {path: DanceProgramPath}) {
  const t = useT('components.eventProgramEditor')
  const item = useValueAt(`${path}.item`)
  return <div className="flex eventProgramItemEditor">
    <Field label={t('dance')} labelStyle="hidden" path={`${path as DanceProgramPath}.item`} component={DanceProgramChooser} />
    {item.__typename === 'Dance' && item.teachedIn?.map(workshop =>
      <ColoredTag key={workshop._id} title={workshop.workshop.name} />
    )}
  </div>
}

function EventProgramItemEditor({path}: {path: ProgramItemPath}) {
  const t = useT('components.eventProgramEditor')
  return <div className="flex eventProgramItemEditor">
    <Input label={t('fields.eventProgram.name')} labelStyle="hidden" path={`${path}.item.name`} required />
  </div>
}

function IntervalMusicEditor({danceSetPath}: {danceSetPath: DanceSetPath}) {
  const t = useT('components.eventProgramEditor')
  const intervalMusicPath = `${danceSetPath}.intervalMusic` as const
  const durationPath = `${danceSetPath}.intervalMusic.duration` as const
  const onSetIntervalMusic = useOnChangeFor(intervalMusicPath)

  return <tr className="intervalMusicDuration">
    <td><ProgramTypeIcon type="IntervalMusic" /></td>
    <td>{t('programTypes.IntervalMusic')}</td>
    <td>
      <Field label={t('fields.intervalMusicDuration')} inline labelStyle="hidden" path={durationPath} component={DurationField} />
    </td>
    <td>
      <Button title={t('buttons.remove')} color="danger" icon="cross" onClick={() => onSetIntervalMusic(null)} className="delete" />
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
