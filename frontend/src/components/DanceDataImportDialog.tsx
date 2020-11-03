import React, {useState, useEffect} from 'react';
import {Tag, ProgressBar, FormGroup, Dialog, Intent, Classes} from "@blueprintjs/core";
import {MarkdownEditor} from 'components/MarkdownEditor';
import {DanceNameSearch} from 'components/DanceNameSearch';
import {Form, Button, Input, SubmitButton} from "libraries/forms";
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {getDanceData} from 'libraries/danceWiki';

export function DanceDataImportButton({onImport, dance, text, ...props}) {
  const [isOpen, setOpen] = useState(false);

  return <>
    <Button text={text} {...props} onClick={() => setOpen(true)} />
    <DanceDataImportDialog isOpen={isOpen} onClose={() => setOpen(false)}
      dance={dance} onImport={(data) => { setOpen(false); onImport(data); }}
    />
  </>
}

export function DanceDataImportDialog({dance: originalDance, isOpen, onClose, onImport}) {
  const [importedData, setImportedData] = useState(null);
  const [dance, setDance] = useState(originalDance);

  function reset() {
    setDance(originalDance);
    setImportedData(null);
  }
  useEffect(reset, [originalDance]);

  function importDone(data) {
    if (data.instructions && (!dance.instructions || dance.instructions.trim() === '')) {
      setDance({...dance, instructions: data.instructions});
    }
    setImportedData(data);
  }
  function save() {
    onImport(dance); reset();
  }
  function close() {
    onClose(); reset();
  }

  return <Dialog isOpen={isOpen} onClose={close} title="Hae tanssin tietoja tanssiwikistä" lazy
    style={{minWidth: 500, width: 'auto', maxWidth: '80%'}}>
    <Form onSubmit={save}>
      <div className={Classes.DIALOG_BODY}>
        <DataImporter dance={dance} onImport={importDone} />
        {importedData &&
            <ImportedDataView importedData={importedData} dance={dance} setDance={setDance} />}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <Button text="Peruuta" onClick={close} />
        <SubmitButton text="Tallenna" disabled={!importedData}/>
      </div>
    </Form>
  </Dialog>;
}

function DataImporter({dance, onImport}) {
  const [search, setSearch] = useState(dance.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{message: string} | null>(null);

  function importData() {
    setLoading(true);
    getDanceData(search)
      .then(onImport)
      .catch(setError)
      .finally(() => setLoading(false));
  }

  return <FormGroup label="Hae tanssi nimellä" inline>
    <DanceNameSearch value={search} onChange={setSearch} />
    <Button icon="search" intent={Intent.PRIMARY} onClick={importData} disabled={loading}/>
    {loading
        ? <div style={{margin: "10px 0px"}}>Ladataan tietoja...<ProgressBar /></div>
        : <p>Hae tietoja hakunapilla, jotta voit liittää niitä tietokantaan</p>}
    {error && <p>{error.message}</p>}
  </FormGroup>;
}

function ImportedDataView({dance, setDance, importedData}) {
  const onChangeFor = useOnChangeForProp(setDance);
  //const [instructions, setInstructions] = useState(importedData.instructions ?? '');

  return <>
    <Row>
      <RowItem>
        <Input label="Kategoria" value={dance.category ?? ""} onChange={onChangeFor('category')} />
      </RowItem>
      <RowItem>
        <Suggestions values={importedData.categories} onSuggest={onChangeFor('category')} />
      </RowItem>
    </Row>
    <Row>
      <RowItem>
        <Input label="Tanssikuvio" value={dance.formation ?? ""} onChange={onChangeFor('formation')} />
      </RowItem>
      <RowItem>
        <Suggestions values={importedData.formations} onSuggest={onChangeFor('formation')} />
      </RowItem>
    </Row>
    <InstructionEditor value={dance.instructions} onChange={onChangeFor('instructions')} importedInstructions={importedData.instructions} />

  </>;
}

function Suggestions({values, onSuggest}) {
  return <FormGroup label="Ehdotukset wikistä">
      {values.length === 0 && 'Ei ehdotuksia'}
      {values.map(value =>
        <React.Fragment key={value}>
          <Tag large interactive intent={Intent.SUCCESS} 
            onClick={() => onSuggest(value)}>
            {value}
          </Tag>
          {' '}
        </React.Fragment>
      )}
  </FormGroup>;
}

function Row({children}) {
  return <div style={{display: 'flex'}}>{children}</div>;
}
function RowItem({children}) {
  return <div style={{margin: '0 5px'}}>{children}</div>;
}

function InstructionEditor({value, onChange, importedInstructions}) {
  const [useDiffing, setUseDiffing] = useState(value !== importedInstructions);

  return <>
    <p>Tanssiohje</p>
    {useDiffing
      ? <DiffingInstructionEditor value={value} onChange={onChange} 
          importedInstructions={importedInstructions}
          onResolve={(value) => { setUseDiffing(false); onChange(value); }}/>
      : <MarkdownEditor value={value} onChange={onChange} />
    }
  </>;

}

function DiffingInstructionEditor({value, onChange, importedInstructions, onResolve}) {
  const [imported, setImported] = useState(importedInstructions);
  useEffect(() => setImported(importedInstructions), [importedInstructions]);

  return <Row>
    <RowItem>
      <p>Tietokannassa oleva versio</p>
      <MarkdownEditor value={value} onChange={onChange} />
      <Button text="Käytä tätä versiota" onClick={() => onResolve(value)} />
    </RowItem>
    <RowItem>
      <p>Tanssiwikin versio</p>
      <MarkdownEditor value={imported} onChange={setImported} />
      <Button text="Käytä tätä versiota" onClick={() => onResolve(imported)} />
    </RowItem>
  </Row>;
}
