import {useCallback, useId, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import { ChevronDown, ChevronUp, Link as LinkIcon } from '@blueprintjs/icons'

import {Dance, DanceWithEvents, EditableDance} from 'types'
import { ID } from 'backend/types'

import { cleanMetadataValues } from 'backend'
import { useDeleteDance, usePatchDance } from 'services/dances'

import {formFor, MarkdownEditor, patchStrategy, SyncStatus, useAutosavingState} from 'libraries/forms'
import { Select } from 'libraries/formsV2/components/inputs'
import {Button, Collapse, H2, Link, RegularLink} from 'libraries/ui'
import {DanceDataImportButton} from 'components/DanceDataImportDialog'
import {useGlobalLoadingAnimation} from 'components/LoadingState'
import { useVersionedName } from 'components/versioning/VersionedPageTitle'
import {VersionSidebarToggle} from 'components/versioning/VersionSidebarToggle'
import {DeleteButton} from 'components/widgets/DeleteButton'
import {DurationField} from 'components/widgets/DurationField'
import { useT } from 'i18n'

import { ColoredTag } from './widgets/ColoredTag'

interface DanceEditorProps extends Pick<DanceEditorContainerProps, 'dance' | 'titleComponent'> {
  dance: DanceWithEvents
  onDelete?: () => unknown
  showLink?: boolean
  showVersionHistory?: boolean
}

const {
  Form,
  Field,
  Input,
  useValueAt,
  useOnChangeFor,
} = formFor<EditableDance>()

function danceVersionLink(id: ID, versionId?: ID | null) {
  return versionId
    ? `/dances/${id}/version/${versionId}`
    : `/dances/${id}`
}

export function DanceEditor({dance, onDelete, showLink, showVersionHistory, titleComponent} : DanceEditorProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const label = useT('domain.dance')
  const t = useT('components.danceEditor')
  const addLoadingAnimation = useGlobalLoadingAnimation()
  const readOnly = dance._versionId != null
  const [deleteDance] = useDeleteDance()
  const handleDelete = () => {
    addLoadingAnimation(deleteDance({id: dance._id}))
    onDelete?.()
  }

  return <DanceEditorContainer
    dance={dance}
    titleComponent={titleComponent}
    toolbar={<>
      {showLink && <Link to={`/dances/${dance._id}`}><LinkIcon />{t('linkToThisDance')}</Link>}
      {showVersionHistory && <VersionSidebarToggle entityType="dance" entityId={dance._id} versionId={dance._versionId ?? undefined} toVersionLink={danceVersionLink} />}
      <DanceIsUsedIn events={dance.events} />
      <div>
        <DeleteButton onDelete={handleDelete}
          disabled={dance.events.length > 0}
          text={t('deleteDance')}
          confirmText={t('deleteConfirmation')}
        />
        {readOnly || <DanceDataImporter />}
      </div>
    </>}
  >
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
    <div className="text-right">
      <Button
        text={t('editInstructions')}
        onClick={() => setShowInstructions(s => !s)}
        rightIcon={showInstructions ? <ChevronUp/> : <ChevronDown />}
      />
    </div>
    <Collapse isOpen={showInstructions}>
      <Field label={label('description')} path="description" component={MarkdownEditor} componentProps={{className: 'max-h-150'}} />
      <Field label={label('instructions')} path="instructions" component={MarkdownEditor} componentProps={{className: 'max-h-150'}} />
    </Collapse>
  </DanceEditorContainer>
}

interface DanceEditorContainerProps {
  dance: Dance
  toolbar?: React.ReactNode
  children: React.ReactNode
  titleComponent?: React.JSXElementConstructor<{className?: string, children: React.ReactNode}> | 'h1'
}

export function DanceEditorContainer({dance, children, toolbar, titleComponent: Title = H2} : DanceEditorContainerProps) {
  const readOnly = dance._versionId != null
  const [modifyDance] = usePatchDance()
  const patchDance = useCallback(
    async (patches : Partial<DanceWithEvents>) => {
      if (readOnly) return
      return modifyDance({id: dance._id, dance: cleanMetadataValues(patches)})
    },
    [modifyDance, dance._id, readOnly]
  )
  const { wikipage: _ignored, ...editedDance } = dance

  const {formProps, state} = useAutosavingState<EditableDance, Partial<EditableDance>>(editedDance, patchDance, patchStrategy.partial)
  return <Form {...formProps} readOnly={readOnly}>
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


function DanceIsUsedIn({events}: Pick<DanceWithEvents, 'events'>) {
  const id = useId()
  const navigate = useNavigate()
  const t = useT('components.danceEditor')
  if (events.length === 0) return null

  return <div>
    <Select
      id={id}
      items={events}
      value={events[0]}
      onChange={(event) => { if (event) navigate(`/events/${event._id}`) }}
      itemToString={event => event.name}
      itemClassName=""
      buttonRenderer={(_, props) =>
        <Button active={props['aria-expanded']} minimal rightIcon="caret-down" text={t('danceUsedInEvents', {count: events.length})} {...props} />
      }
      itemRenderer={event =>
        <Link to={`/events/${event._id}`} className="flex gap-2 py-1.5 px-2 hover:no-underline">
          <LinkIcon />
          <span className="whitespace-nowrap">{event.name}</span>
        </Link>
      }
    />
  </div>
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
