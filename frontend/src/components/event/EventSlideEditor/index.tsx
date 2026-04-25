import React, { ReactNode } from 'react'

import { Dance } from 'types'

import { useDance } from 'services/dances'

import { DragHandle, SyncState, SyncStatus } from 'libraries/forms'
import { DocumentContentEditor } from 'libraries/lexical'
import { Callout, H2, Link } from 'libraries/ui'
import { ArrowLeft, Cross, Link as LinkIcon } from 'libraries/ui/icons'
import { InstructionEditor } from 'components/dance/DanceEditor'
import { Field as DanceField, Form as DanceForm, Input as DanceInput, useDanceEditorState } from 'components/dance/DanceForm'
import { LinkToDanceWiki } from 'components/dance/DanceWikiPreview'
import { DanceProgramChooser } from 'components/event/DanceProgramChooser'
import {
  Field,
  Input,
  ListField,
  ProgramItemPath,
  ProgramSectionPath,
  RemoveItemButton,
  Switch,
  useValueAt,
} from 'components/event/EventProgramForm'
import { EventSlideProps, WithEventProgram } from 'components/event/EventSlide'
import { ProgramTypeIcon } from 'components/event/ProgramTypeIcon'
import { Duration } from 'components/widgets/Duration'
import { T, useT, useTranslation } from 'i18n'

import { AddIntroductionButton, DanceSetItemButtons } from '../EventProgramEditor/components'
import { getProgramDuration, getProgramName } from '../utils'
import { InheritedSlideStyleSelector, IntervalMusicDefaultTextsSwitch } from './components'

import './EventSlideEditor.scss'

const docEditorProps = (eventId: string) => ({
  className: 'min-h-[max(30dvh,300px)]',
  imageUpload: { owner: 'events', owningId: eventId } as const,
})

type EventSlideEditorProps = WithEventProgram<EventSlideProps>
  & { syncStatus?: SyncState, eventId: string }

export function EventSlideEditor({ syncStatus, ...props }: EventSlideEditorProps) {
  const slideStylePath = getSlideStylePath(props)

  return <div className="p-5">
    {syncStatus && <SyncStatus className="mb-2" state={syncStatus} />}
    <div className="flex gap-3.5 justify-between">
      <div>
        <ParentLink {...props} />
        <H2 className="mb-4">{props.title}</H2>
      </div>
      <InheritedSlideStyleSelector
        path={slideStylePath}
        text={useTranslation('components.eventProgramEditor.fields.style')}
      />
    </div>
    <DanceSelector {...props} />
    <EventSlideContentEditor {...props} />
  </div>
}

function DanceSelector(props: WithEventProgram<EventSlideProps>) {
  const t = useT('components.eventProgramEditor')

  if (props.type !== 'programItem') return null

  const rowPath = `danceSets.${props.danceSetIndex}.program.${props.itemIndex}` as const
  const row = props.eventProgram.danceSets[props.danceSetIndex].program[props.itemIndex]
  const rowType = row.type
  if ((rowType === 'Dance' || rowType === 'RequestedDance')) {
    return <Field label={t('chooseDance')} path={rowPath} component={DanceProgramChooser} />
  }
  return null
}

function ParentLink(props: WithEventProgram<EventSlideProps>) {
  let title: string
  switch (props.type) {
    case 'title':
    case 'danceSet':
      return null
    case 'introduction':
      title = props.eventProgram.introductions.title
      break
    case 'intervalMusic':
    case 'programItem': {
      title = props.eventProgram.danceSets[props.danceSetIndex].title
    }
  }
  return <LinkToSlide unstyled className="block mb-2 cursor-pointer hover:underline" id={props.parentId}>
    <ArrowLeft size={10} className="pb-0.5" /> {title}
  </LinkToSlide>
}

function getSlideStylePath(props: EventSlideProps) {
  switch (props.type) {
    case 'title':
      return 'introductions.titleSlideStyleId' as const
    case 'introduction': {
      return `introductions.program.${props.itemIndex}.slideStyleId` as const
    }
    case 'danceSet': {
      return `danceSets.${props.danceSetIndex}.titleSlideStyleId` as const
    }
    case 'intervalMusic': {
      return `danceSets.${props.danceSetIndex}.intervalMusic.slideStyleId` as const
    }
    case 'programItem': {
      return `danceSets.${props.danceSetIndex}.program.${props.itemIndex}.slideStyleId` as const
    }
  }
}

export function EventSlideContentEditor({ eventId, ...props }: WithEventProgram<EventSlideProps> & { eventId: string }) {
  const t = useT('components.eventProgramEditor')

  switch (props.type) {
    case 'title':
      return <>
        <Input labelStyle="above" label={t('fields.programTitle')} path="introductions.title" inline />
        <ListField
          label={t('titles.introductoryInformation')}
          path="introductions.program"
          component={ProgramItem}
          renderConflictItem={item => getProgramName(item, t)}
        />
        <AddIntroductionButton />
      </>
    case 'introduction': {
      const itemPath = `introductions.program.${props.itemIndex}` as const
      return <ProgramItemEditor path={itemPath} eventId={eventId} />
    }
    case 'danceSet': {
      const itemPath = `danceSets.${props.danceSetIndex}` as const
      return <>
        <Input labelStyle="above" label={t('fields.danceSetName')} path={`${itemPath}.title`} />
        <ListField
          label=""
          path={`${itemPath}.program`}
          component={ProgramItem}
          renderConflictItem={item => getProgramName(item, t)}
        />
        <DanceSetItemButtons path={itemPath} />
      </>
    }
    case 'intervalMusic': {
      return <IntervalMusicDescriptionEditor danceSetIndex={props.danceSetIndex} eventId={eventId} />
    }
    case 'programItem': {
      const rowPath = `danceSets.${props.danceSetIndex}.program.${props.itemIndex}` as const
      return <ProgramItemEditor path={rowPath} eventId={eventId} />
    }
  }
}

