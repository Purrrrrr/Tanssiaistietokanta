import React, {useCallback, useMemo, useRef, useState} from 'react'

import { useDance } from 'services/dances'

import {ActionButton as Button, ClickToEdit, DragHandle, ListEditorContext, MarkdownEditor, MenuButton, SyncStatus} from 'libraries/forms'
import {Card, CssClass, Flex, HTMLTable, Tab, Tabs} from 'libraries/ui'
import {DanceEditor} from 'components/DanceEditor'
import {LoadingState} from 'components/LoadingState'
import {BackLink} from 'components/widgets/BackLink'
import {Duration} from 'components/widgets/Duration'
import {DurationField} from 'components/widgets/DurationField'
// import {NavigateButton} from 'components/widgets/NavigateButton'
import {Translator, useT, useTranslation} from 'i18n'
import {guid} from 'utils/guid'

import {DanceProgramPath, DanceSet, DanceSetPath, EventProgramRow, EventProgramSettings, IntervalMusicPath, ProgramItemPath, ProgramSectionPath} from './types'

import {
  AddDanceSetButton,
  AddIntroductionButton,
  DanceProgramChooser,
  Field,
  Form,
  Input,
  IntervalMusicDefaultTextsSwitch,
  IntervalMusicSwitch,
  ListField,
  ProgramTypeIcon,
  RemoveItemButton,
  Switch,
  useAppendToList,
  useCreateNewEventProgramItem,
  useEventProgramEditorForm,
  useOnChangeFor,
  useValueAt,
} from './components'
import { SlideshowEditor} from './SlideshowEditor'

import './EventProgramEditor.sass'
import '../Slide/slideStyles.scss'

type T = Translator<'components.eventProgramEditor'>

interface EventProgramEditorProps {
  eventId: string
  eventVersionId?: string
  program: EventProgramSettings
}

export function EventProgramEditor({eventId, eventVersionId, program: eventProgram}: EventProgramEditorProps) {
  const {formProps, state} = useEventProgramEditorForm(eventId, eventVersionId, eventProgram)

  return <Form {...formProps}>
    <BackLink to="..">{useTranslation('pages.events.eventProgramPage.backToEvent')}</BackLink>
    <h1>
      {useTranslation('pages.events.eventProgramPage.pageTitle')}
      <SyncStatus style={{marginLeft: '1ch', top: '3px'}} className="flex-fill" state={state} />
    </h1>
    <Tabs renderActiveTabPanelOnly>
      <Tab id="main" title="Tanssiohjelma" panel={<MainEditor value={formProps.value} />} />
      <Tab id="slideshow" title="Diashow" panel={<SlideshowEditor value={formProps.value} />} />
    </Tabs>
  </Form>
}

function MainEditor({ value }: {value: EventProgramSettings}) {
  const t = useT('components.eventProgramEditor')
  const {danceSets, introductions} = value

  return <section className="eventProgramEditor">
    <div className="main-toolbar">
      <Field label={t('fields.pauseDuration')} inline path="pauseBetweenDances" component={DurationField} />
      {introductions.program.length === 0 && <AddIntroductionButton />}
    </div>
    <ListEditorContext>
      <IntroductoryInformation />
      <ListField labelStyle="hidden-nowrapper" label="" path="danceSets" component={DanceSetEditor} renderConflictItem={item => renderDanceSetValue(item, t)} />
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
    <Flex className="sectionTitleRow">
      <h2>
        <span>{t('titles.introductoryInformation')}</span>
      </h2>
    </Flex>
    <ProgramListEditor path="introductions" />
  </Card>
}

