import React, {createContext, useContext, useMemo, useRef, useState} from 'react'
import * as L from 'partial.lenses'

import {ActionButton as Button, ClickToEdit, FieldComponentProps, formFor, MarkdownEditor, MenuButton, Selector, SelectorMenu, SubmitButton, Switch as PlainSwitch, toArrayPath} from 'libraries/forms'
import {Card, CssClass, HTMLTable} from 'libraries/ui'
import {DanceChooser} from 'components/widgets/DanceChooser'
import {Duration} from 'components/widgets/Duration'
import {DurationField} from 'components/widgets/DurationField'
import {NavigateButton} from 'components/widgets/NavigateButton'
import {ProgramPauseDurationEditor} from 'components/widgets/ProgramPauseDurationEditor'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {focusLater, focusSiblingsOrParent} from 'utils/focus'
import {guid} from 'utils/guid'
import {blurTo, clickInElement, clickInParent, focusTo, moveDown, moveUp, navigateAmongSiblings} from 'utils/keyboardNavigation'
import {makeTranslate} from 'utils/translate'
import {bind, useHotkeyHandler} from 'utils/useHotkeyHandler'
import {useRedirectKeyDownTo} from 'utils/useRedirectKeyDownTo'

import {DanceProgram, DanceSet, EventProgramItem, EventProgramRow, EventProgramSettings, RequestedDance} from './types'
import {Dance} from 'types'

import './EventProgramEditor.sass'

const {
  Input,
  Field,
  Switch,
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

const t = makeTranslate({
  actions: 'Toiminnot',
  moveToSet: 'Siirrä settiin',
  moveDanceSet: 'Siirrä',
  afterSet: 'Setin "%(name)s" jälkeen',
  beforeSet: 'Ennen settiä "%(name)s"',
  addEntry: 'Lisää',
  addEntryTitle: 'Lisää ohjelmaa',
  introductoryInformation: 'Alkutiedotukset',
  programListIsEmpty: 'Ei ohjelmaa',
  Dance: 'Tanssi',
  RequestedDance: 'Toivetanssi',
  EventProgram: 'Muu ohjelma',
  eventProgramName: 'Ohjelman nimi',
  eventProgramDescription: 'Ohjelman kuvaus',
  showInLists: 'Näytä ohjelma tanssilistoissa',
  removeDanceSet: 'Poista setti',
  addDanceSet: 'Lisää tanssisetti',
  danceSet: 'Setti',
  addDance: 'Lisää tanssi',
  addInfo: 'Lisää muuta ohjelmaa',
  addIntroductoryInfo: 'Lisää alkutiedote',
  type: 'Tyyppi',
  name: 'Nimi',
  duration: 'Kesto',
  pausesIncluded: 'taukoineen',
  dances: 'tanssit',
  ofWhichDances: ' (taukoineen), josta tanssimusiikin kesto',
  pauseDuration: 'Tanssien välinen tauko',
  intervalMusic: 'Taukomusiikki',
  intervalMusicDuration: 'Taukomusiikin kesto',
  intervalMusicAtEndOfSet: 'Taukomusiikki setin lopussa',
  minutes: 'min.',
  style: 'Tyyli',
  eventDefaultStyle: 'Ohjelman oletustyyli',
  remove: 'Poista',
  danceProgramIsEmpty: 'Ei tanssiohjelmaa.',
  danceSetName: 'Tanssisetin nimi',
  newProgramItem: 'Uusi ohjelmanumero',
})

const DEFAULT_INTERVAL_MUSIC_DURATION = 15*60
const DurationHelperContext = createContext({
  pause: 0, setPause: (() => {/* dummy */}) as (pause: number) => unknown,
})

interface EventProgramEditorProps {
  program: EventProgramSettings
  onSubmit: (p: EventProgramSettings) => unknown
}

export function EventProgramEditor({program: eventProgram, onSubmit}: EventProgramEditorProps) {
  const [program, onChange] = useState(eventProgram)
  const {slideStyleId, danceSets, introductions} = program
  const [pause, setPause] = useState(3)
  const element = useRef<HTMLElement>(null)
  useRedirectKeyDownTo(element)
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    //bind(['a', 's'], addDanceSet),
    //bind('i', addIntroductoryInfo),
  )

  const durationContext = useMemo(() => ({pause, setPause}), [pause])

  return <Form value={program} onChange={onChange} onSubmit={onSubmit}>
    <DurationHelperContext.Provider value={durationContext}>
      <section className="eventProgramEditor" ref={element} onKeyDown={onKeyDown}>
        <div className="main-toolbar">
          {introductions.program.length === 0 && <AddIntroductionButton />}
          <ProgramPauseDurationEditor {...{pause, setPause}} />
          <SlideStyleSelector
            text={t`style`}
            value={slideStyleId}
            onSelect={style => onChange(L.set('slideStyleId', style.id))} />
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
    </DurationHelperContext.Provider>
    <hr />
    <SubmitButton text="Tallenna muutokset" />
    <NavigateButton href='..' text="Peruuta" />
  </Form>
}

