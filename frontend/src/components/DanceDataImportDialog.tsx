import React, {useEffect, useState} from 'react'

import {usePatchDance} from 'services/dances'

import {getDanceData, ImportedDanceData} from 'libraries/danceWiki'
import {Dialog} from 'libraries/dialog'
import {formFor, MarkdownEditor, SubmitButton} from 'libraries/forms'
import {Button, FormGroup, ProgressBar, Tag} from 'libraries/ui'
import { useT, useTranslation } from 'i18n'

import {Dance} from 'types'

import {DanceNameSearch} from './DanceNameSearch'

interface DanceDataImportButtonProps {
  onImport?: (dance: Dance) => unknown,
  dance: Dance,
}

interface ImporterState extends Dance {
  importedData?: ImportedDanceData
}

const {
  Form,
  Field,
  Input,
  useValueAt,
  useOnChangeFor,
} = formFor<ImporterState>()

export function DanceDataImportButton({onImport, dance, ...props} : DanceDataImportButtonProps) {
  const [isOpen, setOpen] = useState(false)
  const text = useTranslation('components.danceDataImportButton.fetchInfoFromWiki')
  const [patch] = usePatchDance()
  const handleImport = ({ importedData: _ignore, ...data} : ImporterState) => {
    if (onImport) {
      onImport(data)
      return
    }
    const {_id, source, description, category, formation, instructions} = data
    patch({
      id: _id,
      dance: {
        category,
        formation,
        source,
        description,
        instructions
      },
    })
  }

  return <>
    <Button text={text} {...props} onClick={() => setOpen(true)} />
    <DanceDataImportDialog isOpen={isOpen} onClose={() => setOpen(false)}
      dance={dance} onImport={(data: ImporterState) => { setOpen(false); handleImport(data) }}
    />
  </>
}

export function DanceDataImportDialog({dance: originalDance, isOpen, onClose, onImport}) {
  const [dance, setDance] = useState<ImporterState>(originalDance)
  const [importNr, setImportNr] = useState(0)

  function reset() {
    setDance(originalDance)
  }
  useEffect(reset, [originalDance])

  function importDone(importedData) {
    if (importedData.instructions && (!dance.instructions || dance.instructions.trim() === '')) {
      setDance({...dance, instructions: importedData.instructions, importedData})
    } else {
      setDance({...dance, importedData})
    }
    setImportNr(importNr+1)
  }
  function save() {
    onImport(dance); reset()
  }
  function close() {
    onClose(); reset()
  }

  return <Dialog isOpen={isOpen} onClose={close} title={useTranslation('components.danceDataImportButton.dialogTitle')}
    closeButtonLabel={useTranslation('common.close')}
    style={{minWidth: 500, width: 'auto', maxWidth: '80%'}}>
    <Form value={dance} onChange={setDance} onSubmit={save}>
      <Dialog.Body>
        <DataImporter danceName={dance.name} onImport={importDone} />
        {dance.importedData && <ImportedDataView key={importNr} />}
      </Dialog.Body>
      <Dialog.Footer>
        <Button text={useTranslation('common.cancel')} onClick={close} />
        <SubmitButton text={useTranslation('common.save')} disabled={!dance.importedData}/>
      </Dialog.Footer>
    </Form>
  </Dialog>
}

function DataImporter({danceName, onImport}) {
  const t = useT('components.danceDataImportButton')
  const [search, setSearch] = useState(danceName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{message: string} | null>(null)

  function importData() {
    setLoading(true)
    getDanceData(search)
      .then(onImport)
      .catch(setError)
      .finally(() => setLoading(false))
  }

  return <FormGroup label={t('searchDanceByName')} inline>
    <DanceNameSearch value={search} onChange={setSearch} />
    <Button icon="search" intent="primary" onClick={importData} disabled={loading}/>
    {loading
      ? <div style={{margin: '10px 0px'}}>{t('loadingData')}<ProgressBar /></div>
      : <p>{t('searchHelp')}</p>}
    {error && <p>{error.message}</p>}
  </FormGroup>
}

function ImportedDataView() {
  const importedData = useValueAt('importedData')
  const label = useT('domain.dance')
  if (importedData === undefined) throw new Error('Unexpected null in importedData')
  const {categories, formations} = importedData
  return <>
    <Row>
      <RowItem>
        <Input label={label('category')} path="category" />
      </RowItem>
      <RowItem>
        <Suggestions values={categories} onSuggest={useOnChangeFor('category')} />
      </RowItem>
    </Row>
    <Row>
      <RowItem>
        <Input label={label('formation')} path="formation" />
      </RowItem>
      <RowItem>
        <Suggestions values={formations} onSuggest={useOnChangeFor('formation')} />
      </RowItem>
    </Row>
    <Row>
      <RowItem>
        <Input label={label('source')} path="source" />
      </RowItem>
    </Row>
    <Row>
      <RowItem>
        <Field path="description" component={MarkdownEditor} label={label('description')} />
      </RowItem>
    </Row>
    <InstructionEditor />
  </>
}

function Suggestions({values, onSuggest}) {
  const t = useT('components.danceDataImportButton')
  return <FormGroup label={t('suggestionsFromWiki')}>
    {values.length === 0 && t('noSuggestions')}
    {values.map(value =>
      <React.Fragment key={value}>
        <Tag large interactive intent="success"
          onClick={() => onSuggest(value)}>
          {value}
        </Tag>
        {' '}
      </React.Fragment>
    )}
  </FormGroup>
}

function Row({children}) {
  return <div style={{display: 'flex'}}>{children}</div>
}
function RowItem({children}) {
  return <div style={{margin: '0 5px'}}>{children}</div>
}

function InstructionEditor() {
  const value = useValueAt('')
  const setInstructions = useOnChangeFor('instructions')
  const [hasConflict, setHasConflict] = useState(value.instructions !== value.importedData?.instructions)
  const label = useTranslation('domain.dance.instructions')
  const t = useT('components.danceDataImportButton')

  if (!hasConflict) {
    return <Field path="instructions" component={MarkdownEditor} label={label}/>
  }

  const onResolve= (value: string) => { setHasConflict(false); setInstructions(value) }
  return <>
    <p>{label}</p>
    <Row>
      <RowItem>
        <Field path="instructions" component={MarkdownEditor} label={t('danceDbVersion')} />
        <Button text={t('useThisVersion')} onClick={() => onResolve(value.instructions ?? '')} />
      </RowItem>
      <RowItem>
        <Field path="importedData.instructions" component={MarkdownEditor} label={t('wikiVersion')} />
        <Button text={t('useThisVersion')} onClick={() => onResolve(value.importedData?.instructions ?? '')} />
      </RowItem>
    </Row>;
  </>

}