const DanceSetEditor = React.memo(function DanceSetEditor({itemIndex, dragHandle} : {itemIndex: number, dragHandle: DragHandle}) {
  const t = useT('components.eventProgramEditor')
  return <Card className="danceset">
    <Flex className="sectionTitleRow">
      <h2>
        <Field labelStyle="hidden" label={t('fields.danceSetName')} path={`danceSets.${itemIndex}.title`} inline component={ClickToEdit} />
      </h2>
      {dragHandle}
      <RemoveItemButton path="danceSets" index={itemIndex} className="delete" text={t('buttons.removeDanceSet')} />
    </Flex>
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
              <th>{t('columnTitles.name')}</th><th>{t('columnTitles.duration')}</th><th>{t('columnTitles.actions')}</th>
            </tr>
          </thead>
      }
      <tbody>
        <ListField labelStyle="hidden-nowrapper" label="" itemType={getType} acceptsTypes={accepts} droppableElement={tableRef.current} isTable path={programPath} component={ProgramItemEditor} renderConflictItem={item => programItemToString(item, t)} accessibilityContainer={accessibilityContainer.current ?? undefined} />
        {program.length === 0 &&
            <tr>
              <td className={CssClass.textMuted+ ' noProgram'} colSpan={5}>{t('programListIsEmpty')}</td>
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
      <Flex className="eventProgramItemEditor">
        <ProgramDetailsEditor path={itemPath} />
      </Flex>
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

export function programItemToString(item: EventProgramRow, t: T) {
  if (item.item.__typename === 'RequestedDance') return t('programTypes.RequestedDance')
  return item.item.name
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
  const id = useValueAt(`${path}.item._id`)
  const setItem = useOnChangeFor(`${path}.item`)
  const [open, setOpen] = useState(false)
  return <Flex className="eventProgramItemEditor">
    <Field label={t('dance')} labelStyle="hidden" path={`${path as DanceProgramPath}.item`} component={DanceProgramChooser} />
    {/* id &&
      <NavigateButton
        href={id}
        text={<Icon icon="edit" title={t('buttons.editDance')} />}
      />
    */}
    {id &&
      <MenuButton
        menu={
          <div className="danceEditorPopover">
            <DanceLoadingEditor danceId={id} onDeleteDance={() => {setItem({__typename: 'RequestedDance'}); setOpen(false)}} />
          </div>
        }
        text={t('buttons.editDance')}
        buttonProps={{rightIcon: 'caret-down'}}
        open={open}
        onSetOpen={setOpen}
      />
    }
  </Flex>
}

function DanceLoadingEditor({danceId, onDeleteDance}: {danceId: string, onDeleteDance: () => unknown}) {
  const result = useDance({id: danceId})
  if (!result.data?.dance) return <LoadingState {...result} />

  const {dance} = result.data
  return <DanceEditor dance={dance} onDelete={onDeleteDance} showLink />
}

function EventProgramItemEditor({path}: {path: ProgramItemPath}) {
  const t = useT('components.eventProgramEditor')
  const [open, setOpen] = useState(false)
  return <Flex className="eventProgramItemEditor">
    <Input label={t('fields.eventProgram.name')} labelStyle="hidden" path={`${path}.item.name`} required />
    <MenuButton
      menu={
        <div className="eventProgramItemPopover">
          <Field label={t('fields.eventProgram.description')} path={`${path}.item.description`} component={MarkdownEditor} />
          <Switch label={t('fields.eventProgram.showInLists')} path={`${path}.item.showInLists`} inline />
        </div>
      }
      text={t('buttons.editProgram')}
      buttonProps={{rightIcon: 'caret-down'}}
      open={open}
      onSetOpen={setOpen}
    />
  </Flex>
}

function IntervalMusicEditor({danceSetPath}: {danceSetPath: DanceSetPath}) {
  const t = useT('components.eventProgramEditor')
  const intervalMusicPath = `${danceSetPath}.intervalMusic` as const
  const durationPath = `${danceSetPath}.intervalMusic.duration` as const
  const onSetIntervalMusic = useOnChangeFor(intervalMusicPath)

  return <tr className="intervalMusicDuration">
    <td><ProgramTypeIcon type="IntervalMusic" /></td>
    <td>
      <IntervalMusicDetailsEditor path={intervalMusicPath} />
    </td>
    <td>
      <Field label={t('fields.intervalMusicDuration')} inline labelStyle="hidden" path={durationPath} component={DurationField} />
    </td>
    <td>
      <Button title={t('buttons.remove')} intent="danger" icon="cross" onClick={() => onSetIntervalMusic(null)} className="delete" />
    </td>
  </tr>
}

function IntervalMusicDetailsEditor({path}: {path: IntervalMusicPath}) {
  const t = useT('components.eventProgramEditor')
  const [open, setOpen] = useState(false)
  return <Flex className="eventProgramItemEditor">
    <div>{t('programTypes.IntervalMusic')}</div>
    <MenuButton
      menu={
        <div className="eventProgramItemPopover">
          <IntervalMusicDescriptionEditor path={path} />
        </div>
      }
      text={t('buttons.editIntervalMusic')}
      buttonProps={{rightIcon: 'caret-down'}}
      open={open}
      onSetOpen={setOpen}
    />
  </Flex>
}

export function IntervalMusicDescriptionEditor({path, noPreview}: {path: IntervalMusicPath, noPreview?: boolean}) {
  const t = useT('components.eventProgramEditor')
  const intervalMusic = useValueAt(path)
  const hasCustomTexts = typeof intervalMusic?.name === 'string'
  return <>
    <IntervalMusicDefaultTextsSwitch label={t('fields.intervalMusic.useDefaultTexts')} path={path} />
    {hasCustomTexts
      ? <>
        <h2>{t('titles.customIntervalMusicTexts')}</h2>
        <Input label={t('fields.intervalMusic.name')} path={`${path}.name`} required />
        <Field label={t('fields.intervalMusic.description')} path={`${path}.description`} component={MarkdownEditor} componentProps={{noPreview}} />
      </>
      : <>
        <h2>{t('titles.defaultIntervalMusicTexts')}</h2>
        <Input label={t('fields.intervalMusic.name')} path='defaultIntervalMusic.name' componentProps={{placeholder:t('programTypes.IntervalMusic')}} />
        <Field label={t('fields.intervalMusic.description')} path="defaultIntervalMusic.description" component={MarkdownEditor} componentProps={{noPreview}} />
      </>
    }
  </>
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
