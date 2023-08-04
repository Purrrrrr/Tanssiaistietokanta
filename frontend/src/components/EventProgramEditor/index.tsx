import React, {useMemo, useRef, useState} from 'react'

import { useDance } from 'services/dances'
import {usePatchEventProgram} from 'services/events'

import {ActionButton as Button, ClickToEdit, MarkdownEditor, MenuButton, SyncStatus, useAutosavingState} from 'libraries/forms'
import {Card, CssClass, Flex, HTMLTable} from 'libraries/ui'
import {DanceEditor} from 'components/DanceEditor'
import {LoadingState} from 'components/LoadingState'
import {Duration} from 'components/widgets/Duration'
import {DurationField} from 'components/widgets/DurationField'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {guid} from 'utils/guid'

import {DanceProgramPath, DanceSet, DanceSetPath, EventProgramRow, EventProgramSettings, IntervalMusicPath, ProgramItemPath, ProgramSectionPath} from './types'

import {AddDanceSetButton, AddIntroductionButton, IntervalMusicDefaultTextsSwitch, IntervalMusicSwitch, newEventProgramItem, ProgramTypeIcon} from './controls'
import {
  Field,
  Form,
  Input,
  ListField,
  RemoveItemButton,
  Switch,
  useAppendToList,
  useOnChangeFor,
  useValueAt,
} from './form'
import {JSONPatch, patch} from './patchStrategy'
import {DanceProgramChooser, InheritedSlideStyleSelector, MoveItemToSectionSelector} from './selectors'
import t from './translations'

import './EventProgramEditor.sass'

interface EventProgramEditorProps {
  eventId: string
  program: EventProgramSettings
}

export function EventProgramEditor({eventId, program: eventProgram}: EventProgramEditorProps) {
  const [patchEventProgram] = usePatchEventProgram()
  const saveProgram = (program) => patchEventProgram({id: eventId, program})

  const {formProps, state} = useAutosavingState<EventProgramSettings, JSONPatch>(eventProgram, saveProgram, patch)
  const {danceSets, introductions} = formProps.value

  return <Form {...formProps}>
    <section className="eventProgramEditor">
      <div className="main-toolbar">
        <Input labelStyle="above" label={t`fields.programTitle`} path="introductions.title" inline />
        <SyncStatus style={{marginLeft: '1ch', top: '3px'}} className="flex-fill" state={state} />
        <InheritedSlideStyleSelector path="introductions.titleSlideStyleId" text={t`fields.titleStyle`} />
        <Field label={t`fields.pauseDuration`} inline path="pauseBetweenDances" component={DurationField} />
        {introductions.program.length === 0 && <AddIntroductionButton />}
        <Field label="" inline path="slideStyleId" component={SlideStyleSelector} componentProps={{text: t`fields.eventDefaultStyle`}} />
      </div>
      <IntroductoryInformation />
      <ListField labelStyle="hidden-nowrapper" label="" path="danceSets" component={DanceSetEditor} renderConflictItem={renderDanceSetValue} />
      <div className="addDanceSetButtons">
        {danceSets.length === 0 && t`danceProgramIsEmpty`}
        <AddDanceSetButton />
      </div>
    </section>
  </Form>
}

function IntroductoryInformation() {
  const infos = useValueAt('introductions.program')
  if (infos.length === 0) return null

  return <Card className="danceset">
    <Flex className="sectionTitleRow">
      <h2>
        <t.span>titles.introductoryInformation</t.span>
      </h2>
    </Flex>
    <ProgramListEditor path="introductions" />
  </Card>
}

const DanceSetEditor = React.memo(function DanceSetEditor({itemIndex, dragHandle} : {itemIndex: number, dragHandle: React.ReactNode}) {
  return <Card className="danceset">
    <Flex className="sectionTitleRow">
      <h2>
        <Field labelStyle="hidden" label={t`fields.danceSetName`} path={`danceSets.${itemIndex}.title`} inline component={ClickToEdit} />
      </h2>
      <InheritedSlideStyleSelector path={`danceSets.${itemIndex}.titleSlideStyleId`} text={t`fields.titleStyle`} />
      {dragHandle}
      <RemoveItemButton path="danceSets" index={itemIndex} className="delete" text={t`buttons.removeDanceSet`} />
    </Flex>
    <ProgramListEditor path={`danceSets.${itemIndex}`} />
  </Card>
})

