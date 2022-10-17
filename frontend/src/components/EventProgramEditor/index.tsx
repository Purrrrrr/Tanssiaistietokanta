import React, {createContext, useContext, useMemo, useState, useRef} from 'react';
import * as L from 'partial.lenses';
import {arrayMoveImmutable} from 'array-move';

import {Dance} from "types/Dance";
import {EventProgramSettings, EventProgramItem, DanceProgram, RequestedDance} from "./types";

import {Card, HTMLTable, CssClass, Select, MenuItem} from "libraries/ui";
import {formFor, ClickToEdit, Switch as PlainSwitch, SubmitButton, ActionButton as Button, asFormControl, FieldComponentProps} from "libraries/forms2";

import {DragHandle, ListEditor, ListEditorItems} from "components/ListEditor";
import {DanceChooser} from "components/widgets/DanceChooser";
import {Duration} from "components/widgets/Duration";
import {DurationField} from "components/widgets/DurationField";
import {ProgramPauseDurationEditor} from "components/widgets/ProgramPauseDurationEditor";
import {NavigateButton} from "components/widgets/NavigateButton";
import {SlideStyleSelector} from "components/widgets/SlideStyleSelector";
import {MarkdownEditor} from 'components/MarkdownEditor';
import {makeTranslate} from 'utils/translate';
import {bind, useHotkeyHandler} from 'utils/useHotkeyHandler';
import {useRedirectKeyDownTo} from 'utils/useRedirectKeyDownTo';
import {navigateAmongSiblings, moveUp, moveDown, blurTo, focusTo, clickInParent} from 'utils/keyboardNavigation';
import {guid} from "utils/guid";
import {focusLater, focusSiblingsOrParent} from 'utils/focus';

import './EventProgramEditor.sass';

const {
  Input,
  Field,
  Switch,
  Form, 
  useValueAt,
  useOnChangeFor,
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
  DanceProgram: 'Tanssi',
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
});

const DEFAULT_INTERVAL_MUSIC_DURATION = 15*60;
const DurationHelperContext = createContext({
  pause: 0, setPause: (() => {}) as (pause: number) => any,
});

interface EventProgramEditorProps {
  program: EventProgramSettings 
  onSubmit: (p: EventProgramSettings) => unknown
}

export function EventProgramEditor({program: eventProgram, onSubmit}: EventProgramEditorProps) {
  const [program, onChange] = useState(eventProgram);
  const {slideStyleId, danceSets, introductions} = program;
  const [pause, setPause] = useState(3);
  const element = useRef<HTMLElement>(null);
  useRedirectKeyDownTo(element);
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    //bind(['a', 's'], addDanceSet),
    //bind('i', addIntroductoryInfo),
  );

  const durationContext = useMemo(() => ({pause, setPause}), [pause]);

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
  </Form>;
};

function AddIntroductionButton() {
  const onChangeIntroductions = useOnChangeFor(["introductions", "program"])
  function addIntroductoryInfo() {
    onChangeIntroductions(L.set(L.appendTo, newEventProgramItem()));
    focusLater('.eventProgramEditor .danceset:first-child tbody tr:last-child');
  }
  return <Button text={t`addIntroductoryInfo`} onClick={addIntroductoryInfo} className="addIntroductoryInfo" />
}

function AddDanceSetButton() {
  const onChangeDancesets = useOnChangeFor("danceSets")
  function addDanceSet() {
    onChangeDancesets(danceSets => L.set(L.appendTo, newDanceSet(danceSets), danceSets))
    focusLater('.eventProgramEditor .danceset:last-child');
  }
  return <Button text={t`addDanceSet`} onClick={addDanceSet} className="addDanceSet" />
}

function newDanceSet(danceSets) {
  const danceSetNumber = danceSets.length + 1;
  const dances = Array.from({length: 6}, () => ({__typename: 'RequestedDance'}));
  return {
    _id: guid(),
    name: t`danceSet` + " " + danceSetNumber,
    program: dances,
    intervalMusicDuration: DEFAULT_INTERVAL_MUSIC_DURATION
  }
}

