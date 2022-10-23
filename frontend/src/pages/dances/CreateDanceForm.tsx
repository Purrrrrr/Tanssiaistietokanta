import React, {useState} from 'react'

import {SubmitButton} from 'libraries/forms2'
import {Button, H2} from 'libraries/ui'
import {DanceDataImportButton} from 'components/DanceDataImportDialog'
import { Flex } from 'components/Flex'
import {uploadDanceFile} from 'utils/uploadDanceFile'

import {DanceInput} from 'types'

import {DanceEditor} from './DanceEditor'

export function CreateDanceForm({onCreate, onCancel, initialData}) {
  const [dance, setDance] = useState(initialData ?? {name: ''})

  return <section>
    <Flex alignItems="end">
      <H2 className="flex-fill">Uusi tanssi</H2>
      <DanceDataImportButton text="Hae tietoja tanssiwikistä"
        dance={dance}
        onImport={setDance}
      />
    </Flex>
    <DanceEditor dance={dance} onChange={setDance} onSubmit={() => onCreate(dance)}
      bottomToolbar={
        <div>
          <Button text="Peruuta" onClick={onCancel} />
          <SubmitButton text="Tallenna" />
        </div>
      }
    />
  </section>
}

export function DanceUploader({onUpload} : {onUpload: (d: DanceInput) => unknown}) {
  async function chooseFile() {
    const dance = await uploadDanceFile()
    if (dance) onUpload(dance)
  }

  return <Button text="Tuo tanssi tiedostosta" onClick={chooseFile}/>
}
