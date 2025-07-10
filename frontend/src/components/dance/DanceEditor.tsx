import { Link as LinkIcon } from '@blueprintjs/icons'

import {Dance, DanceWithEvents} from 'types'

import {MarkdownEditor, MarkdownEditorProps, SyncStatus } from 'libraries/forms'
import {Button, H2} from 'libraries/ui'
import { useVersionedName } from 'components/versioning/VersionedPageTitle'
import {VersionSidebarToggle} from 'components/versioning/VersionSidebarToggle'
import { ColoredTag } from 'components/widgets/ColoredTag'
import {DurationField} from 'components/widgets/DurationField'
import { useT } from 'i18n'

import { Field, Form, Input, useDanceEditorState, useOnChangeFor } from './DanceForm'
import { DanceIsUsedIn } from './DanceIsUsedIn'
import { DanceLink, danceVersionLink } from './DanceLink'
import DanceWikiPreview from './DanceWikiPreview'
import { DeleteDanceButton } from './DeleteDanceButton'
import { WikipageSelector } from './WikipageSelector'

interface DanceEditorProps {
  dance: DanceWithEvents
  titleComponent?: 'h2' | 'h1'
  onDelete?: () => unknown
  showLink?: boolean
  showVersionHistory?: boolean
}

export function DanceEditor({dance, onDelete, showLink, showVersionHistory, titleComponent = 'h2'} : DanceEditorProps) {
  const t = useT('components.danceEditor')
  const {formProps, state} = useDanceEditorState(dance)
  const Title = titleComponent === 'h2' ? H2 : 'h1'

  return <Form {...formProps}>
    <div className="flex flex-wrap gap-3.5 items-center mb-2">
      <Title className="m-0">
        {useVersionedName(dance.name, dance._versionId ? dance._versionNumber : null)}
      </Title>
      <SyncStatus className="top-[3px] grow" state={state} />
      <div className="flex items-center mt-2.5">
        {showLink && <DanceLink dance={dance}><LinkIcon />{t('linkToThisDance')}</DanceLink>}
        {showVersionHistory && <VersionSidebarToggle entityType="dance" entityId={dance._id} versionId={dance._versionId ?? undefined} toVersionLink={danceVersionLink} />}
        <DanceIsUsedIn events={dance.events} />
        <div>
          <DeleteDanceButton dance={dance} onDelete={onDelete} />
        </div>
      </div>
    </div>
    <FullDanceEditorFields dance={dance} />
  </Form>
}

export function PlainDanceEditor({ dance }: { dance: DanceWithEvents }) {
  const {formProps, state} = useDanceEditorState(dance)
  return <Form className="p-2 border-gray-200 border-t-1"{...formProps}>
    <SyncStatus floatRight state={state} />
    <FullDanceEditorFields dance={dance} />
  </Form>
}

function FullDanceEditorFields({ dance }: { dance: DanceWithEvents }) {
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
    <Field label={label('description')} path="description" component={InstructionEditor} componentProps={{ wikipage, className: 'max-h-150'}} />
    <Field label={label('instructions')} path="instructions" component={InstructionEditor} componentProps={{ wikipage, className: 'max-h-150'}} />
  </>
}

export interface InstructionEditorProps extends MarkdownEditorProps {
  wikipage?: Dance['wikipage']
}

export function InstructionEditor({ wikipage, ...props }: InstructionEditorProps) {
  const t = useT('components.danceEditor')
  const isMissingvalue = (props.value ?? '').trim().length < 10
  const onClick = () => props.onChange(wikipage?.instructions ?? '')
  return <>
    <MarkdownEditor {...props} />
    {isMissingvalue && wikipage && <p className="pt-2"><Button color="primary" text={t('copyFromDancewiki')} onClick={onClick} /></p>}
  </>
}

function Suggestions(
  {suggestions, path}: { suggestions?: string[], path: 'category' | 'formation' }
) {
  const t = useT('components.danceEditor')
  const onChange = useOnChangeFor(path)

  if (!suggestions?.length) return null

  return <div>
    {t('suggestions')}:
    {suggestions.map(suggestion =>
      <ColoredTag key={suggestion} small title={suggestion} onClick={() => onChange(suggestion)} />
    )}
  </div>
}
