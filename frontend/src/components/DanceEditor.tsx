import {useCallback, useId} from 'react'
import {Link, useNavigate} from 'react-router-dom'

import {Dance, DanceWithEvents, EditableDance} from 'types'
import { ID } from 'backend/types'

import { cleanMetadataValues } from 'backend'
import { useDeleteDance, usePatchDance } from 'services/dances'

import {formFor, MarkdownEditor, patchStrategy, SyncStatus, useAutosavingState} from 'libraries/forms'
import { Select } from 'libraries/formsV2/components/inputs'
import {Button, Flex, H2, Icon} from 'libraries/ui'
import {DanceDataImportButton} from 'components/DanceDataImportDialog'
import {useGlobalLoadingAnimation} from 'components/LoadingState'
import { useVersionedName } from 'components/versioning/VersionedPageTitle'
import {VersionSidebarToggle} from 'components/versioning/VersionSidebarToggle'
import {DeleteButton} from 'components/widgets/DeleteButton'
import {DurationField} from 'components/widgets/DurationField'
import { useT } from 'i18n'

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
      {showLink && <Link to={`/dances/${dance._id}`}><Icon icon="link"/>{t('linkToThisDance')}</Link>}
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
    <Flex spaced wrap className="danceEditor">
      <div style={{flexGrow: 1, flexBasis: 300}}>
        <Input label={label('name')} path="name" />
        <Input label={label('category')} path="category" />
        <Field label={label('duration')} path="duration" component={DurationField} />
        <Input label={label('prelude')} path="prelude" />
        <Input label={label('formation')} path="formation" />
        <Input label={label('source')} labelInfo={label('sourceInfo')} path="source" />
        <Input label={label('remarks')} path="remarks" />
        {/* <Field label={label('wikipageName')} path="wikipageName" component={DanceNameSearch} /> */}
        {dance.wikipageName &&
          <p>
            {t('danceInDanceWiki')}{' '}
            <a target="_blank" href={`https://tanssi.dy.fi/${dance.wikipageName.replaceAll(' ', '_')}`}>{dance.wikipageName}</a>
          </p>
        }
      </div>
      <div style={{flexGrow: 2, flexBasis: 500}}>
        <Field label={label('description')} path="description" component={MarkdownEditor} componentProps={{className: 'max-h-150'}} />
        <Field label={label('instructions')} path="instructions" component={MarkdownEditor} componentProps={{className: 'max-h-150'}} />
      </div>
    </Flex>
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
    <Flex wrap spaced alignItems="center" justify="end">
      <Title>
        {useVersionedName(dance.name, dance._versionId ? dance._versionNumber : null)}
      </Title>
      <SyncStatus style={{marginLeft: '1ch', top: '3px'}} className="flex-fill" state={state} />
      <Flex alignItems="center" style={{marginTop: '10px'}}>
        {toolbar}
      </Flex>
    </Flex>
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
          <Icon icon="link" />
          <span className="whitespace-nowrap">{event.name}</span>
        </Link>
      }
    />
  </div>
}

function DanceDataImporter() {
  const dance = useValueAt('')
  const onChange = useOnChangeFor('')
  return <DanceDataImportButton dance={dance} onImport={onChange} />
}
