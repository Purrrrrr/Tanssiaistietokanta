import React, {useState, useRef, useCallback} from 'react';
import {usePatchDance} from 'services/dances';
import {Button, Switch} from "libraries/forms";
import {backendQueryHook} from "backend";
import {LoadingState} from 'components/LoadingState';
import {EditableMarkdown} from 'components/EditableMarkdown';
import {DanceDataImportButton} from "components/DanceDataImportDialog";
import PrintViewToolbar from 'components/widgets/PrintViewToolbar';
import {makeTranslate} from 'utils/translate';
import {selectElement} from 'utils/selectElement';
import {showToast} from "utils/toaster"

import './DanceInstructions.sass';

const t = makeTranslate({
  fetchDataFromWiki: 'Hae tietoja tanssiwikistä',
  clickInstructionsToEdit: 'Klikkaa ohjetta muokataksesi sitä, voit myös hakea tietoja tanssiwikistä klikkaamalla nappeja, jotka avautuvat kun tuot hiiren tanssin päälle. Kun ohjeet ovat mieleisesi, voit joko tulostaa tämän sivun tai valita ohjetekstit ja kopioida ne haluamaasi tekstinkäsittelyohjelmaan.',
  defaultStylingDescription: 'Ohjeissa on oletustyyli, jossa ensimmäinen kappale on kursivoitu. Tämän tarkoituksena on eritellä tanssin ja tanssikuvion lyhyt kuvaus lopusta ohjeesta ilman tilaa vievää otsikointia.',
  selectAndCopy: 'Kopioi ohjeet leikepöydälle',
  instructionsCopied: 'Ohjeet kopioitu',
  print: 'Tulosta',
  showWorkshops: 'Näytä työpajojen kuvaukset',
  workshops: 'Työpajat',
  dances: 'Tanssit',
  danceInstructions: 'Tanssiohjeet',
});

const useDanceInstructions= backendQueryHook(`
query DanceInstructions($eventId: ID!) {
  event(id: $eventId) {
    _id
    workshops {
      _id
      name
      description
      dances {
        _id
        name
        instructions
        formation
        category
      }
    }
  }
}`);

export default function DanceInstructions({eventId}) {
  const {data, refetch, ...loadingState} = useDanceInstructions({eventId});
  const dancesEl = useRef<HTMLElement>(null);
  const [showWorkshops, setShowWorkshops] = useState(true);

  if (!data) return <LoadingState {...loadingState} refetch={refetch} />;

  const {workshops} = data.event
  const dances = getDances(workshops);

  function selectAndCopy() {
    selectElement(dancesEl.current);
    document.execCommand("copy");
    showToast({message: t`instructionsCopied`})
    window.getSelection()?.removeAllRanges();
  }

  return <>
    <PrintViewToolbar maxHeight={180}>
      <t.p>clickInstructionsToEdit</t.p>
      <t.p>defaultStylingDescription</t.p>
      <p>
        <Switch inline label={t`showWorkshops`} checked={showWorkshops} onChange={e => {
          setShowWorkshops((e.target as HTMLInputElement).checked);
        }}/>
        <Button text={t`selectAndCopy`} onClick={selectAndCopy}/>
        <Button text={t`print`} onClick={() => window.print()} />
      </p>
    </PrintViewToolbar>
    <section className="dance-instructions" ref={dancesEl}>
      {showWorkshops && 
        <>
        <t.h1>workshops</t.h1>
        {workshops.map(workshop => <Workshop key={workshop._id} workshop={workshop} />)}
        </>
      }
      <t.h1>danceInstructions</t.h1>

      {dances.map(dance => <Dance key={dance._id} dance={dance} />)}
    </section>
    </>
}

function getDances(workshops) {
  const dances = workshops.flatMap(w => w.dances);
  dances.sort((a,b) => a.name.localeCompare(b.name));
  return dances;
}

function Dance({dance}) {
  const [patchDance] = usePatchDance();
  const onChange = useCallback(
    (instructions) => patchDance({
      _id: dance._id,
      instructions,
    }),
    [dance, patchDance]
  )

  const {name, instructions} = dance;

  return <div tabIndex={0} className="dance-instructions-dance">
    <h2>
      {name}
      {' '}
      <DanceDataImportButton text={t`fetchDataFromWiki`} dance={dance} />
    </h2>
    <EditableMarkdown label="" value={instructions} onChange={onChange}
      overrides={markdownOverrides} plain maxHeight={undefined} />
  </div>
}

const markdownOverrides = {
  h1: { component: 'h2'},
  h2: { component: 'h3'},
  h3: { component: 'h4'},
  h4: { component: 'h5'},
  h5: { component: 'h6'},
  a: { component: 'span' }
};

function Workshop({workshop}) {
  const {name, description, dances} = workshop;

  return <div className="workshop">
    <h2>
      {name}
    </h2>
    <p className="description">{description}</p>
    <p>{t`dances`}: {dances.map(d => d.name).join(", ")}</p>
  </div>
}
