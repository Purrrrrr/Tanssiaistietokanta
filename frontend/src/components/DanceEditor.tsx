import { Link as LinkIcon } from '@blueprintjs/icons'

import {Dance, DanceWithEvents} from 'types'

import {MarkdownEditor, SyncStatus } from 'libraries/forms'
import {H2, RegularLink} from 'libraries/ui'
import {DanceDataImportButton} from 'components/DanceDataImportDialog'
import { useVersionedName } from 'components/versioning/VersionedPageTitle'
import {VersionSidebarToggle} from 'components/versioning/VersionSidebarToggle'
import {DurationField} from 'components/widgets/DurationField'
import { useT } from 'i18n'

import { Field, Form, Input, useDanceEditorState, useOnChangeFor, useValueAt } from './dance/DanceForm'
import { DanceIsUsedIn } from './dance/DanceIsUsedIn'
import { DanceLink, danceVersionLink } from './dance/DanceLink'
import { DeleteDanceButton } from './dance/DeleteDanceButton'
import { ColoredTag } from './widgets/ColoredTag'

interface DanceEditorProps extends Pick<DanceEditorContainerProps, 'dance' | 'titleComponent'> {
  dance: DanceWithEvents
  onDelete?: () => unknown
  showLink?: boolean
  showVersionHistory?: boolean
}

export function DanceEditor({dance, onDelete, showLink, showVersionHistory, titleComponent} : DanceEditorProps) {
  const t = useT('components.danceEditor')
  const readOnly = dance._versionId != null

  return <DanceEditorContainer
    dance={dance}
    titleComponent={titleComponent}
    toolbar={<>
      {showLink && <DanceLink dance={dance}><LinkIcon />{t('linkToThisDance')}</DanceLink>}
      {showVersionHistory && <VersionSidebarToggle entityType="dance" entityId={dance._id} versionId={dance._versionId ?? undefined} toVersionLink={danceVersionLink} />}
      <DanceIsUsedIn events={dance.events} />
      <div>
        <DeleteDanceButton dance={dance} onDelete={onDelete} />
        {readOnly || <DanceDataImporter />}
      </div>
    </>}
  >
    <FullDanceEditorFields dance={dance} />
  </DanceEditorContainer>
}

interface DanceEditorContainerProps {
  dance: Dance
  toolbar?: React.ReactNode
  children: React.ReactNode
  titleComponent?: React.JSXElementConstructor<{className?: string, children: React.ReactNode}> | 'h1'
}

export function DanceEditorContainer({dance, children, toolbar, titleComponent: Title = H2} : DanceEditorContainerProps) {
  const {formProps, state} = useDanceEditorState(dance)
  return <Form {...formProps}>
    <div className="flex flex-wrap gap-3.5 items-center">
      <Title className="m-0">
        {useVersionedName(dance.name, dance._versionId ? dance._versionNumber : null)}
      </Title>
      <SyncStatus className="top-[3px] grow" state={state} />
      <div className="flex items-center mt-2.5">
        {toolbar}
      </div>
    </div>
    {children}
  </Form>
}

export function FullDanceEditorFields({ dance }: { dance: DanceWithEvents }) {
  const t = useT('components.danceEditor')
  const label = useT('domain.dance')
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
        {/* <Field label={label('wikipageName')} path="wikipageName" component={DanceNameSearch} /> */}
        {dance.wikipageName &&
          <p>
            {t('danceInDanceWiki')}{' '}
            <RegularLink target="_blank" href={`https://tanssi.dy.fi/${dance.wikipageName.replaceAll(' ', '_')}`}><LinkIcon /> {dance.wikipageName}</RegularLink>
          </p>
        }
      </div>
      <div className="grow basis-75">
        <Input label={label('prelude')} path="prelude" />
        <Input label={label('formation')} path="formation" />
        <Input label={label('source')} labelInfo={label('sourceInfo')} path="source" />
        <Input label={label('remarks')} path="remarks" />
      </div>
    </div>
    <Field label={label('description')} path="description" component={MarkdownEditor} componentProps={{className: 'max-h-150'}} />
    <Field label={label('instructions')} path="instructions" component={MarkdownEditor} componentProps={{className: 'max-h-150'}} />
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

function DanceDataImporter() {
  const dance = useValueAt('')
  const onChange = useOnChangeFor('')
  return <DanceDataImportButton dance={dance} onImport={onChange} />
}
