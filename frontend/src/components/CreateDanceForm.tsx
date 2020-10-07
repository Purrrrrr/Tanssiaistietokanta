import React, {useState} from 'react';
import {Button, FileInput} from "@blueprintjs/core";
import {Form, SubmitButton} from "libraries/forms";
import {DanceEditor} from "./DanceEditor"
import {Dance} from "services/dances";

const EMPTY_DANCE : Dance = {name: 'Uusi tanssi'};

export function CreateDanceForm({onCreate, onCancel}) {
  const [dance, setDance] = useState(EMPTY_DANCE);

  return <Form onSubmit={() => onCreate(dance)}>
    <DanceUploader onUpload={setDance} />
    <DanceEditor dance={dance} onChange={setDance} />
    <div>
      <Button text="Peruuta" onClick={onCancel} />
      <SubmitButton text="Tallenna" />
    </div>
  </Form>;
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
