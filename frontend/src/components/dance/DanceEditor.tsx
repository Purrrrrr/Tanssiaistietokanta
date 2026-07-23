import { useState } from 'react'

import { Dance, DanceWithEvents, ID } from 'types'

import { formatBallroom } from 'services/ballrooms'

import { SyncStatus } from 'libraries/forms'
import { DocumentContentEditor, DocumentContentEditorProps, emptyDocument, isEmptyDocument } from 'libraries/lexical'
import { Button, Collapse, ItemList, PageSection } from 'libraries/ui'
import { Cross, Edit } from 'libraries/ui/icons'
import { AddFormationDiagramForm } from 'components/formationDiagram/AddFormationDiagramForm'
import { FormationDiagramChooser } from 'components/formationDiagram/FormationDiagramChooser'
import { FormationDiagramEditor } from 'components/formationDiagram/FormationDiagramEditor'
import { ColoredTag } from 'components/widgets/ColoredTag'
import { DurationField } from 'components/widgets/DurationField'
import { useT, useTranslation } from 'i18n'

import { Field, Form, Input, useDanceEditorState, useOnChangeFor } from './DanceForm'
import { DanceSlidePreview } from './DanceSlidePreview'
import DanceWikiPreview from './DanceWikiPreview'
import { WikipageSelector } from './WikipageSelector'

interface DanceEditorProps {
  dance: DanceWithEvents
  className?: string
}

export function DanceEditor({ dance, className }: DanceEditorProps) {
  const { formProps, state } = useDanceEditorState(dance)

  return <>
    <Form {...formProps} className={className}>
      <SyncStatus className="mt-2" floatRight state={state} />
      <FullDanceEditorFields dance={dance} />
    </Form>
    <FormationDiagramsSection dance={dance} onModifyFormationDiagrams={diagrams => formProps.onChange({
      ...formProps.value, formationDiagrams: diagrams,
    }, 'formationDiagrams')} />
  </>
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
  </>
}

function SlideWrapper({ dance, children }: { dance: Dance, children: React.ReactNode }) {
  return <div className="lg:grid grid-cols-2 grid-flow-col gap-3.5 items-stretch">
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

export function FormationDiagramsSection({ dance, onModifyFormationDiagrams }: {
  dance: Pick<Dance, 'formationDiagrams'>
  onModifyFormationDiagrams: (diagrams: Dance['formationDiagrams']) => void
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const label = useT('domain.dance')
  const itemLabel = useT('domain.formationDiagram')
  const t = useT('components.danceEditor')
  const commonT = useT('common')

  return <PageSection
    title={label('formationDiagrams')}
    toolbar={<>
      <FormationDiagramChooser
        id="select-formation-diagram"
        emptyText={t('addFormationDiagram')}
        value={null}
        excludeItems={dance.formationDiagrams.map(fd => fd._id)}
        allowCreate
        createText={t('createFormationDiagram')}
        onChange={formationDiagram => {
          if (!formationDiagram) return
          if ('createNew' in formationDiagram) {
            setShowAddForm(true)
          } else if (formationDiagram) {
            onModifyFormationDiagrams([...dance.formationDiagrams, formationDiagram])
          }
        }}
      />
    </>}
  >
    <Collapse isOpen={showAddForm}>
      <AddFormationDiagramForm
        onClose={() => setShowAddForm(false)}
        onSubmit={formationDiagram => onModifyFormationDiagrams([...dance.formationDiagrams, formationDiagram])}
      />
    </Collapse>
    <ItemList items={dance.formationDiagrams} emptyText={t('noFormationDiagrams')} columns="grid-cols-[max-content_1fr_max-content]">
      <ItemList.Header>
        <span>{itemLabel('ballroom')}</span>
        <span>{itemLabel('description')}</span>
        <span></span>
      </ItemList.Header>
      {dance.formationDiagrams.map((formationDiagram) =>
        <ItemList.ExpandingRow key={formationDiagram._id} expandableContent={
          <FormationDiagramEditor formationDiagram={formationDiagram} />
        }>
          {(open, setOpen) =>
            <>
              <span>
                {formationDiagram.ballroom ? formatBallroom(formationDiagram.ballroom) : '-'}
              </span>
              <span>
                {formationDiagram.description?.trim() ? formationDiagram.description : '-'}
              </span>
              <span>
                <Button
                  minimal
                  icon={<Edit />}
                  tooltip={commonT('edit')}
                  onClick={() => setOpen(!open)} />
                <Button
                  minimal
                  icon={<Cross />}
                  tooltip={commonT('delete')}
                  color="danger"
                  onClick={() => onModifyFormationDiagrams(dance.formationDiagrams.filter(fd => fd._id !== formationDiagram._id))}
                />
              </span>
            </>
          }
        </ItemList.ExpandingRow>,
      )}
    </ItemList>
  </PageSection>
}
