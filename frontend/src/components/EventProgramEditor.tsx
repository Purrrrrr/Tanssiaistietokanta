import './EventProgramEditor.sass';

import * as L from 'partial.lenses';
import {arrayMoveImmutable} from 'array-move';
import {guid} from "utils/guid";

import {Card, Button, HTMLTable, CssClass, Select, MenuItem} from "libraries/ui";
import {DragHandle, ListEditor, ListEditorItems} from "./ListEditor";
import React, {createContext, useContext, useMemo, useState, useRef} from 'react';

import {DanceChooser} from "components/widgets/DanceChooser";
import {Duration} from "components/widgets/Duration";
import {DurationField} from "components/widgets/DurationField";
import {Switch, ClickToEdit, Input} from "libraries/forms";
import {ProgramPauseDurationEditor} from "components/widgets/ProgramPauseDurationEditor";
import {SlideStyleSelector} from "components/widgets/SlideStyleSelector";
import {MarkdownEditor} from 'components/MarkdownEditor';
import {makeTranslate} from 'utils/translate';
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {bind, useHotkeyHandler} from 'utils/useHotkeyHandler';
import {useRedirectKeyDownTo} from 'utils/useRedirectKeyDownTo';
import {navigateAmongSiblings, moveUp, moveDown, blurTo, focusTo, clickInParent} from 'utils/keyboardNavigation';
import {focusLater, focusSiblingsOrParent} from 'utils/focus';

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

export function EventProgramEditor({program, onChange}) {
  const {slideStyleId, danceSets = [], introductions = []} = program ?? {};
  const [pause, setPause] = useState(3);
  const element = useRef<HTMLElement>(null);
  useRedirectKeyDownTo(element);
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    bind(['a', 's'], addDanceSet),
    bind('i', addIntroductoryInfo),
  );

  function addIntroductoryInfo() {
    onChange(
      L.set(['introductions', L.defaults([]), L.appendTo], newEventProgramItem())
    );
    focusLater('.eventProgramEditor .danceset:first-child tbody tr:last-child');
  }
  function addDanceSet() {
    onChange(
      L.set(['danceSets', L.defaults([]), L.appendTo], newDanceSet(danceSets))
    );
    focusLater('.eventProgramEditor .danceset:last-child');
  }
  function onMoveDanceSet(danceset, index) {
    onChange(
      L.modify(
        'danceSets',
        sets => arrayMoveImmutable(sets, sets.indexOf(danceset), index),
      )
    )
  }
  function onMoveItemToSet(item, section) {
    const removeItem = L.set(
      [L.seq('introductions', ['danceSets', L.elems, 'program']), L.elems, L.when(i => i === item)],
      undefined,
    )
    const addItem = L.set(
      [
        section.isIntroductionsSection
        ? ['introductions', L.appendTo]
        : ['danceSets', program.danceSets.indexOf(section), 'program', L.appendTo]
      ],
      item,
    )
    onChange(program => addItem(removeItem(program)))
  }

  const durationContext = useMemo(() => ({pause, setPause}), [pause]);
  const onChangeFor = useOnChangeForProp(onChange);

  return <DurationHelperContext.Provider value={durationContext}>
    <section className="eventProgramEditor" ref={element} onKeyDown={onKeyDown}>
      <div className="main-toolbar">
        {introductions.length === 0 && <Button text={t`addIntroductoryInfo`} onClick={addIntroductoryInfo} className="addIntroductoryInfo" />}
        <ProgramPauseDurationEditor {...{pause, setPause}} />
        <SlideStyleSelector
          text={t`style`}
          value={slideStyleId}
          onSelect={style => onChange(L.set('slideStyleId', style.id))} />
      </div>
      { introductions.length > 0 &&
      <IntroductoryInformation danceSets={danceSets} infos={introductions} defaultSlideStyleId={slideStyleId} onChange={onChangeFor('introductions')} onMoveItemToSet={onMoveItemToSet} />
      }
      {danceSets.map((danceSet, index : number) =>
        <DanceSetEditor
          key={danceSet._id}
          item={danceSet}
          itemIndex={index}
          danceSets={danceSets}
          defaultSlideStyleId={slideStyleId}
          onMoveDanceSet={onMoveDanceSet}
          onMoveItemToSet={onMoveItemToSet}
          onChange={onChangeFor(['danceSets', index])}
          onRemove={() => onChange(L.set(['danceSets', index], undefined))}
        />
      )}
      <div className="addDanceSetButtons">
        {danceSets.length === 0 && t`danceProgramIsEmpty`}
        <Button text={t`addDanceSet`} onClick={addDanceSet} className="addDanceSet" />
      </div>
    </section>
  </DurationHelperContext.Provider>;
};

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

