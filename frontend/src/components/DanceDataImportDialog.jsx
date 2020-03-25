import React, {useState, useEffect} from 'react';
import {Tag, ProgressBar, FormGroup, Dialog, Button, Intent, Classes} from "@blueprintjs/core";
import {MarkdownEditor} from 'components/MarkdownEditor';
import {Form, Input, SubmitButton} from "libraries/forms";
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {getDanceData} from 'libraries/danceWiki';

export function DanceDataImportButton({onImport, dance, text, asko, ...props}) {
  const [isOpen, setOpen] = useState(false || asko);

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
    setImportedData(data);
    if (data.instructions && !dance.instructions) setDance({...dance, instructions: data.instructions});
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
  const [error, setError] = useState(null);

  function importData() {
    setLoading(true);
    getDanceData(search)
      .then(onImport)
      .catch(setError)
      .finally(() => setLoading(false));
  }

  return <FormGroup label="Hae tanssi nimellä" inline>
    <Input value={search} onChange={setSearch} />
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
    <p>Tanssiohje</p>
    <MarkdownEditor value={dance.instructions} onChange={onChangeFor('instructions')} />
  </>;
}

function Suggestions({values, onSuggest}) {
  return <FormGroup label="Kategoriaehdotukset wikistä">
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