function newEventProgramItem() {
  return {__typename: 'EventProgram', name: t`newProgramItem`, showInLists: false}
}

function IntroductoryInformation() {
  const infos = useValueAt(["introductions", "program"])
  const table = useRef<HTMLTableElement>(null);
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    focusTo('tbody tr'),
    bind('i', clickInParent('div.danceset', 'button.addInfo')),
  );

  if (infos.length === 0) return null

  return <Card className="danceset" tabIndex={0} onKeyDown={onKeyDown}>
    <h2>
      <t.span>introductoryInformation</t.span>
      <AddIntroductionButton />
    </h2>
    <ProgramListEditor path={["introductions"]} tableRef={table} />
  </Card>;
}

function DanceSetEditor({index}) {
  const item = useValueAt(["danceSets", index])
  const onChangeDancesets = useOnChangeFor("danceSets")
  function onMoveDanceSet(danceset, index) {
    onChangeDancesets(sets => arrayMoveImmutable(sets, sets.indexOf(danceset), index))
  }
  function onRemove() {
    onChangeDancesets(L.set(index, undefined))
  }

  const onChange = useOnChangeFor(['danceSets', index])
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    focusTo('tbody tr'),
    blurTo('body'),
    moveUp(() => index > 0 && onMoveDanceSet(item, index - 1)),
    moveDown(() => onMoveDanceSet(item, index + 1)),
    bind(['a', 'd'], clickInParent('div.danceset', 'button.addDance')),
    bind('i', clickInParent('div.danceset', 'button.addInfo')),
    bind(['delete', 'backspace'], removeDanceSet)
  );
  function removeDanceSet(e) {
    onRemove();
    focusSiblingsOrParent(e.target, 'section.eventProgramEditor');
  }
  const table = useRef<HTMLTableElement>(null);
  function addItem(itemToAdd) {
    onChange(L.set(['program', L.appendTo], itemToAdd, item));
    focusLater('tbody tr:last-child', table.current);
  }

  return <Card className="danceset" tabIndex={0} onKeyDown={onKeyDown} >
    <h2>
      <Field labelStyle="hidden" label={t`danceSetName`} path={['danceSets', index, 'name']} inline component={ClickToEdit} />
      <Button text={t`addDance`} onClick={() => addItem({__typename: 'RequestedDance'})} className="addDance" />
      <Button text={t`addInfo`} onClick={() => addItem(newEventProgramItem())} className="addInfo" />
      <MoveDanceSetSelector
        currentSet={item}
        onSelect={({index})=> onMoveDanceSet(item, index)} />
      <Button className="delete" intent="danger" text={t`removeDanceSet`} onClick={removeDanceSet} />
    </h2>
    <ProgramListEditor tableRef={table} path={["danceSets", index]} />
  </Card>;
};

type ProgramSectionPath = ['introductions'] | ['danceSets', number]
type ProgramItemPath = [...ProgramSectionPath, 'program', number]
type DanceProgramPath = ['danceSets', number, 'program', number]

