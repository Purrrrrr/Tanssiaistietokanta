import React, {useState, createContext, useContext} from 'react';
import produce from 'immer'
import {Classes, Icon, Card, HTMLTable, Button, Intent} from "@blueprintjs/core";

import {PropertyEditor, required} from "./widgets/PropertyEditor";
import {DanceChooser} from "components/widgets/DanceChooser";
import {Duration} from "components/widgets/Duration";
import {ProgramPauseDurationEditor} from "components/widgets/ProgramPauseDurationEditor";
import {ListEditor, ListEditorItems, DragHandle} from "./ListEditor";
import {makeTranslate} from 'utils/translate';
import programToSections from 'utils/programToSections';
import {scrollToBottom} from 'utils/scrollToBottom';

import './EventProgramEditor.sass';

const t = makeTranslate({
  addEntry: 'Lisää',
  addEntryTitle: 'Lisää ohjelmaa',
  introductionSection: 'Alkutiedotukset',
  programListIsEmpty: 'Ei ohjelmaa',
  DANCE: 'Tanssi',
  TEXT: 'Muu ohjelma',
  removeSection: 'Poista setti',
  addSection: 'Lisää tanssisetti',
  section: 'Setti',
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
  programIsEmpty: 'Ei ohjelmaa. Lisää ohjelmaa alla olevista napeista.'
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
    onChange(flattenSections([...sections, newSection(sections)]));
    scrollToBottom();
  }

  return <DurationHelperContext.Provider value={{pause, setPause, intervalPause, setIntervalPause}}>
    <section className="eventProgramEditor">
      <div style={{textAlign: 'right'}}>
        <ProgramPauseDurationEditor {...{pause, setPause, intervalPause, setIntervalPause}} />
      </div>
      <ListEditor items={sections} onChange={newSections => onChange(flattenSections(newSections))}
        itemWrapper={SectionElement} component={SectionEditor} />
      {sections.length === 0 && <t.p>programIsEmpty</t.p>}
      <div className="addSectionButtons">
        <Button text={t`addSection`} onClick={addSection} />
        {sections.length === 0 && <Button text={t`addIntroductoryInfo`} onClick={addInfo} />}
      </div>
    </section>
  </DurationHelperContext.Provider>;
};

const SectionElement = (props) => <Card className="danceset" {...props} />

function newSection(sections) {
  const hasIntroSection = sections.length > 0 && sections[0].isIntroHeader;
  const sectionNumber = sections.length + (hasIntroSection ? 0 : 1);
  const dances = Array.from({length: 6}, () => ({type: 'DANCE'}));
  return {
    type: 'HEADER',
    name: t`section` + " " + sectionNumber,
    tracks: dances,
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
          <Button className="delete" intent={Intent.DANGER} text={t`removeSection`} onClick={onRemove} />
      }
    </h2>
    <ListEditor items={program} onChange={(tracks) => onChange({...item, tracks})}>
      <HTMLTable condensed bordered striped className="danceSet">
        <thead>
          <tr>
            <th><Icon icon="move"/></th>
            <t.th>type</t.th><t.th>name</t.th><t.th>duration</t.th><t.th>remove</t.th>
          </tr>
        </thead>
        <tbody>
          <ListEditorItems itemWrapper="tr" component={ProgramItemEditor} />
          {program.length === 0 &&
              <tr>
                <t.td className={Classes.TEXT_MUTED} colSpan="4">programListIsEmpty</t.td>
              </tr>}
        </tbody>
        <DurationFooter program={program} />
      </HTMLTable>
      <div className="editSectionButtons">
        {item.isIntroHeader || <Button text={t`addDance`} onClick={() => addItem('DANCE')} />}
        <Button text={item.isIntroHeader ? t`addIntroductoryInfo` : t`addInfo`} onClick={() => addItem('TEXT')} />
      </div>
      
    </ListEditor>
  </>;
}

function ProgramItemEditor({item, onChange, onRemove, onAdd}) {
  return <>
    <td><DragHandle /></td>
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
  const durationWithPauses = duration + pause*60*program.length + intervalPause*60;

  return <tfoot>
    <tr>
      <t.th colSpan="2">duration</t.th>
      <td colSpan="2">
        <strong><Duration value={durationWithPauses}/></strong>{' ('+t`pausesIncluded`+') '}
        <br />
        <strong><Duration value={duration}/></strong>{' ('+t`dances`+')'}
      </td>
    </tr>
  </tfoot>
}

function flattenSections(sections) {
  return sections.flatMap(({tracks, ...section}) => [
    {...section},
    ...tracks
  ]).filter((item) => !item.isIntroHeader)
}