function AddIntroductionButton() {
  const addIntroduction = useAppendToList('introductions.program')
  function addIntroductoryInfo() {
    addIntroduction(newEventProgramItem)
    focusLater('.eventProgramEditor .danceset:first-child tbody tr:last-child')
  }
  return <Button text={t`addIntroductoryInfo`} onClick={addIntroductoryInfo} className="addIntroductoryInfo" />
}

function newEventProgramItem(): EventProgramRow {
  return {
    item: {__typename: 'EventProgram', _id: undefined, name: t`newProgramItem`, showInLists: false},
    _id: guid(),
  }
}

function AddDanceSetButton() {
  const onAddDanceSet = useAppendToList('danceSets')
  function addDanceSet() {
    onAddDanceSet(newDanceSet)
    focusLater('.eventProgramEditor .danceset:last-child')
  }
  return <Button text={t`addDanceSet`} onClick={addDanceSet} className="addDanceSet" />
}

function newDanceSet(danceSets: DanceSet[]): DanceSet {
  const danceSetNumber = danceSets.length + 1
  const dances = Array.from({length: 6}, () => ({item: {__typename: 'RequestedDance'}, _id: guid()} as EventProgramRow))
  return {
    _id: guid(),
    name: t`danceSet` + ' ' + danceSetNumber,
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
    <h2>
      <t.span>introductoryInformation</t.span>
      <AddIntroductionButton />
    </h2>
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
    <h2>
      <Field labelStyle="hidden" label={t`danceSetName`} path={`danceSets.${index}.name`} inline component={ClickToEdit} />
      <Button text={t`addDance`} onClick={() => addItem({item: {__typename: 'RequestedDance'}, _id: guid()})} className="addDance" />
      <Button text={t`addInfo`} onClick={() => addItem(newEventProgramItem())} className="addInfo" />
      <MoveDanceSetSelector
        currentSet={item}
        onSelect={({index})=> moveTo(index)} />
      <RemoveItemButton path="danceSets" index={index} className="delete" text={t`removeDanceSet`} onClick={removeDanceSet} />
    </h2>
    <ProgramListEditor tableRef={table} path={`danceSets.${index}`} />
  </Card>
})

type ProgramSectionPath = 'introductions' | `danceSets.${number}`
type ProgramItemPath = `${ProgramSectionPath}.program.${number}`
type DanceProgramPath = `danceSets.${number}.program.${number}`

