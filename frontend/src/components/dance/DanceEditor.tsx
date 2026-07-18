import { useState } from 'react'

import { Dance, DanceWithEvents, ID } from 'types'

import { SyncStatus } from 'libraries/forms'
import { DocumentContentEditor, DocumentContentEditorProps, emptyDocument, isEmptyDocument } from 'libraries/lexical'
import { Button, ItemList, PageSection } from 'libraries/ui'
import { Edit } from 'libraries/ui/icons'
import { AddButton } from 'components/widgets/AddButton'
import { ColoredTag } from 'components/widgets/ColoredTag'
import { DurationField } from 'components/widgets/DurationField'
import { useT, useTranslation } from 'i18n'
import randomId from 'utils/randomId'

import { Field, Form, Input, useAppendToList, useDanceEditorState, useOnChangeFor, RemoveItemButton } from './DanceForm'
import { DanceSlidePreview } from './DanceSlidePreview'
import DanceWikiPreview from './DanceWikiPreview'
import { WikipageSelector } from './WikipageSelector'
import { FabricEditor } from 'libraries/fabric/FabricEditor'

interface DanceEditorProps {
  dance: DanceWithEvents
  className?: string
}

export function DanceEditor({ dance, className }: DanceEditorProps) {
  const { formProps, state } = useDanceEditorState(dance)

  return <Form {...formProps} className={className}>
    <SyncStatus className="mt-2" floatRight state={state} />
    <FullDanceEditorFields dance={dance} />
  </Form>
}

export function FullDanceEditorFields({ dance }: { dance: DanceWithEvents }) {
  const label = useT('domain.dance')
  const { wikipage } = dance
  return <>
    <div className="flex flex-wrap gap-3.5">
      <div className="grow basis-75">
        <Input label={label('name')} path="name" />
        <Input
          label={label('category')}
          path="category"
          helperText={!dance.category && <Suggestions suggestions={dance.wikipage?.categories} path="category" />}
        />
        <Field label={label('duration')} path="duration" component={DurationField} />
        <Field label={label('wikipageName')} path="wikipageName" component={WikipageSelector} componentProps={{ possibleName: dance.name }} />
      </div>
      <div className="grow basis-75">
        <Input label={label('prelude')} path="prelude" />
        <Input
          label={label('formation')}
          path="formation"
          helperText={!dance.formation && <Suggestions suggestions={dance.wikipage?.formations} path="formation" />}
        />
        <Input label={label('source')} labelInfo={label('sourceInfo')} path="source" />
        <Input label={label('remarks')} path="remarks" />
      </div>
    </div>
    <DanceWikiPreview dance={dance} />
    <SlideWrapper dance={dance}>
      <Field
        label={label('description')}
        path="description"
        component={InstructionEditor}
        containerClassName="grow"
        componentProps={{
          danceId: dance._id, wikipage,
          className: 'h-full',
        }} />
    </SlideWrapper>
    <Field
      label={label('instructions')}
      path="instructions"
      component={InstructionEditor}
      componentProps={{ danceId: dance._id, wikipage, className: 'max-h-150' }} />
    <FormationInstructionsSection dance={dance} />
  </>
}

function SlideWrapper({ dance, children }: { dance: Dance, children: React.ReactNode }) {
  return <div className="min-lg:grid grid-cols-2 grid-flow-col gap-3.5 items-stretch">
    <div className="flex flex-col">{children}</div>
    <div className="min-h-100 mb-[15px]">
      <div className="mb-[5px]">{useTranslation('domain.dance.descriptionPreview')}</div>
      <DanceSlidePreview dance={dance} />
    </div>
  </div>
}

export interface InstructionEditorProps extends DocumentContentEditorProps {
  danceId: ID
  wikipage?: Pick<NonNullable<Dance['wikipage']>, 'content'> | null
}

export function InstructionEditor({ danceId, wikipage, ...props }: InstructionEditorProps) {
  const t = useT('components.danceEditor')
  const isMissingvalue = isEmptyDocument(props.value)
  const canCopyFromWiki = isMissingvalue && wikipage && !props.readOnly
  const copyInstructionsFromWiki = () => props.onChange(wikipage?.content ?? emptyDocument())
  return <>
    <DocumentContentEditor {...props} imageUpload={{ owner: 'dances', owningId: danceId, path: 'instructions' }} />
    {canCopyFromWiki && <p className="pt-2"><Button color="primary" text={t('copyFromDancewiki')} onClick={copyInstructionsFromWiki} /></p>}
  </>
}

function Suggestions(
  { suggestions, path }: { suggestions?: string[], path: 'category' | 'formation' },
) {
  const t = useT('components.danceEditor')
  const onChange = useOnChangeFor(path)

  if (!suggestions?.length) return null

  return <div>
    {t('suggestions')}:
    {suggestions.map(suggestion =>
      <ColoredTag key={suggestion} small title={suggestion} onClick={() => onChange(suggestion)} />,
    )}
  </div>
}

function FormationInstructionsSection({ dance }: { dance: DanceWithEvents }) {
  const label = useT('domain.dance')
  const t = useT('components.danceEditor')
  const addFormationInstruction = useAppendToList('formationInstructions')

  return <PageSection
    title={label('formationInstructions')}
    toolbar={<AddButton onClick={() => addFormationInstruction({
      _id: randomId(),
      ballroomId: null,
      description: '',
      diagram: { data: {}, width: 300, height: 300, hash: '' },
    })} />}
  >
    <ItemList items={dance.formationInstructions} emptyText={t('noFormationInstructions')} columns="grid-cols-[1fr_max-content]">
      {dance.formationInstructions.map((formationInstruction, index) =>
        <FormationInstructionRow key={formationInstruction._id} formationInstruction={formationInstruction} index={index} />,
      )}
    </ItemList>
  </PageSection>
}

function FormationInstructionRow({ formationInstruction, index }: {
  formationInstruction: DanceWithEvents['formationInstructions'][number]
  index: number
}) {
  const label = useT('domain.formationInstructions')
  const [open, setOpen] = useState(false)
  return <ItemList.Row isOpen={open} expandableContent={<div className="p-4">
    <Input label={label('description')} path={`formationInstructions.${index}.description`} />
    <Field label={label('diagram')} path={`formationInstructions.${index}.diagram`} component={FabricEditor} />
  </div>}>
    <span>{formationInstruction.description ?? '-'}</span>
    <span>
      <Button minimal icon={<Edit />} tooltip={useTranslation('common.edit')} onClick={() => setOpen(!open)} />
      <RemoveItemButton minimal path="formationInstructions" index={index} text={useTranslation('common.delete')} />
    </span>
  </ItemList.Row>
}