function ProgramListEditor({path}: {path: ProgramSectionPath}) {
  const tableRef = useRef(null)
  const programPath = `${path}.program` as const
  const onAddItem = useAppendToList(programPath)
  const accessibilityContainer = useRef<HTMLDivElement>(null)
  const programRow = useValueAt(path)
  const accepts = useMemo(() => ['eventProgram'], [])
  if (!programRow) return null
  const { program } = programRow
  const isIntroductionsSection = path.startsWith('introductions')
  const intervalMusicDuration = isIntroductionsSection
    ? 0
    : (programRow as DanceSet).intervalMusic?.duration ?? 0

  return <>
    <div ref={accessibilityContainer} />
    <HTMLTable elementRef={tableRef} condensed bordered className="programList">
      {program.length === 0 ||
          <thead>
            <tr>
              <th/>
              <t.th>columnTitles.name</t.th><t.th>columnTitles.duration</t.th><t.th>columnTitles.actions</t.th>
            </tr>
          </thead>
      }
      <tbody>
        <ListField labelStyle="hidden-nowrapper" label="" itemType="eventProgram" acceptsTypes={accepts} droppableElement={tableRef.current} isTable path={programPath} component={ProgramItemEditor} renderConflictItem={programItemToString} accessibilityContainer={accessibilityContainer.current ?? undefined} />
        {program.length === 0 &&
            <tr>
              <t.td className={CssClass.textMuted+ ' noProgram'} colSpan="5">programListIsEmpty</t.td>
            </tr>
        }
        {intervalMusicDuration > 0 && <IntervalMusicEditor danceSetPath={path as DanceSetPath} />}
      </tbody>
      <tfoot>
        <tr className="eventProgramFooter">
          <td colSpan={2} className="add-spacing">
            {isIntroductionsSection ||
              <Button
                text={t`buttons.addDance`}
                rightIcon={<ProgramTypeIcon type="Dance" />}
                onClick={() => onAddItem({item: {__typename: 'RequestedDance'}, slideStyleId: null, _id: guid()})}
                className="addDance" />
            }
            {isIntroductionsSection
              ? <AddIntroductionButton />
              : <Button
                text={t`buttons.addInfo`}
                rightIcon={<ProgramTypeIcon type="EventProgram" />}
                onClick={() => onAddItem(newEventProgramItem())}
                className="addInfo"
              />
            }
            {isIntroductionsSection ||
              <IntervalMusicSwitch inline label={t`fields.intervalMusicAtEndOfSet`} path={`${path}.intervalMusic` as `danceSets.${number}.intervalMusic`} />
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
  dragHandle: React.ReactNode
  path: `${ProgramSectionPath}.program`
  itemIndex: number
}

const ProgramItemEditor = React.memo(function ProgramItemEditor({dragHandle, path, itemIndex} : ProgramItemEditorProps) {
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
      <InheritedSlideStyleSelector path={`${itemPath}.slideStyleId`} text={t`fields.style`} />
      <MoveItemToSectionSelector itemPath={itemPath} />
      <RemoveItemButton path={path} index={itemIndex} title={t`buttons.remove`} icon="cross" className="deleteItem" />
    </td>
  </React.Fragment>
})


function renderDanceSetValue(item: DanceSet) {
  const program = item.program.map(programItemToString).join(', ')
  return `${item.title} (${program})`
}

function programItemToString(item: EventProgramRow) {
  if (item.item.__typename === 'RequestedDance') return t`programTypes.RequestedDance`
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
  const id = useValueAt(`${path}.item._id`)
  const setItem = useOnChangeFor(`${path}.item`)
  const [open, setOpen] = useState(false)
  return <Flex className="eventProgramItemEditor">
    <Field label={t`Dance`} labelStyle="hidden" path={`${path as DanceProgramPath}.item`} component={DanceProgramChooser} />
    {id &&
      <MenuButton
        menu={
          <div className="danceEditorPopover">
            <DanceLoadingEditor danceId={id} onDeleteDance={() => {setItem({__typename: 'RequestedDance'}); setOpen(false)}} />
          </div>
        }
        text={t`buttons.editDance`}
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
  const [open, setOpen] = useState(false)
  return <Flex className="eventProgramItemEditor">
    <Input label={t`fields.eventProgram.name`} labelStyle="hidden" path={`${path}.item.name`} required />
    <MenuButton
      menu={
        <div className="eventProgramItemPopover">
          <Field label={t`fields.eventProgram.description`} path={`${path}.item.description`} component={MarkdownEditor} />
          <Switch label={t`fields.eventProgram.showInLists`} path={`${path}.item.showInLists`} inline />
        </div>
      }
      text={t`buttons.editProgram`}
      buttonProps={{rightIcon: 'caret-down'}}
      open={open}
      onSetOpen={setOpen}
    />
  </Flex>
}

function IntervalMusicEditor({danceSetPath}: {danceSetPath: DanceSetPath}) {
  const intervalMusicPath = `${danceSetPath}.intervalMusic` as const
  const durationPath = `${danceSetPath}.intervalMusic.duration` as const
  const onSetIntervalMusic = useOnChangeFor(intervalMusicPath)

  return <tr className="eventProgramItemEditor intervalMusicDuration">
    <td><ProgramTypeIcon type="IntervalMusic" /></td>
    <td>
      <Flex className="eventProgramItemEditor">
        <div>{t`programTypes.IntervalMusic`}</div>
        <IntervalMusicDetailsEditor path={intervalMusicPath} />
      </Flex>
    </td>
    <td>
      <Field label={t`fields.intervalMusicDuration`} inline labelStyle="hidden" path={durationPath} component={DurationField} />
    </td>
    <td>
      <InheritedSlideStyleSelector path={`${danceSetPath}.intervalMusic.slideStyleId`} text={t`fields.style`} />
      <Button title={t`buttons.remove`} intent="danger" icon="cross" onClick={() => onSetIntervalMusic(null)} className="delete" />
    </td>
  </tr>
}

function IntervalMusicDetailsEditor({path}: {path: IntervalMusicPath}) {
  const [open, setOpen] = useState(false)
  const intervalMusic = useValueAt(path)
  const hasCustomTexts = typeof intervalMusic?.name === 'string'
  return <Flex className="eventProgramItemEditor">
    <MenuButton
      menu={
        <div className="eventProgramItemPopover">
          <IntervalMusicDefaultTextsSwitch label={t`fields.intervalMusic.useDefaultTexts`} path={path} />
          {hasCustomTexts
            ? <>
              <t.h2>titles.customIntervalMusicTexts</t.h2>
              <Input label={t`fields.intervalMusic.name`} path={`${path}.name`} required />
              <Field label={t`fields.intervalMusic.description`} path={`${path}.description`} component={MarkdownEditor} />
            </>
            : <>
              <t.h2>titles.defaultIntervalMusicTexts</t.h2>
              <Input label={t`fields.intervalMusic.name`} path='defaultIntervalMusic.name' componentProps={{placeholder:t`programTypes.IntervalMusic`}} />
              <Field label={t`fields.intervalMusic.description`} path="defaultIntervalMusic.description" component={MarkdownEditor} />
            </>
          }
        </div>
      }
      text={t`buttons.editIntervalMusic`}
      buttonProps={{rightIcon: 'caret-down'}}
      open={open}
      onSetOpen={setOpen}
    />
  </Flex>
}

function DanceSetDuration({ program, intervalMusicDuration}) {
  const pause = useValueAt('pauseBetweenDances')
  const duration = program.map(({item}) => item.duration ?? 0).reduce((y, x) => x+y, 0)
  const durationWithPauses = duration + pause*program.length + intervalMusicDuration

  return <>
    <strong><Duration value={durationWithPauses}/></strong>{' '+t`duration.pausesIncluded`}
    <br />
    <strong><Duration value={duration}/></strong>{' '+t`duration.dances`}
  </>
}
