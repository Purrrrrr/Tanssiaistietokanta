import './EventProgramEditor.sass';

import * as L from 'partial.lenses';

import {Button, Card, Classes, HTMLTable, Icon, Intent} from "@blueprintjs/core";
import {DragHandle, ListEditor, ListEditorItems} from "./ListEditor";
import {PropertyEditor, required} from "./widgets/PropertyEditor";
import React, {createContext, useContext, useState} from 'react';

import {DanceChooser} from "components/widgets/DanceChooser";
import {Duration} from "components/widgets/Duration";
import {ProgramPauseDurationEditor} from "components/widgets/ProgramPauseDurationEditor";
import {makeTranslate} from 'utils/translate';
import {scrollToBottom} from 'utils/scrollToBottom';

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

export function EventProgramEditor({program = {}, onChange}) {
program = program ?? {};
const {danceSets = [], introductions = []} = program;
const [pause, setPause] = useState(3);
const [intervalPause, setIntervalPause] = useState(15);

function addIntroductoryInfo() {
  onChange(
    L.set(['introductions', L.defaults([]), L.appendTo], {__typename: 'OtherProgram', name: ''})
  );
}
function addDanceSet() {
  onChange(
    L.set(['danceSets', L.defaults([]), L.appendTo], newDanceSet(danceSets))
  );
  scrollToBottom();
}

return <DurationHelperContext.Provider value={{pause, setPause, intervalPause, setIntervalPause}}>
  <section className="eventProgramEditor">
    <div style={{textAlign: 'right'}}>
      {introductions.length === 0 && <Button text={t`addIntroductoryInfo`} onClick={addIntroductoryInfo} />}
      <ProgramPauseDurationEditor {...{pause, setPause, intervalPause, setIntervalPause}} />
    </div>

    { introductions.length > 0 &&
      <IntroductoryInformation infos={introductions} onChange={introductions => onChange({...program, introductions})} />
    }
    <ListEditor items={danceSets} onChange={newSets => onChange({...program, danceSets: newSets})}
      itemWrapper={DanceSetElement} component={DanceSetEditor} />
    <div className="addDanceSetButtons">
      {danceSets.length === 0 && t`danceProgramIsEmpty`}
      <Button text={t`addDanceSet`} onClick={addDanceSet} />
    </div>
  </section>
</DurationHelperContext.Provider>;
};

const DanceSetElement = (props) => <Card className="danceset" {...props} />

function newDanceSet(danceSets) {
const danceSetNumber = danceSets.length + 1;
const dances = Array.from({length: 6}, () => ({__typename: 'RequestedDance'}));
return {
  name: t`danceSet` + " " + danceSetNumber,
  program: dances,
}
}

function IntroductoryInformation({infos, onChange}) {
return <Card className="danceset">
  <t.h2>introductoryInformation</t.h2>
  <ProgramListEditor program={infos} onChange={onChange} isIntroductionsSection />
</Card>;
}

function DanceSetEditor({item, onChange, onRemove, itemIndex}) {
return <>
  <h2>
    <PropertyEditor property="name" data={item} onChange={onChange} validate={required('Täytä kenttä')}/>
    <Button className="delete" intent={Intent.DANGER} text={t`removeDanceSet`} onClick={onRemove} />
  </h2>
  <ProgramListEditor program={item.program} onChange={(program) => onChange({...item, program})} />
</>;
}

function ProgramListEditor({program, onChange, isIntroductionsSection}) {
  function addItem(__typename) {
    onChange(L.set(L.appendTo, {__typename}, program));
  }

  return <ListEditor items={program} onChange={onChange}>
    <HTMLTable condensed bordered striped className="danceSet">
      {program.length === 0 ||
          <thead>
            <tr>
              <th><Icon icon="move"/></th>
              <t.th>type</t.th><t.th>name</t.th><t.th>duration</t.th><t.th>remove</t.th>
            </tr>
          </thead>
      }
      <tbody>
        <ListEditorItems itemWrapper="tr" component={ProgramItemEditor} />
        {program.length === 0 &&
            <tr>
              <t.td className={Classes.TEXT_MUTED+ " noProgram"} colSpan="5">programListIsEmpty</t.td>
            </tr>
        }
      </tbody>
      <tfoot>
        <tr>
          <td colSpan="3" >
            {isIntroductionsSection || <Button text={t`addDance`} onClick={() => addItem('Dance')} />}
            <Button text={isIntroductionsSection ? t`addIntroductoryInfo` : t`addInfo`} onClick={() => addItem('OtherProgram')} />
          </td>
          <td colSpan="2">
            <DanceSetDuration program={program} />
          </td>
        </tr>
      </tfoot>
    </HTMLTable>
  </ListEditor>;
}

function ProgramItemEditor({item, onChange, onRemove, onAdd}) {
  const {__typename, name, _id} = item;
  const isDance = __typename === 'Dance' || __typename === 'RequestedDance';
  return <>
    <td><DragHandle /></td>
    <td>{t(__typename)}</td>
    <td>
      {isDance
          ? <DanceChooser value={{_id, name}}
            onChange={dance=> onChange(dance ? {__typename: 'Dance', ...dance} : {__typename: 'RequestedDance'})} />
          : <PropertyEditor alwaysEdit property="name" data={item} onChange={onChange} validate={required('Täytä kenttä')}/>
      }
    </td>
    <td>
      <Duration value={item.duration} />
    </td>
    <td>
      <Button intent={Intent.DANGER} text="X" onClick={onRemove} />
    </td>
  </>
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
