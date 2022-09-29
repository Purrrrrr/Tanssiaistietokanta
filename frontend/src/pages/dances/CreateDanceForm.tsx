import React, {useState} from 'react';
import {DanceDataImportButton} from "components/DanceDataImportDialog";
import {Button, H2} from "libraries/ui";
import {Form, SubmitButton} from "libraries/forms";
import {DanceEditor} from "./DanceEditor"
import {Dance} from "services/dances";
import {uploadDanceFile} from "utils/uploadDanceFile";
import { Flex } from 'components/Flex';

export function CreateDanceForm({onCreate, onCancel, initialData}) {
  const [dance, setDance] = useState(initialData ?? {name: ''});

  return <section>
    <Flex alignItems="end">
      <H2 className="flex-fill">Uusi tanssi</H2>
      <DanceDataImportButton text="Hae tietoja tanssiwikistä"
        dance={dance}
        onImport={setDance}
      />
    </Flex>
    <Form onSubmit={() => onCreate(dance)}>
      <DanceEditor dance={dance} onChange={setDance} />
      <div>
        <Button text="Peruuta" onClick={onCancel} />
        <SubmitButton text="Tallenna" />
      </div>
    </Form>
  </section>
}

export function DanceUploader({onUpload} : {onUpload: (d: Dance) => any}) {
  async function chooseFile() {
    const dance = await uploadDanceFile();
    if (dance) onUpload(dance);
  }

  return <Button text="Tuo tanssi tiedostosta" onClick={chooseFile}/>;
}
