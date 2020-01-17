import React, {useState, createContext, useContext} from 'react';
import produce from 'immer'
import {HTMLTable, Button, Intent} from "@blueprintjs/core";

import {PropertyEditor, required} from "./widgets/PropertyEditor";
import {DanceChooser} from "components/widgets/DanceChooser";
import {Duration} from "components/widgets/Duration";
import {ProgramPauseDurationEditor} from "components/widgets/ProgramPauseDurationEditor";
import {ListEditor} from "./ListEditor";
import {makeTranslate} from 'utils/translate';
import programToSections from 'utils/programToSections';

const t = makeTranslate({
  addEntry: 'Lisää',
  addEntryTitle: 'Lisää ohjelmaa',
  introductionSection: 'Alkutiedotukset',
  programListIsEmpty: 'Ei ohjelmaa',
  DANCE: 'Tanssi',
  TEXT: 'Tiedote',
  removeSection: 'Poista osio',
  addSection: 'Lisää tanssisetti',
  section: 'Setti',
  addDance: 'Lisää tanssi',
  addInfo: 'Lisää tiedote',
  addIntroductoryInfo: 'Lisää alkutiedote',
  type: 'Tyyppi',
  name: 'Nimi',
  duration: 'Kesto',
  durationWithPauses: 'Kesto taukoineen',
  pauseDuration: 'Tanssien välinen tauko',
  intervalDuration: 'Taukomusiikki',
  minutes: 'min.',
  remove: 'Poista',
});

export function EventProgramEditor({event, onChange}) {
  return <ProgramEditor program={event.program || []} onChange={program => onChange({...event, program})} />;
}

const DurationHelperContext = createContext();

function ProgramEditor({program, onChange}) {
  const sections = programToSections(program);
  const [pause, setPause] = useState(3);
  const [intervalPause, setIntervalPause] = useState(15);

  function addInfo() {
    const info = {type: 'TEXT'};
    onChange(flattenSections(produce(sections, draft => {
      if (draft.length === 0 || draft[0].name !== '') {
        draft.unshift({
          type: 'HEADER',
          isIntroHeader: true,
          name: '',
          tracks: [],
        })
      }
      draft[0].tracks.push(info);
    })));
  }
  function addSection() {
    onChange([...program, newSection(sections)]);
  }

  return <DurationHelperContext.Provider value={{pause, setPause, intervalPause, setIntervalPause}}>
    <div style={{textAlign: 'right'}}>
      <ProgramPauseDurationEditor {...{pause, setPause, intervalPause, setIntervalPause}} />
      <Button text={t`addIntroductoryInfo`} onClick={addInfo} />
      <Button text={t`addSection`} onClick={addSection} />
    </div>
    <ListEditor items={sections} onChange={newSections => onChange(flattenSections(newSections))}
      component={SectionEditor} />
  </DurationHelperContext.Provider>;
};

function newSection(sections) {
  const hasIntroSection = sections.length > 0 && sections[0].isIntroHeader;
  const sectionNumber = sections.length + (hasIntroSection ? 0 : 1);
  return {
    type: 'HEADER',
    name: t`section` + " " + sectionNumber,
    tracks: [],
  }
}

function SectionEditor({item, onChange, onRemove, itemIndex}) {
  const program = item.tracks;
  function addItem(type) {
    onChange(produce(item, draft => {
      draft.tracks.push({ type });
    }));
  }

  return <>
    <h2>
      {item.isIntroHeader ?
          t`introductionSection` :
          <PropertyEditor property="name" data={item} onChange={onChange} validate={required('Täytä kenttä')}/>
      }
      {item.isIntroHeader ||
          <span style={{float: 'right'}}>
            <Button text={t`addDance`} onClick={() => addItem('DANCE')} />
            <Button text={t`addInfo`} onClick={() => addItem('TEXT')} />
            <Button intent={Intent.DANGER} text={t`removeSection`} onClick={onRemove} />
          </span>
      }
    </h2>
    <HTMLTable condensed bordered striped style={{width: '100%'}}>
      <thead>
        <tr>
          <t.th>type</t.th><t.th>name</t.th><t.th>duration</t.th><t.th>remove</t.th>
        </tr>
      </thead>
      <ListEditor items={program} onChange={(tracks) => onChange({...item, tracks})}
        element="tbody" rowElement="tr"
        component={ProgramItemEditor} />
      {program.length ? null : <tbody><tr><t.td className="bp3-text-muted" colSpan="4">programListIsEmpty</t.td></tr></tbody>}
      <DurationFooter program={program} />
    </HTMLTable>
  </>;
}

function ProgramItemEditor({item, onChange, onRemove, onAdd}) {
  return <>
    <td>{t(item.type)}</td>
    <td>
      {item.type === 'DANCE'
          ? <DanceChooser value={item.dance} onChange={dance => onChange({...item, dance, danceId: dance._id})} />
          : <PropertyEditor alwaysEdit property="name" data={item} onChange={onChange} validate={required('Täytä kenttä')}/>
      }
    </td>
    <td>
      {item.type === 'DANCE' && item.dance && <Duration value={item.dance.duration} />}
    </td>
    <td>
      <Button intent={Intent.DANGER} text="X" onClick={onRemove} />
    </td>
  </>
}

function DurationFooter({program}) {
  const {pause, intervalPause} = useContext(DurationHelperContext);
  const duration = program.map(({dance}) => dance?.duration ?? 0).reduce((y,x) => x+y, 0);
  if (duration === 0) return null;

  return <tfoot>
    <tr>
      <t.th colSpan="2">duration</t.th>
      <td><Duration value={duration}/></td>
    </tr>
    <tr>
      <t.th colSpan="2">durationWithPauses</t.th>
      <td><Duration value={duration + pause*60*program.length + intervalPause*60}/></td>
    </tr>
  </tfoot>
}

function flattenSections(sections) {
  return sections.flatMap(({tracks, ...section}) => [
    {...section},
    ...tracks
  ]).filter((item) => !item.isIntroHeader)
}
