import React, {useState} from 'react';
import {Dialog, Button, Classes, FileInput, Intent} from "@blueprintjs/core";
import {DanceEditor} from "./DanceEditor"

const EMPTY_DANCE = {name: 'Uusi tanssi'};

export function CreateDanceDialog({isOpen, onClose, onCreate}) {
  const [dance, setDance] = useState(EMPTY_DANCE);
  const hasError = dance.name.trim() === "";

  function save() {
    onCreate(dance).then(() => {setDance(EMPTY_DANCE); onClose(); });
  }

  return <Dialog isOpen={isOpen} onClose={onClose} title="Uusi tanssi">
    <div className={Classes.DIALOG_BODY}>
      <DanceUploader onUpload={setDance} />
      <DanceEditor key={dance} dance={dance} onChange={setDance} />
    </div>
    <div className={Classes.DIALOG_FOOTER}>
      <Button text="Peruuta" onClick={onClose} />
      <Button intent={Intent.PRIMARY} text="Tallenna"
        onClick={save} disabled={hasError}/>
    </div>
  </Dialog>;
}

function DanceUploader({onUpload}) {
  const [fileName, setFileName] = useState();

  function processFileData(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    let danceData = {
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

function decodeAudioData(buffer) {
  return new Promise(function(resolve, reject) {
    const ctx = new AudioContext();
    ctx.decodeAudioData(buffer, resolve, reject);
  });
}
