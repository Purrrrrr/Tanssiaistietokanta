import React, {useState} from 'react';
import {Dialog, Button, Classes, FileInput} from "@blueprintjs/core";
import {Form, SubmitButton} from "libraries/forms";
import {DanceEditor} from "./DanceEditor"
import {Dance} from "services/dances";

const EMPTY_DANCE : Dance = {name: 'Uusi tanssi'};

export function CreateDanceDialog({isOpen, onClose, onCreate}) {
  const [dance, setDance] = useState(EMPTY_DANCE);
  function save() {
    onCreate(dance).then(() => {setDance(EMPTY_DANCE); onClose(); });
  }

  return <Dialog isOpen={isOpen} onClose={onClose} title="Uusi tanssi"
    style={{minWidth: 600, width: 'auto', maxWidth: '80%'}}
  >
    <Form onSubmit={save}>
      <div className={Classes.DIALOG_BODY}>
        <DanceUploader onUpload={setDance} />
        <DanceEditor dance={dance} onChange={setDance} />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <Button text="Peruuta" onClick={onClose} />
        <SubmitButton text="Tallenna" />
      </div>
    </Form>
  </Dialog>;
}

function DanceUploader({onUpload} : {onUpload: (d: Dance) => any}) {
  const [fileName, setFileName] = useState();

  function processFileData(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    let danceData : Dance = {
      name: stripExtension(file.name)
    };

    onUpload(danceData);

    readFile(file).then(decodeAudioData).then(({duration}) => {
      danceData = {...danceData, duration};
      onUpload(danceData);
    });
  }

  return <FileInput fill text={fileName} buttonText="Valitse" onInputChange={processFileData}/>;
}

function stripExtension(fileName) {
  return fileName.replace(/\.[^.]*$/, "");
}

function readFile(file) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();
    reader.onload = (data) => {
      resolve(reader.result);
    }
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function decodeAudioData(buffer) : Promise<{duration?: number}> {
  return new Promise(function(resolve, reject) {
    const ctx = new AudioContext();
    ctx.decodeAudioData(buffer, resolve, reject);
  });
}
