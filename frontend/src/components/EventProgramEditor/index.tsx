import React, {useRef, useState} from 'react'

import {ActionButton as Button, ClickToEdit, MarkdownEditor, MenuButton, SubmitButton} from 'libraries/forms'
import {Card, CssClass, HTMLTable, Icon, IconName} from 'libraries/ui'
import {Flex} from 'components/Flex'
import {Duration} from 'components/widgets/Duration'
import {DurationField} from 'components/widgets/DurationField'
import {NavigateButton} from 'components/widgets/NavigateButton'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {guid} from 'utils/guid'

import {DanceProgramPath, DanceSet, DanceSetPath, EventProgramItem, EventProgramSettings, ProgramItemPath, ProgramSectionPath} from './types'

import {AddDanceSetButton, AddIntroductionButton, IntervalMusicSwitch, newEventProgramItem} from './controls'
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
import {DanceProgramChooser, InheritedSlideStyleSelector, MoveItemToSectionSelector} from './selectors'
import t from './translations'

import './EventProgramEditor.sass'

interface EventProgramEditorProps {
  program: EventProgramSettings
  onSubmit: (p: EventProgramSettings) => unknown
}

export function EventProgramEditor({program: eventProgram, onSubmit}: EventProgramEditorProps) {
  const [program, onChange] = useState(eventProgram)
  const {danceSets, introductions} = program

  return <Form value={program} onChange={onChange} onSubmit={onSubmit}>
    <section className="eventProgramEditor">
      <div className="main-toolbar">
        <Input labelStyle="above" label={t`fields.programTitle`} path="introductions.title" inline />
        <InheritedSlideStyleSelector path="introductions.titleSlideStyleId" text={t`fields.titleStyle`} />
        <Field label={t`fields.pauseDuration`} inline path="pauseBetweenDances" component={DurationField} />
        {introductions.program.length === 0 && <AddIntroductionButton />}
        <Field label="" inline path="slideStyleId" component={SlideStyleSelector} componentProps={{text: t`fields.eventDefaultStyle`}} />
      </div>
      <IntroductoryInformation />
      <ListField labelStyle="hidden-nowrapper" label="" path="danceSets" component={DanceSetEditor} />
      <div className="addDanceSetButtons">
        {danceSets.length === 0 && t`danceProgramIsEmpty`}
        <AddDanceSetButton />
      </div>
    </section>
    <hr />
    <SubmitButton text={t`buttons.save`} />
    <NavigateButton href='..' text={t`buttons.cancel`} />
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
  const programRow = useValueAt(path)
  const { program } = programRow
  const isIntroductionsSection = path.startsWith('introductions')
  const intervalMusicDuration = isIntroductionsSection
    ? 0
    : (programRow as DanceSet).intervalMusicDuration
  const programPath = `${path}.program` as const
  const onAddItem = useAppendToList(programPath)
  const accessibilityContainer = useRef<HTMLDivElement>(null)

  return <>
    <div ref={accessibilityContainer} />
    <HTMLTable condensed bordered className="programList">
      {program.length === 0 ||
          <thead>
            <tr>
              <th/>
              <t.th>columnTitles.name</t.th><t.th>columnTitles.duration</t.th><t.th>columnTitles.actions</t.th>
            </tr>
          </thead>
      }
      <tbody>
        <ListField labelStyle="hidden-nowrapper" label="" isTable path={programPath} component={ProgramItemEditor} accessibilityContainer={accessibilityContainer.current ?? undefined} />
        {program.length === 0 &&
            <tr>
              <t.td className={CssClass.textMuted+ ' noProgram'} colSpan="5">programListIsEmpty</t.td>
            </tr>
        }
        {intervalMusicDuration > 0 && <IntervalMusicEditor danceSetPath={path as DanceSetPath} />}
      </tbody>
      <tfoot>
        <tr className="eventProgramFooter">
          <td colSpan={2}>
            {isIntroductionsSection ||
              <Button text={t`buttons.addDance`} onClick={() => onAddItem({item: {__typename: 'RequestedDance'}, _id: guid()})} className="addDance" />
            }
            {isIntroductionsSection
              ? <AddIntroductionButton />
              : <Button text={t`buttons.addInfo`} onClick={() => onAddItem(newEventProgramItem())} className="addInfo" />
            }
            {isIntroductionsSection ||
              <IntervalMusicSwitch inline label={t`fields.intervalMusicAtEndOfSet`} path={`${path}.intervalMusicDuration` as `danceSets.${number}.intervalMusicDuration`} />
            }
          </td>
          <td colSpan={2}>
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
    <td>
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

type ProgramType = EventProgramItem['__typename'] | 'IntervalMusic'

function ProgramTypeIcon({type}: {type: ProgramType}) {
  const icons: Record<ProgramType, IconName> = {
    Dance: 'music',
    RequestedDance: 'music',
    EventProgram: 'info-sign',
    IntervalMusic: 'time',
  }

  return <Icon className={`programType programType-${type}`} icon={icons[type]} title={t(`programTypes.${type}`)} />
}

function ProgramDetailsEditor({path}: {path: ProgramItemPath}) {
  const __typename = useValueAt(`${path}.item.__typename`)
  //If something is deleted useValueAt may return undefined
  if (__typename === undefined) return null

  switch(__typename) {
    case 'Dance':
    case 'RequestedDance':
      return <Field label={t`Dance`} labelStyle="hidden" path={`${path as DanceProgramPath}.item`} component={DanceProgramChooser} />
    case 'EventProgram':
      return <EventProgramItemEditor path={path} />
  }
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
  const durationPath = `${danceSetPath}.intervalMusicDuration` as const
  const onSetIntervalMusicDuration = useOnChangeFor(durationPath)

  return <tr className="eventProgramItemEditor intervalMusicDuration">
    <td><ProgramTypeIcon type="IntervalMusic" /></td>
    <td>{t`programTypes.IntervalMusic`}</td>
    <td>
      <Field label={t`fields.intervalMusicDuration`} inline labelStyle="hidden" path={durationPath} component={DurationField} />
    </td>
    <td>
      <InheritedSlideStyleSelector path={`${danceSetPath}.intervalMusicSlideStyleId`} text={t`fields.style`} />
      <Button title={t`buttons.remove`} intent="danger" icon="cross" onClick={() => onSetIntervalMusicDuration(0)} className="delete" />
    </td>
  </tr>
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
