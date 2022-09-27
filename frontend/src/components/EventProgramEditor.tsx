import './EventProgramEditor.sass';

import * as L from 'partial.lenses';

import {Card, Classes, HTMLTable, Icon, Intent} from "@blueprintjs/core";
import {DragHandle, ListEditor, ListEditorItems} from "./ListEditor";
import React, {createContext, useContext, useMemo, useState, useRef} from 'react';

import {DanceChooser} from "components/widgets/DanceChooser";
import {Duration} from "components/widgets/Duration";
import {DurationField} from "components/widgets/DurationField";
import {Switch, Button, ClickToEdit, Input} from "libraries/forms";
import {ProgramPauseDurationEditor} from "components/widgets/ProgramPauseDurationEditor";
import {MarkdownEditor} from 'components/MarkdownEditor';
import {makeTranslate} from 'utils/translate';
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {bind, useHotkeyHandler} from 'utils/useHotkeyHandler';
import {useRedirectKeyDownTo} from 'utils/useRedirectKeyDownTo';
import {navigateAmongSiblings, moveUp, moveDown, blurTo, focusTo, clickInParent} from 'utils/keyboardNavigation';
import {focusLater, focusSiblingsOrParent} from 'utils/focus';

const t = makeTranslate({
  addEntry: 'Lisää',
  addEntryTitle: 'Lisää ohjelmaa',
  introductoryInformation: 'Alkutiedotukset',
  programListIsEmpty: 'Ei ohjelmaa',
  Dance: 'Tanssi',
  RequestedDance: 'Toivetanssi',
  EventProgram: 'Muu ohjelma',
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
  remove: 'Poista',
  danceProgramIsEmpty: 'Ei tanssiohjelmaa.',
  danceSetName: 'Tanssisetin nimi'
});

const DEFAULT_INTERVAL_MUSIC_DURATION = 15*60;
const DurationHelperContext = createContext({
  pause: 0, setPause: (p : number) => {}
});

export function EventProgramEditor({program, onChange}) {
  const {danceSets = [], introductions = []} = program ?? {};
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
      L.set(['introductions', L.defaults([]), L.appendTo], {__typename: 'EventProgram', name: ''})
    );
    focusLater('.eventProgramEditor .danceset:first-child tbody tr:last-child');
  }
  function addDanceSet() {
    onChange(
      L.set(['danceSets', L.defaults([]), L.appendTo], newDanceSet(danceSets))
    );
    focusLater('.eventProgramEditor .danceset:last-child');
  }

  const durationContext = useMemo(() => ({pause, setPause}), [pause]);
  const onChangeFor = useOnChangeForProp(onChange);

  return <DurationHelperContext.Provider value={durationContext}>
    <section className="eventProgramEditor" ref={element} onKeyDown={onKeyDown}>
      <div style={{textAlign: 'right'}}>
        {introductions.length === 0 && <Button text={t`addIntroductoryInfo`} onClick={addIntroductoryInfo} className="addIntroductoryInfo" />}
        <ProgramPauseDurationEditor {...{pause, setPause}} />
      </div>
      <ListEditor items={danceSets} onChange={onChangeFor('danceSets')}>
        { introductions.length > 0 &&
          <IntroductoryInformation infos={introductions} onChange={onChangeFor('introductions')} />
        }
        <ListEditorItems noWrapper component={DanceSetEditor} />
      </ListEditor>
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
    name: t`danceSet` + " " + danceSetNumber,
    program: dances,
    intervalMusicDuration: DEFAULT_INTERVAL_MUSIC_DURATION
  }
}

function IntroductoryInformation({infos, onChange}) {
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    focusTo('tbody tr'),
    bind('i', clickInParent('div.danceset', 'button.addInfo')),
  );
  return <Card className="danceset" tabIndex={0} onKeyDown={onKeyDown}>
    <t.h2>introductoryInformation</t.h2>
    <ProgramListEditor program={infos} onChange={onChange} isIntroductionsSection intervalMusicDuration={0} onSetIntervalMusicDuration={() => {}}/>
  </Card>;
}

function DanceSetEditor({item, onChange, onRemove, onMoveDown, onMoveUp, itemIndex, ...props}) {
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    focusTo('tbody tr'),
    blurTo('body'),
    moveUp(onMoveUp),
    moveDown(onMoveDown),
    bind(['a', 'd'], clickInParent('div.danceset', 'button.addDance')),
    bind('i', clickInParent('div.danceset', 'button.addInfo')),
    bind(['delete', 'backspace'], removeDanceSet)
  );
  function removeDanceSet(e) {
    onRemove();
    focusSiblingsOrParent(e.target, 'section.eventProgramEditor');
  }
  const onChangeFor = useOnChangeForProp(onChange);
  const {name, program, intervalMusicDuration} = item;

  return <Card className="danceset" {...props} onKeyDown={onKeyDown} >
    <h2>
      <ClickToEdit labelStyle="hidden" label={t`danceSetName`} value={name} onChange={onChangeFor('name')} required />
      <Button className="delete" intent={Intent.DANGER} text={t`removeDanceSet`} onClick={removeDanceSet} />
    </h2>
    <ProgramListEditor isIntroductionsSection={false} program={program} onChange={onChangeFor('program')}
      intervalMusicDuration={intervalMusicDuration}
      onSetIntervalMusicDuration={onChangeFor('intervalMusicDuration')}/>
  </Card>;
};