function IntroductoryInformation({infos, onChange, danceSets, onMoveItemToSet, defaultSlideStyleId}) {
  const table = useRef<HTMLTableElement>(null);
  function addItem() {
    onChange(L.set(L.appendTo, newEventProgramItem(), infos));
    focusLater('tbody tr:last-child', table.current);
  }
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    focusTo('tbody tr'),
    bind('i', clickInParent('div.danceset', 'button.addInfo')),
  );
  return <Card className="danceset" tabIndex={0} onKeyDown={onKeyDown}>
    <h2>
      <t.span>introductoryInformation</t.span>
      <Button text={t`addIntroductoryInfo`} onClick={() => addItem()} />
    </h2>
    <ProgramListEditor
      tableRef={table}
      danceSets={danceSets}
      defaultSlideStyleId={defaultSlideStyleId}
      onMoveItemToSet={onMoveItemToSet}
      program={infos}
      onChange={onChange}
      isIntroductionsSection intervalMusicDuration={0}
      onSetIntervalMusicDuration={() => {}}
    />
  </Card>;
}

function DanceSetEditor({item, danceSets, onMoveDanceSet, onMoveItemToSet, onChange, onRemove, itemIndex, defaultSlideStyleId, ...props}) {
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    focusTo('tbody tr'),
    blurTo('body'),
    moveUp(() => itemIndex > 0 && onMoveDanceSet(item, itemIndex - 1)),
    moveDown(() => onMoveDanceSet(item, itemIndex + 1)),
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

  const onChangeFor = useOnChangeForProp(onChange);
  const {name, program, intervalMusicDuration} = item;

  return <Card className="danceset" tabIndex={0} {...props} onKeyDown={onKeyDown} >
    <h2>
      <ClickToEdit labelStyle="hidden" label={t`danceSetName`} value={name} onChange={onChangeFor('name')} required />
      <Button text={t`addDance`} onClick={() => addItem({__typename: 'RequestedDance'})} className="addDance" />
      <Button text={t`addInfo`} onClick={() => addItem(newEventProgramItem())} className="addInfo" />
      <MoveDanceSetSelector
        currentSet={item}
        danceSets={danceSets}
        onSelect={({index})=> onMoveDanceSet(item, index)} />
      <Button className="delete" intent="danger" text={t`removeDanceSet`} onClick={removeDanceSet} />
    </h2>
    <ProgramListEditor tableRef={table} isIntroductionsSection={false} program={program} onChange={onChangeFor('program')}
      danceSets={danceSets}
      defaultSlideStyleId={defaultSlideStyleId}
      onMoveItemToSet={onMoveItemToSet}
      intervalMusicDuration={intervalMusicDuration}
      onSetIntervalMusicDuration={onChangeFor('intervalMusicDuration')}/>
  </Card>;
};

