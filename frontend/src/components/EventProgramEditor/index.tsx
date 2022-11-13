import React, {useRef, useState} from 'react'

import {ActionButton as Button, ClickToEdit, formFor, MarkdownEditor, SubmitButton} from 'libraries/forms'
import {Card, CssClass, HTMLTable} from 'libraries/ui'
import {Flex} from 'components/Flex'
import {Duration} from 'components/widgets/Duration'
import {DurationField} from 'components/widgets/DurationField'
import {NavigateButton} from 'components/widgets/NavigateButton'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {focusLater, focusSiblingsOrParent} from 'utils/focus'
import {guid} from 'utils/guid'
import {blurTo, clickInElement, clickInParent, focusTo, moveDown, moveUp, navigateAmongSiblings} from 'utils/keyboardNavigation'
import {bind, useHotkeyHandler} from 'utils/useHotkeyHandler'
import {useRedirectKeyDownTo} from 'utils/useRedirectKeyDownTo'

import {DanceProgramPath, DanceSet, EventProgramRow, EventProgramSettings, ProgramItemPath, ProgramSectionPath} from './types'

import {DanceProgramChooser, InheritedSlideStyleSelector, MoveDanceSetSelector, MoveItemToSectionSelector} from './selectors'
import t from './translations'

import './EventProgramEditor.sass'

const {
  Input,
  Field,
  Switch,
  switchFor,
  Form,
  ListEditor,
  ListEditorItems,
  DragHandle,
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
  const element = useRef<HTMLElement>(null)
  useRedirectKeyDownTo(element)
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    //bind(['a', 's'], addDanceSet),
    //bind('i', addIntroductoryInfo),
  )

  return <Form value={program} onChange={onChange} onSubmit={onSubmit}>
    <section className="eventProgramEditor" ref={element} onKeyDown={onKeyDown}>
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
    focusLater('.eventProgramEditor .danceset:first-child tbody tr:last-child')
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
    focusLater('.eventProgramEditor .danceset:last-child')
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
  const table = useRef<HTMLTableElement>(null)
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    focusTo('tbody tr'),
    bind('i', clickInParent('div.danceset', 'button.addInfo')),
  )

  if (infos.length === 0) return null

  return <Card className="danceset" tabIndex={0} onKeyDown={onKeyDown}>
    <Flex className="sectionTitleRow">
      <h2>
        <t.span>titles.introductoryInformation</t.span>
      </h2>
      <AddIntroductionButton />
    </Flex>
    <ProgramListEditor path="introductions" tableRef={table} />
  </Card>
}

const DanceSetEditor = React.memo(function DanceSetEditor({index} : {index: number}) {
  const table = useRef<HTMLTableElement>(null)

  const item = useValueAt(`danceSets.${index}`)
  const {moveDown: onMoveDown, moveUp: onMoveUp, moveTo} = useMoveItemInList('danceSets', index)
  function removeDanceSet(e) {
    focusSiblingsOrParent(e.target, 'section.eventProgramEditor')
  }
  const onAddItem = useAppendToList(`danceSets.${index}.program`)
  function addItem(itemToAdd: EventProgramRow) {
    onAddItem(itemToAdd)
    focusLater('tbody tr:last-child', table.current)
  }

  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    focusTo('tbody tr'),
    blurTo('body'),
    moveUp(onMoveUp),
    moveDown(onMoveDown),
    bind(['a', 'd'], clickInParent('div.danceset', 'button.addDance')),
    bind('i', clickInParent('div.danceset', 'button.addInfo')),
    bind(['delete', 'backspace'], clickInElement('.delete'))
  )

  return <Card className="danceset" tabIndex={0} onKeyDown={onKeyDown} >
    <Flex className="sectionTitleRow">
      <h2>
        <Field labelStyle="hidden" label={t`fields.danceSetName`} path={`danceSets.${index}.title`} inline component={ClickToEdit} />
      </h2>
      <Button text={t`buttons.addDance`} onClick={() => addItem({item: {__typename: 'RequestedDance'}, _id: guid()})} className="addDance" />
      <Button text={t`buttons.addInfo`} onClick={() => addItem(newEventProgramItem())} className="addInfo" />
      <InheritedSlideStyleSelector path={`danceSets.${index}.titleSlideStyleId`} text={t`fields.titleStyle`} />
      <MoveDanceSetSelector
        currentSet={item}
        onSelect={({index})=> moveTo(index)} />
      <RemoveItemButton path="danceSets" index={index} className="delete" text={t`buttons.removeDanceSet`} onClick={removeDanceSet} />
    </Flex>
    <ProgramListEditor tableRef={table} path={`danceSets.${index}`} />
  </Card>
})

function ProgramListEditor({path, tableRef}: {path: ProgramSectionPath, tableRef: React.RefObject<HTMLTableElement>}) {
  const { program, intervalMusicDuration } = useValueAt(path)
  const isIntroductionsSection = path.startsWith('introductions')
  const programPath = `${path}.program` as const

  return <ListEditor path={programPath}>
    <HTMLTable condensed bordered striped className="danceSet" elementRef={tableRef}>
      {program.length === 0 ||
          <thead>
            <tr>
              <t.th>columnTitles.type</t.th><t.th>columnTitles.name</t.th><t.th>columnTitles.duration</t.th><t.th>columnTitles.actions</t.th>
            </tr>
          </thead>
      }
      <tbody>
        <ListEditorItems path={programPath} component={ProgramItemEditor} />
        {program.length === 0 &&
            <tr>
              <t.td className={CssClass.textMuted+ ' noProgram'} colSpan="5">programListIsEmpty</t.td>
            </tr>
        }
        {intervalMusicDuration > 0 && <IntervalMusicEditor path={`${path}.intervalMusicDuration`} />}
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
  </ListEditor>
}

