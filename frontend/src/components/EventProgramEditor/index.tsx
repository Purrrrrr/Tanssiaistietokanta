import React, {useState} from 'react'

import {ActionButton as Button, ClickToEdit, formFor, MarkdownEditor, SubmitButton} from 'libraries/forms'
import {Card, CssClass, HTMLTable} from 'libraries/ui'
import {Flex} from 'components/Flex'
import {Duration} from 'components/widgets/Duration'
import {DurationField} from 'components/widgets/DurationField'
import {NavigateButton} from 'components/widgets/NavigateButton'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {guid} from 'utils/guid'

import {DanceProgramPath, DanceSet, DanceSetPath, EventProgramRow, EventProgramSettings, ProgramItemPath, ProgramSectionPath} from './types'

import {DanceProgramChooser, InheritedSlideStyleSelector, MoveDanceSetSelector, MoveItemToSectionSelector} from './selectors'
import t from './translations'

import './EventProgramEditor.sass'

const {
  Input,
  Field,
  Switch,
  switchFor,
  Form,
  ListField,
  RemoveItemButton,
  useValueAt,
  useOnChangeFor,
  useAppendToList,
  useMoveItemInList,
} = formFor<EventProgramSettings>()


const DEFAULT_INTERVAL_MUSIC_DURATION = 15*60

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
      {danceSets.map((danceSet, index : number) =>
        <DanceSetEditor key={danceSet._id} index={index} />
      )}
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

function AddIntroductionButton() {
  const addIntroduction = useAppendToList('introductions.program')
  function addIntroductoryInfo() {
    addIntroduction(newEventProgramItem)
  }
  return <Button text={t`buttons.addIntroductoryInfo`} onClick={addIntroductoryInfo} className="addIntroductoryInfo" />
}

function newEventProgramItem(): EventProgramRow {
  return {
    item: {__typename: 'EventProgram', _id: undefined, name: t`placeholderNames.newProgramItem`, showInLists: false},
    _id: guid(),
  }
}

function AddDanceSetButton() {
  const onAddDanceSet = useAppendToList('danceSets')
  function addDanceSet() {
    onAddDanceSet(newDanceSet)
  }
  return <Button text={t`buttons.addDanceSet`} onClick={addDanceSet} className="addDanceSet" />
}

function newDanceSet(danceSets: DanceSet[]): DanceSet {
  const danceSetNumber = danceSets.length + 1
  const dances = Array.from({length: 6}, () => ({item: {__typename: 'RequestedDance'}, _id: guid()} as EventProgramRow))
  return {
    _id: guid(),
    title: t('placeholderNames.danceSet', {number: danceSetNumber}),
    program: dances,
    intervalMusicDuration: DEFAULT_INTERVAL_MUSIC_DURATION
  }
}

function IntroductoryInformation() {
  const infos = useValueAt('introductions.program')
  if (infos.length === 0) return null

  return <Card className="danceset">
    <Flex className="sectionTitleRow">
      <h2>
        <t.span>titles.introductoryInformation</t.span>
      </h2>
      <AddIntroductionButton />
    </Flex>
    <ProgramListEditor path="introductions" />
  </Card>
}

const DanceSetEditor = React.memo(function DanceSetEditor({index} : {index: number}) {
  const item = useValueAt(`danceSets.${index}`)
  const {moveTo} = useMoveItemInList('danceSets', index)
  const onAddItem = useAppendToList(`danceSets.${index}.program`)

  return <Card className="danceset">
    <Flex className="sectionTitleRow">
      <h2>
        <Field labelStyle="hidden" label={t`fields.danceSetName`} path={`danceSets.${index}.title`} inline component={ClickToEdit} />
      </h2>
      <Button text={t`buttons.addDance`} onClick={() => onAddItem({item: {__typename: 'RequestedDance'}, _id: guid()})} className="addDance" />
      <Button text={t`buttons.addInfo`} onClick={() => onAddItem(newEventProgramItem())} className="addInfo" />
      <InheritedSlideStyleSelector path={`danceSets.${index}.titleSlideStyleId`} text={t`fields.titleStyle`} />
      <MoveDanceSetSelector
        currentSet={item}
        onSelect={({index})=> moveTo(index)} />
      <RemoveItemButton path="danceSets" index={index} className="delete" text={t`buttons.removeDanceSet`} />
    </Flex>
    <ProgramListEditor path={`danceSets.${index}`} />
  </Card>
})