function ProgramListEditor({program, danceSets, defaultSlideStyleId, tableRef, onMoveItemToSet, onChange, intervalMusicDuration, onSetIntervalMusicDuration, isIntroductionsSection}) {
  return <ListEditor items={program} onChange={onChange} useDragHandle>
    <HTMLTable condensed bordered striped className="danceSet" elementRef={tableRef}>
      {program.length === 0 ||
          <thead>
            <tr className="eventProgramHeader" >
              <t.th>type</t.th><t.th>name</t.th><t.th>duration</t.th><t.th>actions</t.th>
            </tr>
          </thead>
      }
      <tbody>
        <ListEditorItems noWrapper component={ProgramItemEditor} itemProps={{isIntroductionsSection, danceSets, onMoveItemToSet, defaultSlideStyleId}} />
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
            <Switch inline label={t`intervalMusicAtEndOfSet`} checked={intervalMusicDuration > 0}
              onChange={e => onSetIntervalMusicDuration((e.target as HTMLInputElement).checked ? DEFAULT_INTERVAL_MUSIC_DURATION : 0) }/>
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

function ProgramItemEditor({item, items, isIntroductionsSection, defaultSlideStyleId, danceSets, onMoveItemToSet, onChange, onRemove, onAdd, onMoveDown, onMoveUp, ...props}) {
  const {__typename } = item;
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('tr'),
    moveUp(onMoveUp),
    moveDown(onMoveDown),
    blurTo('div.danceset'),
    focusTo('input'),
    bind(['delete', 'backspace'], removeItem)
  );

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
      <ProgramDetailsEditor item={item} onChange={onChange} onInputBlurred={onInputBlurred} />
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

function ProgramDetailsEditor({item, onInputBlurred, onChange}) {
  const {__typename, name, _id} = item;

  switch(__typename) {
    case 'DanceProgram':
    case 'RequestedDance':
    return <DanceChooser value={item ? {_id, name} : null} onBlur={onInputBlurred}
      allowEmpty emptyText={t`RequestedDance`}
      onChange={dance=> onChange(dance ? {__typename: 'DanceProgram', ...dance} : {__typename: 'RequestedDance'})} />
    case 'EventProgram':
      return <>
        <Input value={name} onBlur={onInputBlurred} required label="Ohjelmanumeron nimi"
          onChange={val => onChange(L.set('name', val, item))} />
        <MarkdownEditor label={t`eventProgramDescription`} value={item.description ?? ""} onChange={val => onChange(L.set('description', val, item))} />
        <Switch inline label={t`showInLists`} checked={item.showInLists} onChange={e => onChange(L.set('showInLists', (e.target as HTMLInputElement).checked, item))} />
      </>
  }

  return <Input value={name} onBlur={onInputBlurred} required label="Ohjelman kuvaus" labelStyle="hidden"
    onChange={val => onChange(L.set('name', val, item))} />
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

  return <tr className="eventProgramItem" tabIndex={0} onKeyDown={onKeyDown} ref={row}>
    <td>{t`intervalMusic`}</td>
    <td />
    <td>
      <DurationField label={t`intervalMusicDuration`} labelStyle="hidden"
        value={intervalMusicDuration}
        onBlur={onDurationBlurred}
        onChange={onSetIntervalMusicDuration}/>
    </td>
    <td>
      <Button title={t`remove`} intent="danger" icon="cross" onClick={() => onSetIntervalMusicDuration(0)} className="delete" />
    </td>
  </tr>
}

function DanceSetDuration({program, intervalMusicDuration}) {
  const {pause} = useContext(DurationHelperContext);
  const duration = program.map(({duration}) => duration ?? 0).reduce((y,x) => x+y, 0);
  const durationWithPauses = duration + pause*60*program.length + intervalMusicDuration;

  return <>
    <strong><Duration value={durationWithPauses}/></strong>{' ('+t`pausesIncluded`+') '}
    <br />
    <strong><Duration value={duration}/></strong>{' ('+t`dances`+')'}
  </>;
}

const SectionSelect = Select.ofType<{name: string}>();

function MoveDanceSetSelector({danceSets, currentSet, onSelect}) {
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