function ProgramListEditor({program, onChange, intervalMusicDuration, onSetIntervalMusicDuration, isIntroductionsSection}) {
  const table = useRef<HTMLTableElement>(null);
  function addItem(__typename, other = {}) {
    onChange(L.set(L.appendTo, {__typename, ...other}, program));
    focusLater('tbody tr:last-child', table.current);
  }

  return <ListEditor items={program} onChange={onChange}>
    <HTMLTable condensed bordered striped className="danceSet" elementRef={table}>
      {program.length === 0 ||
          <thead>
            <tr>
              <th><Icon icon="move"/></th>
              <t.th>type</t.th><t.th>name</t.th><t.th>duration</t.th><t.th>remove</t.th>
            </tr>
          </thead>
      }
      <tbody>
        <ListEditorItems noWrapper component={ProgramItemEditor} />
        {program.length === 0 &&
            <tr>
              <t.td className={Classes.TEXT_MUTED+ " noProgram"} colSpan="5">programListIsEmpty</t.td>
            </tr>
        }
        {intervalMusicDuration > 0 && 
            <IntervalMusicEditor intervalMusicDuration={intervalMusicDuration} onSetIntervalMusicDuration={onSetIntervalMusicDuration} />}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3}>
            {isIntroductionsSection || <Button text={t`addDance`} onClick={() => addItem('RequestedDance')} className="addDance" />}
            <Button text={isIntroductionsSection ? t`addIntroductoryInfo` : t`addInfo`} onClick={() => addItem('EventProgram', {name: ''})} className="addInfo" />
            {" "}
            {isIntroductionsSection || 
                <Switch inline label={t`intervalMusicAtEndOfSet`} checked={intervalMusicDuration > 0}
                  onChange={e => onSetIntervalMusicDuration((e.target as HTMLInputElement).checked ? DEFAULT_INTERVAL_MUSIC_DURATION : 0) }/>}
          </td>
          <td colSpan={2}>
            <DanceSetDuration program={program} intervalMusicDuration={intervalMusicDuration} />
          </td>
        </tr>
      </tfoot>
    </HTMLTable>
  </ListEditor>;
}

function ProgramItemEditor({item, onChange, onRemove, onAdd, onMoveDown, onMoveUp, ...props}) {
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

  return <tr {...props} onKeyDown={onKeyDown} ref={container}>
    <td><DragHandle tabIndex={-1}/></td>
    <td>{t(__typename)}</td>
    <td>
      <ProgramDetailsEditor item={item} onChange={onChange} onInputBlurred={onInputBlurred} />
    </td>
    <td>
      <Duration value={item.duration} />
    </td>
    <td>
      <Button intent={Intent.DANGER} text="X" onClick={removeItem} className="delete" />
    </td>
  </tr>;
}

function ProgramDetailsEditor({item, onInputBlurred, onChange}) {
  const {__typename, name, _id} = item;

  switch(__typename) {
    case 'Dance':
    case 'RequestedDance':
    return <DanceChooser value={item ? {_id, name} : null} onBlur={onInputBlurred}
      allowEmpty emptyText={t`RequestedDance`}
      onChange={dance=> onChange(dance ? {__typename: 'Dance', ...dance} : {__typename: 'RequestedDance'})} />
    case 'EventProgram':
      return <>
        <Input value={name} onBlur={onInputBlurred} required label="Ohjelmanumeron nimi"
          onChange={val => onChange(L.set('name', val, item))} />
        <MarkdownEditor label="Ohjelman kuvaus" value={item.description ?? ""} onChange={val => onChange(L.set('description', val, item))} />
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

  return <tr tabIndex={0} onKeyDown={onKeyDown} ref={row}>
    <td><Button icon="move" disabled/></td>
    <td>{t`intervalMusic`}</td>
    <td />
    <td>
      <DurationField label={t`intervalMusicDuration`} labelStyle="hidden"
        value={intervalMusicDuration}
        onBlur={onDurationBlurred}
        onChange={onSetIntervalMusicDuration}/>
    </td>
    <td>
      <Button intent={Intent.DANGER} text="X" onClick={() => onSetIntervalMusicDuration(0)} className="delete" />
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