const IntervalMusicSwitch = switchFor<number>({
  isChecked: num => (num ?? 0) > 0,
  toValue: checked => checked ? DEFAULT_INTERVAL_MUSIC_DURATION : 0,
})

interface ProgramItemEditorProps {
  item: EventProgramRow
  path: `${ProgramSectionPath}.program`
  itemIndex: number
  onChange: (val: (v: unknown) => unknown) => unknown
  onRemove: () => unknown
  onMoveUp: () => unknown
  onMoveDown: () => unknown
}

const ProgramItemEditor = React.memo(function ProgramItemEditor({path, itemIndex} : ProgramItemEditorProps) {
  const itemPath = `${path}.${itemIndex}` as ProgramItemPath
  const item = useValueAt(itemPath)
  const {moveDown: onMoveDown, moveUp: onMoveUp} = useMoveItemInList(path, itemIndex)

  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('tr'),
    moveUp(onMoveUp),
    moveDown(onMoveDown),
    blurTo('div.danceset'),
    focusTo('input'),
    bind(['delete', 'backspace'], clickInElement('.deleteItem'))
  )

  const container = useRef<HTMLTableRowElement>(null)
  /** Focuses the row when the dance/value editor is blurred but not if something inside the row is already focused
   * This allows tab navigation to work, but helps users that use the custom nav */
  function onInputBlurred() {
    //We need to set a timeout, because the Blueprint Suggest used by Dancechooser handles blurring in a wacky way
    setTimeout(() => {
      const nextFocused = document.activeElement
      if (nextFocused && container.current?.contains(nextFocused)) {
        //Focus is still somewhere inside our item
        return
      }
      container.current?.focus()
    }, 0)
  }

  function removeItem(e) {
    focusSiblingsOrParent(e.target, 'div.danceset')
  }

  if (!item) return null
  const {__typename } = item.item

  return <tr className="eventProgramItem" onKeyDown={onKeyDown} ref={container} tabIndex={0}>
    <td>{t(`programTypes.${__typename}`)}</td>
    <td>
      <ProgramDetailsEditor path={itemPath} onInputBlurred={onInputBlurred} />
    </td>
    <td>
      <Duration value={__typename !== 'RequestedDance' ? item.item.duration : 0} />
    </td>
    <td>
      <DragHandle tabIndex={-1}/>
      <InheritedSlideStyleSelector path={`${itemPath}.slideStyleId`} text={t`fields.style`} />
      <MoveItemToSectionSelector itemPath={itemPath} />
      <RemoveItemButton path={path} index={itemIndex} title={t`remove`} icon="cross" onClick={removeItem} className="deleteItem" />
    </td>
  </tr>
})

function ProgramDetailsEditor({path, onInputBlurred}: {path: ProgramItemPath, onInputBlurred: () => unknown}) {
  const __typename = useValueAt(`${path}.item.__typename`)
  //If something is deleted useValueAt may return undefined
  if (__typename === undefined) return null

  switch(__typename) {
    case 'Dance':
    case 'RequestedDance':
      return <Field label={t`Dance`} labelStyle="hidden" path={`${path as DanceProgramPath}.item`} component={DanceProgramChooser} componentProps={{onBlur:onInputBlurred}}/>
    case 'EventProgram':
      return <>
        <Input label={t`fields.eventProgram.name`} path={`${path}.item.name`} componentProps={{onBlur:onInputBlurred}} required />
        <Field label={t`fields.eventProgram.description`} path={`${path}.item.description`} component={MarkdownEditor} />
        <Switch label={t`fields.eventProgram.showInLists`} path={`${path}.item.showInLists`} inline />
      </>
  }
}

function IntervalMusicEditor({path}: {path: `${ProgramSectionPath}.intervalMusicDuration`}) {
  const onSetIntervalMusicDuration = useOnChangeFor(path)
  const row = useRef<HTMLTableRowElement>(null)
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('tr'),
    blurTo('div.danceset'),
    focusTo('.click-to-edit'),
    bind(['delete', 'backspace'], removeItem)
  )

  function removeItem(e) {
    onSetIntervalMusicDuration(0)
    focusSiblingsOrParent(e.target, 'div.danceset')
  }
  /** Focuses the row when the duration editor is exited, but not if something inside the row is already focused
   * This allows tab navigation to work, but helps users that use the custom nav */
  function onDurationBlurred(e) {
    const nextFocused = e.relatedTarget
    const containerElement = row.current
    if (containerElement !== null && nextFocused && containerElement.contains(nextFocused)) {
      //Focus is still somewhere inside our item
      return
    }
    containerElement && containerElement.focus()
  }

  return <tr className="eventProgramItem" tabIndex={0} onKeyDown={onKeyDown} ref={row}>
    <td>{t`programTypes.intervalMusic`}</td>
    <td />
    <td>
      <Field label={t`fields.intervalMusicDuration`} labelStyle="hidden" path={path} component={DurationField} componentProps={{onBlur: onDurationBlurred}}/>
    </td>
    <td>
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