function ProgramListEditor({path, tableRef}) {
  const { program, isIntroductionsSection, intervalMusicDuration } = useValueAt(path as ProgramSectionPath)
  const onChange = useOnChangeFor([...path as ProgramSectionPath, 'program'])
  const onSetIntervalMusicDuration = useOnChangeFor([...path as ProgramSectionPath, 'intervalMusicDuration'])

  return <ListEditor items={program} onChange={onChange} useDragHandle>
    <HTMLTable condensed bordered striped className="danceSet" elementRef={tableRef}>
      {program.length === 0 ||
          <thead>
            <tr>
              <t.th>type</t.th><t.th>name</t.th><t.th>duration</t.th><t.th>actions</t.th>
            </tr>
          </thead>
      }
      <tbody>
        <ListEditorItems noWrapper component={ProgramItemEditor} itemProps={{path, isIntroductionsSection}} />
        {program.length === 0 &&
            <tr>
              <t.td className={CssClass.textMuted+ " noProgram"} colSpan="5">programListIsEmpty</t.td>
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
  </ListEditor>;
}

function ProgramItemEditor({path, itemIndex, item, items, isIntroductionsSection, onChange, onRemove, onAdd, onMoveDown, onMoveUp, ...props}) {
  const itemPath = [...path, 'program', itemIndex] as ProgramItemPath
  const defaultSlideStyleId = useValueAt("slideStyleId")
  const danceSets = useValueAt("danceSets")
  const onChangeProgram = useOnChangeFor([])

  const {__typename } = item;
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('tr'),
    moveUp(onMoveUp),
    moveDown(onMoveDown),
    blurTo('div.danceset'),
    focusTo('input'),
    bind(['delete', 'backspace'], removeItem)
  );

  function onMoveItemToSet(item, section) {
    onChangeProgram((program: EventProgramSettings) => {
      const index = program.danceSets.indexOf(section)

      const removeItem = L.set(
        [L.seq('introductions', ['danceSets', L.elems]), 'program', L.elems, L.when(i => i === item)],
        undefined,
      )
      const addItem = L.set(
        [
          section.isIntroductionsSection
          ? ['introductions', 'program', L.appendTo]
          : ['danceSets', index, 'program', L.appendTo]
        ],
        item,
      )
      return addItem(removeItem(program)) as EventProgramSettings
    })
  }

  const container = useRef<HTMLTableRowElement>(null);
  /** Focuses the row when the dance/value editor is blurred but not if something inside the row is already focused
   * This allows tab navigation to work, but helps users that use the custom nav */
  function onInputBlurred() {
    //We need to set a timeout, because the Blueprint Suggest used by Dancechooser handles blurring in a wacky way
    setTimeout(() => {
      const nextFocused = document.activeElement;
      const containerElement = container.current;
      if (containerElement !== null && nextFocused && containerElement.contains(nextFocused)) {
        //Focus is still somewhere inside our item
        return;
      }
      containerElement && containerElement.focus();
    }, 0);
  }

  function removeItem(e) {
    onRemove();
    focusSiblingsOrParent(e.target, 'div.danceset');
  }

  const canMoveToIntroductions = !isIntroductionsSection && __typename === 'EventProgram'

  return <tr className="eventProgramItem" onKeyDown={onKeyDown} ref={container} tabIndex={0}>
    <td>{t(__typename)}</td>
    <td>
      <ProgramDetailsEditor path={itemPath} item={item} onInputBlurred={onInputBlurred} />
    </td>
    <td>
      <Duration value={item.duration} />
    </td>
    <td>
      <DragHandle tabIndex={-1}/>
      <SlideStyleSelector
        text={t`style`}
        value={item.slideStyleId}
        inheritsStyles
        inheritedStyleId={defaultSlideStyleId}
        inheritedStyleName={t`eventDefaultStyle`}
        onSelect={style => onChange(L.set('slideStyleId', style.id))} />
      <MoveItemToSectionSelector
        showIntroSection={canMoveToIntroductions}
        sections={danceSets.filter(d => d.program !== items)}
        onSelect={section => onMoveItemToSet(item, section)} />
      <Button title={t`remove`} intent="danger" icon="cross" onClick={removeItem} className="delete" />
    </td>
  </tr>;
}

function ProgramDetailsEditor({path, item, onInputBlurred}) {
  const {__typename } = item;

  switch(__typename) {
    case 'DanceProgram':
    case 'RequestedDance':
    return <Field label={t`DanceProgram`} labelStyle="hidden" path={path as DanceProgramPath} component={DanceProgramChooser} componentProps={{onBlur:onInputBlurred}}/>
    case 'EventProgram':
      return <>
        <Input label={t`eventProgramName`} path={[...path as ProgramItemPath, 'name']} componentProps={{onBlur:onInputBlurred}} required />
        <Field label={t`eventProgramDescription`} path={[...path as ProgramItemPath, 'description']} component={MarkdownEditor} />
        <Switch label={t`showInLists`} path={[...path as ProgramItemPath, 'showInLists']} inline />
      </>
  }

  throw new Error('Unknown typename '+__typename)
}