interface ProgramItemProps {
  dragHandle: DragHandle
  path: `${ProgramSectionPath}.program`
  itemIndex: number
}

const ProgramItem = React.memo(function ProgramEditor({ dragHandle, path, itemIndex }: ProgramItemProps) {
  const t = useT('components.eventProgramEditor')
  const rowPath = `${path}.${itemIndex}` as ProgramItemPath
  const row = useValueAt(rowPath)

  if (!row) return null
  const { type } = row

  return <div className="flex gap-3.5 items-center program-list-item">
    <ProgramTypeIcon type={type} />
    <div className="grow item-name">
      <LinkToSlide id={row._id}>{getProgramName(row, t)}</LinkToSlide>
    </div>
    <div><Duration value={getProgramDuration(row)} /></div>
    <div className="buttons">
      {dragHandle}
      <RemoveItemButton path={path} index={itemIndex} title={t('buttons.remove')} icon={<Cross />} className="deleteItem" />
    </div>
  </div>
})

function IntervalMusicDescriptionEditor({ danceSetIndex, eventId }: { danceSetIndex: number, eventId: string }) {
  const path = `danceSets.${danceSetIndex}.intervalMusic` as const
  const t = useT('components.eventProgramEditor')
  const intervalMusic = useValueAt(path)
  const hasCustomTexts = typeof intervalMusic?.name === 'string'
  return <>
    <Field label={t('dance')} path={`${path}.dance`} component={DanceProgramChooser} labelStyle="beside" />
    <IntervalMusicDefaultTextsSwitch label={t('fields.intervalMusic.useDefaultTexts')} path={path} />
    {hasCustomTexts
      ? <>
        <H2>{t('titles.customIntervalMusicTexts')}</H2>
        <Input label={t('fields.intervalMusic.name')} path={`${path}.name`} required />
        <Field
          label={t('fields.intervalMusic.description')}
          path={`${path}.description`}
          component={DocumentContentEditor}
          componentProps={docEditorProps(eventId)} />
        <Switch label={t('fields.intervalMusic.showInLists')} path={`${path}.showInLists`} inline />
      </>
      : <>
        <H2>{t('titles.defaultIntervalMusicTexts')}</H2>
        <Input label={t('fields.intervalMusic.name')} path="defaultIntervalMusic.name" componentProps={{ placeholder: t('programTypes.IntervalMusic') }} />
        <Field
          label={t('fields.intervalMusic.description')}
          path="defaultIntervalMusic.description"
          component={DocumentContentEditor}
          componentProps={docEditorProps(eventId)} />
        <Switch label={t('fields.intervalMusic.showInLists')} path="defaultIntervalMusic.showInLists" inline />
      </>
    }
  </>
}

function ProgramItemEditor({ path, eventId }: { path: ProgramItemPath, eventId: string }) {
  const t = useT('components.eventProgramEditor')
  const row = useValueAt(path)

  if ('danceId' in row && row.type === 'Dance') {
    const { danceId, dance } = row
    if (!danceId) return null
    return <DanceEditor id={danceId} initialDance={dance as Dance} />
  }
  switch (row.type) {
    case 'RequestedDance':
      return null
    case 'EventProgram':
      return <>
        <Input label={t('fields.eventProgram.name')} path={`${path}.eventProgram.name`} required />
        <Field label={t('fields.eventProgram.description')} path={`${path}.eventProgram.description`} component={DocumentContentEditor} componentProps={docEditorProps(eventId)} />
        <Switch label={t('fields.eventProgram.showInLists')} path={`${path}.eventProgram.showInLists`} inline />
        <Callout><T msg="components.eventSlideEditor.currentItemAlwaysShownInLists" /></Callout>
      </>
  }
}
const emptyDance: Dance = {
  _id: '',
  name: '-',
  wikipage: null,
  wikipageName: null,
}

function DanceEditor({ id, initialDance }: { id: string, initialDance?: Pick<Dance, '_id' | '_versionId' | 'name' | 'wikipage' | 'wikipageName'> | null }) {
  const result = useDance({ id, versionId: initialDance?._versionId })
  const dance = result.data?.dance ?? initialDance ?? emptyDance

  const t = useT('components.danceWikiPreview')
  const label = useT('domain.dance')
  const { formProps, state } = useDanceEditorState(dance)

  return <DanceForm {...formProps} readOnly={!result.data || formProps.readOnly}>
    <div className="flex flex-wrap gap-3.5 items-center mb-3">
      <H2 className=""><T msg="components.eventSlideEditor.danceTitle" /></H2>
      <SyncStatus className="top-[3px] grow" state={state} />
    </div>
    <DanceInput label={label('name')} path="name" />
    <DanceField label={label('description')} path="description" component={InstructionEditor} componentProps={{ danceId: dance._id, wikipage: dance.wikipage, ...docEditorProps }} />

    <p className="flex gap-3.5">
      {dance.wikipageName &&
        <LinkToDanceWiki page={dance.wikipageName}>
          <LinkIcon size={12} />{t('danceInDanceWiki')}
        </LinkToDanceWiki>
      }
      <Link target="_blank" to="/dances/$danceId" params={{ danceId: dance._id }}>
        <LinkIcon size={12} /> {useTranslation('components.eventSlideEditor.linkToCompleteDance')}
      </Link>
    </p>
  </DanceForm>
}

interface LinkToSlideProps {
  children: ReactNode
  unstyled?: boolean
  className?: string
  id: string
}

function LinkToSlide({ id, ...rest }: LinkToSlideProps) {
  return <Link to="." params={{ slideId: id }} {...rest} />
}
