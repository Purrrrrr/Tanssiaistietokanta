import './EventProgramEditor.sass';

import * as L from 'partial.lenses';

import {InputGroup, Button, Card, Classes, HTMLTable, Icon, Intent} from "@blueprintjs/core";
import {DragHandle, ListEditor, ListEditorItems} from "./ListEditor";
import {PropertyEditor, required} from "./widgets/PropertyEditor";
import React, {createContext, useContext, useMemo, useState, useRef} from 'react';

import {DanceChooser} from "components/widgets/DanceChooser";
import {Duration} from "components/widgets/Duration";
import {ProgramPauseDurationEditor} from "components/widgets/ProgramPauseDurationEditor";
import {makeTranslate} from 'utils/translate';
import {usePropChange} from 'utils/usePropChange';
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
  OtherProgram: 'Muu ohjelma',
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
  intervalDuration: 'Taukomusiikki',
  minutes: 'min.',
  remove: 'Poista',
  danceProgramIsEmpty: 'Ei tanssiohjelmaa.'
});

const DurationHelperContext = createContext();

export function EventProgramEditor({program, onChange}) {
  const {danceSets = [], introductions = []} = program ?? {};
  const [pause, setPause] = useState(3);
  const [intervalPause, setIntervalPause] = useState(15);
  const element = useRef();
  useRedirectKeyDownTo(element);
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    bind(['a', 's'], addDanceSet),
    bind('i', addIntroductoryInfo),
  );

  function addIntroductoryInfo() {
    onChange(
      L.set(['introductions', L.defaults([]), L.appendTo], {__typename: 'OtherProgram', name: ''})
    );
    focusLater('.eventProgramEditor .danceset:first-child tbody tr:last-child');
  }
  function addDanceSet() {
    onChange(
      L.set(['danceSets', L.defaults([]), L.appendTo], newDanceSet(danceSets))
    );
    focusLater('.eventProgramEditor .danceset:last-child');
  }

  const durationContext = useMemo(() => ({pause, setPause, intervalPause, setIntervalPause}), [pause, intervalPause]);

  const onChangeDanceSets = usePropChange('danceSets', onChange);
  const onChangeIntroductions = usePropChange('introductions', onChange);

  return <DurationHelperContext.Provider value={durationContext}>
    <section className="eventProgramEditor" ref={element} onKeyDown={onKeyDown}>
      <div style={{textAlign: 'right'}}>
        {introductions.length === 0 && <Button text={t`addIntroductoryInfo`} onClick={addIntroductoryInfo} className="addIntroductoryInfo" />}
        <ProgramPauseDurationEditor {...{pause, setPause, intervalPause, setIntervalPause}} />
      </div>
      <ListEditor items={danceSets} onChange={onChangeDanceSets}>
        { introductions.length > 0 &&
          <IntroductoryInformation infos={introductions} onChange={onChangeIntroductions} />
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
  }
}

function IntroductoryInformation({infos, onChange}) {
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    focusTo('tbody tr'),
    bind('i', clickInParent('div.danceset', 'button.addInfo')),
  );
  return <Card className="danceset" tabIndex="0" onKeyDown={onKeyDown}>
    <t.h2>introductoryInformation</t.h2>
    <ProgramListEditor program={infos} onChange={onChange} isIntroductionsSection />
  </Card>;
}

function DanceSetEditor({item, onChange, onRemove, onMoveDown, onMoveUp, itemIndex, ...props}) {
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('div.danceset'),
    focusTo('tbody tr'),
    blurTo(),
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
  const changeProgram = usePropChange('program', onChange);

  return <Card className="danceset" {...props} onKeyDown={onKeyDown} >
    <h2>
      <PropertyEditor property="name" data={item} onChange={onChange} validate={required('Täytä kenttä')}/>
      <Button className="delete" intent={Intent.DANGER} text={t`removeDanceSet`} onClick={removeDanceSet} />
    </h2>
    <ProgramListEditor program={item.program} onChange={changeProgram} />
  </Card>;
};

function ProgramListEditor({program, onChange, isIntroductionsSection}) {
  const table = useRef();
  function addItem(__typename) {
    onChange(L.set(L.appendTo, {__typename}, program));
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
      </tbody>
      <tfoot>
        <tr>
          <td colSpan="3" >
            {isIntroductionsSection || <Button text={t`addDance`} onClick={() => addItem('RequestedDance')} className="addDance" />}
            <Button text={isIntroductionsSection ? t`addIntroductoryInfo` : t`addInfo`} onClick={() => addItem('OtherProgram')} className="addInfo" />
          </td>
          <td colSpan="2">
            <DanceSetDuration program={program} />
          </td>
        </tr>
      </tfoot>
    </HTMLTable>
  </ListEditor>;
}

function ProgramItemEditor({item, onChange, onRemove, onAdd, onMoveDown, onMoveUp, ...props}) {
  const {__typename, name, _id} = item;
  const isDance = __typename === 'Dance' || __typename === 'RequestedDance';
  const onBlur = e => e.target.closest('tr').focus();
  const onKeyDown = useHotkeyHandler(
    ...navigateAmongSiblings('tr'),
    moveUp(onMoveUp),
    moveDown(onMoveDown),
    blurTo('div.danceset'),
    focusTo('input'),
    bind(['delete', 'backspace'], removeItem)
  );

  function removeItem(e) {
    onRemove();
    focusSiblingsOrParent(e.target, 'div.danceset');
  }

  return <tr {...props} onKeyDown={onKeyDown} >
    <td><DragHandle /></td>
    <td>{t(__typename)}</td>
    <td>
      {isDance
          ? <DanceChooser value={{_id, name}} onBlur={onBlur}
            onChange={dance=> onChange(dance ? {__typename: 'Dance', ...dance} : {__typename: 'RequestedDance'})} />
          : <InputGroup value={name} onBlur={onBlur}
            onKeyDown={e => e.key === 'Escape' && e.target.blur()}
            onChange={e => onChange(L.set('name', e.target.value, item))} />
      }
    </td>
    <td>
      <Duration value={item.duration} />
    </td>
    <td>
      <Button intent={Intent.DANGER} text="X" onClick={removeItem} className="delete" />
    </td>
  </tr>;
}

function DanceSetDuration({program}) {
  const {pause, intervalPause} = useContext(DurationHelperContext);
  const duration = program.map(({duration}) => duration ?? 0).reduce((y,x) => x+y, 0);
  const durationWithPauses = duration + pause*60*program.length + intervalPause*60;

  return <>
    <strong><Duration value={durationWithPauses}/></strong>{' ('+t`pausesIncluded`+') '}
    <br />
    <strong><Duration value={duration}/></strong>{' ('+t`dances`+')'}
  </>;
}