function DanceProgramChooser({value, onChange, onBlur, ...props} : FieldComponentProps<EventProgramItem, HTMLElement> & {onBlur: (e: React.FocusEvent) => unknown}) {
  return <DanceChooser
    value={value?._id ? value as Dance : null}
    onChange={(dance, e) => onChange(
      dance
        ? {...dance, __typename: 'DanceProgram'} as DanceProgram
        : {__typename: 'RequestedDance'} as RequestedDance,
      e
    )}
    allowEmpty
    emptyText={t`RequestedDance`}
    onBlur={onBlur}
    {...props}
  />
}

function IntervalMusicEditor({intervalMusicDuration, onSetIntervalMusicDuration}) {
  const row = useRef<HTMLTableRowElement>(null);
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('tr'),
    blurTo('div.danceset'),
    focusTo('.click-to-edit'),
    bind(['delete', 'backspace'], removeItem)
  );

  function removeItem(e) {
    onSetIntervalMusicDuration(0);
    focusSiblingsOrParent(e.target, 'div.danceset');
  }
  /** Focuses the row when the duration editor is exited, but not if something inside the row is already focused
   * This allows tab navigation to work, but helps users that use the custom nav */
  function onDurationBlurred(e) {
    const nextFocused = e.relatedTarget;
    const containerElement = row.current;
    if (containerElement !== null && nextFocused && containerElement.contains(nextFocused)) {
      //Focus is still somewhere inside our item
      return;
    }
    containerElement && containerElement.focus();
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
  const {pause} = useContext(DurationHelperContext);
  const duration = program.map(({duration}) => duration ?? 0).reduce((y,x) => x+y, 0);
  const durationWithPauses = duration + pause*60*program.length + intervalMusicDuration;

  return <>
    <strong><Duration value={durationWithPauses}/></strong>{' ('+t`pausesIncluded`+') '}
    <br />
    <strong><Duration value={duration}/></strong>{' ('+t`dances`+')'}
  </>;
}

const SectionSelect = asFormControl(Select.ofType<{name: string}>());

function MoveDanceSetSelector({currentSet, onSelect}) {
  const danceSets = useValueAt("danceSets")
  if (danceSets.length < 2) return null

  const currentIndex = danceSets.indexOf(currentSet)
  const items = danceSets.map((d, index) => ({
    name: index < currentIndex
      ? t('beforeSet', {name: d.name})
      : t('afterSet', {name: d.name})
,
    index
  })).filter(({index}) => index !== currentIndex)
  return <Selector
    className="move-danceset-selector"
    items={items}
    itemRenderer={(section) => section.name}
    onSelect={onSelect}
    placeholder={t`moveDanceSet`}
  />
}

function MoveItemToSectionSelector({showIntroSection, sections, onSelect}) {
  const introSection = {name: t`introductoryInformation`, isIntroductionsSection: true}
  return <Selector
    items={showIntroSection ? [introSection, ...sections] : sections}
    itemRenderer={(section) => section.name}
    onSelect={onSelect}
    placeholder={t`moveToSet`}
  />
}

function Selector({items, itemRenderer, onSelect, placeholder, className = undefined as string | undefined}) {
  return <SectionSelect
    filterable={false}
    className={className}
    items={items}
    itemRenderer={(item, {handleClick, index, modifiers: {active}}) => <MenuItem key={index} roleStructure="listoption" text={itemRenderer(item)} onClick={handleClick} active={active} />}
    onItemSelect={onSelect}
  >
    <Button text={placeholder} rightIcon="double-caret-vertical" />
  </SectionSelect>
}