function ProgramListEditor({path, tableRef}: {path: ProgramSectionPath, tableRef: React.RefObject<HTMLTableElement>}) {
  const { program, intervalMusicDuration } = useValueAt(path)
  const isIntroductionsSection = path.startsWith('introductions')
  const onSetIntervalMusicDuration = useOnChangeFor(`${path}.intervalMusicDuration`)
  const programPath = `${path}.program` as const

  return <ListEditor path={programPath}>
    <HTMLTable condensed bordered striped className="danceSet" elementRef={tableRef}>
      {program.length === 0 ||
          <thead>
            <tr>
              <t.th>type</t.th><t.th>name</t.th><t.th>duration</t.th><t.th>actions</t.th>
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
        {intervalMusicDuration > 0 &&
            <IntervalMusicEditor intervalMusicDuration={intervalMusicDuration} onSetIntervalMusicDuration={onSetIntervalMusicDuration} />}
      </tbody>
      <tfoot>
        <tr className="eventProgramFooter">
          {isIntroductionsSection ||
          <td colSpan={2}>
            <PlainSwitch id="intervalMusicAtEndOfSet" inline label={t`intervalMusicAtEndOfSet`} value={intervalMusicDuration > 0}
              onChange={checked => onSetIntervalMusicDuration(checked ? DEFAULT_INTERVAL_MUSIC_DURATION : 0) }/>
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
  const defaultSlideStyleId = useValueAt('slideStyleId')
  const onChangeStyle = useOnChangeFor(`${itemPath}.slideStyleId`)
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
    <td>{t(__typename)}</td>
    <td>
      <ProgramDetailsEditor path={itemPath} onInputBlurred={onInputBlurred} />
    </td>
    <td>
      <Duration value={item.item.duration} />
    </td>
    <td>
      <DragHandle tabIndex={-1}/>
      <SlideStyleSelector
        text={t`style`}
        value={item.slideStyleId ?? null}
        inheritsStyles
        inheritedStyleId={defaultSlideStyleId}
        inheritedStyleName={t`eventDefaultStyle`}
        onSelect={style => onChangeStyle(style.id)} />
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
        <Input label={t`eventProgramName`} path={`${path}.item.name`} componentProps={{onBlur:onInputBlurred}} required />
        <Field label={t`eventProgramDescription`} path={`${path}.item.description`} component={MarkdownEditor} />
        <Switch label={t`showInLists`} path={`${path}.item.showInLists`} inline />
      </>
  }
}

const DanceProgramChooser = React.memo(function DanceProgramChooser({value, onChange, onBlur, ...props} : FieldComponentProps<EventProgramItem, HTMLElement> & {onBlur: (e: React.FocusEvent) => unknown}) {
  return <DanceChooser
    value={value?._id ? value as Dance : null}
    onChange={(dance, e) => onChange(
      dance
        ? {...dance, __typename: 'Dance'} as DanceProgram
        : {__typename: 'RequestedDance'} as RequestedDance,
      e
    )}
    allowEmpty
    emptyText={t`RequestedDance`}
    onBlur={onBlur}
    {...props}
  />
})

function IntervalMusicEditor({intervalMusicDuration, onSetIntervalMusicDuration}) {
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

  // TODO: <DurationField id="intervalMusicDuration" label={t`intervalMusicDuration`} labelStyle="hidden"
  return <tr className="eventProgramItem" tabIndex={0} onKeyDown={onKeyDown} ref={row}>
    <td>{t`intervalMusic`}</td>
    <td />
    <td>
      <DurationField id="intervalMusicDuration"
        value={intervalMusicDuration}
        onBlur={onDurationBlurred}
        onChange={onSetIntervalMusicDuration}/>
    </td>
    <td>
      <Button title={t`remove`} intent="danger" icon="cross" onClick={() => onSetIntervalMusicDuration(0)} className="delete" />
    </td>
  </tr>
}

function DanceSetDuration({ program, intervalMusicDuration}) {
  const {pause} = useContext(DurationHelperContext)
  const duration = program.map(({duration}) => duration ?? 0).reduce((y, x) => x+y, 0)
  const durationWithPauses = duration + pause*60*program.length + intervalMusicDuration

  return <>
    <strong><Duration value={durationWithPauses}/></strong>{' ('+t`pausesIncluded`+') '}
    <br />
    <strong><Duration value={duration}/></strong>{' ('+t`dances`+')'}
  </>
}

function MoveDanceSetSelector({currentSet, onSelect}) {
  const danceSets = useValueAt('danceSets')
  if (danceSets.length < 2) return null

  const currentIndex = danceSets.indexOf(currentSet)
  const items = danceSets.map((d, index) => ({
    name: index < currentIndex
      ? t('beforeSet', {name: d.name})
      : t('afterSet', {name: d.name})
    ,
    index
  })).filter(({index}) => index !== currentIndex)
  return <Selector<{name: string, index: number}>
    items={items}
    getItemText={(section) => section.name}
    onSelect={onSelect}
    text={t`moveDanceSet`}
  />
}

function MoveItemToSectionSelector({itemPath} : { itemPath: ProgramItemPath}) {
  const [open, setOpen] = useState(false)
  return <MenuButton
    menu={
      <MoveItemToSectionMenu
        itemPath={itemPath}
        onSelected={() => setOpen(false)}
      />
    }
    text={t`moveToSet`}
    open={open}
    onSetOpen={setOpen}
  />
}

interface SectionSelection {
  name: string
  index: number
  isIntroductionsSection?: boolean
}
function MoveItemToSectionMenu(
  {itemPath, onSelected} : { itemPath: ProgramItemPath, onSelected: () => void }
) {
  const [currentSectionType, maybeDanceSetIndex] = toArrayPath<EventProgramSettings>(itemPath)
  const row = useValueAt(itemPath)
  const onChangeProgram = useOnChangeFor('')

  const canMoveToIntroductions = currentSectionType === 'danceSets' && row?.item?.__typename === 'EventProgram'
  const introSection : SectionSelection = {name: t`introductoryInformation`, isIntroductionsSection: true, index: 0}
  const sections = useValueAt('danceSets')
    .map(({name}, index) => ({name, index}))
    .filter(({index}) => currentSectionType !== 'danceSets' || index !== maybeDanceSetIndex)

  //If something is deleted useValueAt may return undefined
  if (row === undefined) return null

  return <SelectorMenu<SectionSelection>
    items={canMoveToIntroductions ? [introSection, ...sections] : sections}
    getItemText={item => item?.name ?? ''}
    filterable
    itemPredicate={(search, item) => item.name.toLowerCase().includes(search.toLowerCase())}
    onSelect={(section) => {
      onSelected()
      onChangeProgram((program: EventProgramSettings) => {
        const removeItem = L.set(toArrayPath<EventProgramSettings>(itemPath), undefined)
        const addItem = L.set(
          [
            section.isIntroductionsSection
              ? ['introductions', 'program', L.appendTo]
              : ['danceSets', section.index, 'program', L.appendTo]
          ],
          row,
        )
        return addItem(removeItem(program)) as EventProgramSettings
      })
    }}
  />
}