function ProgramListEditor({path}: {path: ProgramSectionPath}) {
  const { program, intervalMusicDuration } = useValueAt(path)
  const isIntroductionsSection = path.startsWith('introductions')
  const programPath = `${path}.program` as const

  return <HTMLTable condensed bordered striped className="danceSet">
    {program.length === 0 ||
        <thead>
          <tr>
            <t.th>columnTitles.type</t.th><t.th>columnTitles.name</t.th><t.th>columnTitles.duration</t.th><t.th>columnTitles.actions</t.th>
          </tr>
        </thead>
    }
    <tbody>
      <ListField labelStyle="hidden-nowrapper" label="" isTable path={programPath} component={ProgramItemEditor} />
      {program.length === 0 &&
          <tr>
            <t.td className={CssClass.textMuted+ ' noProgram'} colSpan="5">programListIsEmpty</t.td>
          </tr>
      }
      {!isIntroductionsSection && intervalMusicDuration > 0 && <IntervalMusicEditor danceSetPath={path as DanceSetPath} />}
    </tbody>
    <tfoot>
      <tr className="eventProgramFooter">
        {isIntroductionsSection ||
        <td colSpan={2}>
          <IntervalMusicSwitch inline label={t`fields.intervalMusicAtEndOfSet`} path={`${path}.intervalMusicDuration` as `danceSets.${number}.intervalMusicDuration`} />
        </td>
        }
        <td colSpan={isIntroductionsSection ? 4 : 2}>
          <DanceSetDuration program={program} intervalMusicDuration={intervalMusicDuration} />
        </td>
      </tr>
    </tfoot>
  </HTMLTable>
}

const IntervalMusicSwitch = switchFor<number>({
  isChecked: num => (num ?? 0) > 0,
  toValue: checked => checked ? DEFAULT_INTERVAL_MUSIC_DURATION : 0,
})

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
    <td>{t(`programTypes.${__typename}`)}</td>
    <td>
      <ProgramDetailsEditor path={itemPath} />
    </td>
    <td>
      <Duration value={__typename !== 'RequestedDance' ? item.item.duration : 0} />
    </td>
    <td>
      {dragHandle}
      <InheritedSlideStyleSelector path={`${itemPath}.slideStyleId`} text={t`fields.style`} />
      <MoveItemToSectionSelector itemPath={itemPath} />
      <RemoveItemButton path={path} index={itemIndex} title={t`remove`} icon="cross" className="deleteItem" />
    </td>
  </React.Fragment>
})

function ProgramDetailsEditor({path}: {path: ProgramItemPath}) {
  const __typename = useValueAt(`${path}.item.__typename`)
  //If something is deleted useValueAt may return undefined
  if (__typename === undefined) return null

  switch(__typename) {
    case 'Dance':
    case 'RequestedDance':
      return <Field label={t`Dance`} labelStyle="hidden" path={`${path as DanceProgramPath}.item`} component={DanceProgramChooser} />
    case 'EventProgram':
      return <>
        <Input label={t`fields.eventProgram.name`} path={`${path}.item.name`} required />
        <Field label={t`fields.eventProgram.description`} path={`${path}.item.description`} component={MarkdownEditor} />
        <Switch label={t`fields.eventProgram.showInLists`} path={`${path}.item.showInLists`} inline />
      </>
  }
}

function IntervalMusicEditor({danceSetPath}: {danceSetPath: DanceSetPath}) {
  const durationPath = `${danceSetPath}.intervalMusicDuration` as const
  const onSetIntervalMusicDuration = useOnChangeFor(durationPath)

  return <tr className="eventProgramItem">
    <td>{t`programTypes.intervalMusic`}</td>
    <td />
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
