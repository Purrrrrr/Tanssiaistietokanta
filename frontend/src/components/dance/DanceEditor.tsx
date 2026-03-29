import { Dance, DanceWithEvents, ID } from 'types'

import { MarkdownEditorProps, SyncStatus } from 'libraries/forms'
import { Button } from 'libraries/ui'
import { MarkdownInput } from 'components/files/MarkdownInput'
import { ColoredTag } from 'components/widgets/ColoredTag'
import { DurationField } from 'components/widgets/DurationField'
import { useT } from 'i18n'

import { Field, Form, Input, useDanceEditorState, useOnChangeFor } from './DanceForm'
import DanceWikiPreview from './DanceWikiPreview'
import { WikipageSelector } from './WikipageSelector'

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
    <Field label={label('description')} path="description" component={InstructionEditor} componentProps={{ danceId: dance._id, wikipage, className: 'max-h-150' }} />
    <Field label={label('instructions')} path="instructions" component={InstructionEditor} componentProps={{ danceId: dance._id, wikipage, className: 'max-h-150' }} />
  </>
}

export interface InstructionEditorProps extends MarkdownEditorProps {
  danceId: ID
  wikipage?: Dance['wikipage']
}

export function InstructionEditor({ danceId, wikipage, ...props }: InstructionEditorProps) {
  const t = useT('components.danceEditor')
  const isMissingvalue = (props.value ?? '').trim().length < 10
  const canCopyFromWiki = isMissingvalue && wikipage && !props.readOnly
  const copyInstructionsFromWiki = () => props.onChange(wikipage?.instructions ?? '')
  return <>
    <MarkdownInput {...props} fileOwner="dances" fileOwningId={danceId} filePath="instructions" />
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
