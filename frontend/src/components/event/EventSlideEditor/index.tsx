import React, { ReactNode } from 'react'
import { Link as LinkIcon } from '@blueprintjs/icons'

import {Dance} from 'types'

import {DragHandle, MarkdownEditor, SyncState, SyncStatus} from 'libraries/forms'
import {Callout, H2, Link, RegularLink, SectionCard} from 'libraries/ui'
import { InstructionEditor } from 'components/dance/DanceEditor'
import { Field as DanceField, Form as DanceForm, Input as DanceInput, useDanceEditorState } from 'components/dance/DanceForm'
import { DanceProgramChooser } from 'components/event/DanceProgramChooser'
import {
  Field,
  Input,
  ListField,
  ProgramItemPath,
  programItemToString,
  ProgramSectionPath,
  RemoveItemButton,
  Switch,
  useValueAt
} from 'components/event/EventProgramForm'
import { EventSlideProps, WithEventProgram } from 'components/event/EventSlide'
import { ProgramTypeIcon } from 'components/event/ProgramTypeIcon'
import { Duration } from 'components/widgets/Duration'
import {T, useT, useTranslation} from 'i18n'

import { InheritedSlideStyleSelector, IntervalMusicDefaultTextsSwitch } from './components'

import './EventSlideEditor.scss'

const markdownEditorProps = {
  noPreview: true,
  style: {
    minHeight: 'max(30dvh, 300px)',
  },
}

type EventSlideEditorProps = WithEventProgram<EventSlideProps>
  & { syncStatus?: SyncState }

export function EventSlideEditor({syncStatus, ...props}: EventSlideEditorProps ) {
  const slideStylePath = getSlideStylePath(props)
  //const isDance = props.type === 'programItem' &&
  //  props.eventProgram.danceSets[props.danceSetIndex].program[props.itemIndex].item

  return <>
    <SectionCard>
      <H2 className="grow">
        <T msg={'pages.events.ballProgram.slideProperties'}/>
        {' '}
        {syncStatus && <SyncStatus state={syncStatus}/>}
      </H2>
      <p>
        <ParentLink {...props} />
      </p>
      <div className="flex flex-wrap gap-3.5">
        <DanceSelector {...props} />
        <InheritedSlideStyleSelector
          path={slideStylePath}
          text={useTranslation('components.eventProgramEditor.fields.style')}
        />
      </div>
    </SectionCard>
    <EventSlideContentEditor {...props} />
  </>
}

function DanceSelector(props: WithEventProgram<EventSlideProps>) {
  const t = useT('components.eventProgramEditor')

  if (props.type !== 'programItem') return null

  const itemPath = `danceSets.${props.danceSetIndex}.program.${props.itemIndex}` as const
  const item = props.eventProgram.danceSets[props.danceSetIndex].program[props.itemIndex]
  const itemType = item.item.__typename
  if ((itemType === 'Dance' || itemType === 'RequestedDance')) {
    return <Field label={t('dance')} path={`${itemPath}.item`} component={DanceProgramChooser} labelStyle="beside"/>
  }
  return null
}



function ParentLink(props: WithEventProgram<EventSlideProps>) {
  let title : string
  switch(props.type) {
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
  return <LinkToSlide id={props.parentId}>
    <LinkIcon />{' '}{title}
  </LinkToSlide>
}

function getSlideStylePath(props: EventSlideProps) {
  switch(props.type) {
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

export function EventSlideContentEditor(props: WithEventProgram<EventSlideProps>) {
  const t = useT('components.eventProgramEditor')

  switch(props.type) {
    case 'title':
      return <SectionCard>
        <Input labelStyle="above" label={t('fields.programTitle')} path="introductions.title" inline />
        <ListField
          label=""
          path="introductions.program"
          component={ProgramItem}
          renderConflictItem={item => programItemToString(item, t)}
        />
      </SectionCard>
    case 'introduction': {
      const itemPath = `introductions.program.${props.itemIndex}` as const
      return <ProgramItemEditor path={itemPath} />
    }
    case 'danceSet': {
      const itemPath = `danceSets.${props.danceSetIndex}` as const
      return <SectionCard>
        <H2><T msg={'pages.events.ballProgram.danceSetTitle'}/></H2>
        <Input labelStyle="above" label={t('fields.danceSetName')} path={`${itemPath}.title`} />
        <ListField
          label=""
          path={`${itemPath}.program`}
          component={ProgramItem}
          renderConflictItem={item => programItemToString(item, t)}
        />
      </SectionCard>
    }
    case 'intervalMusic': {
      return <SectionCard>
        <H2><T msg={'pages.events.ballProgram.intervalMusicTitle'}/></H2>
        <IntervalMusicDescriptionEditor danceSetIndex={props.danceSetIndex} />
      </SectionCard>
    }
    case 'programItem': {
      const itemPath = `danceSets.${props.danceSetIndex}.program.${props.itemIndex}` as const
      return <ProgramItemEditor path={itemPath} />
    }
  }
}

interface ProgramItemProps {
  dragHandle: DragHandle
  path: `${ProgramSectionPath}.program`
  itemIndex: number
}

const ProgramItem = React.memo(function ProgramEditor({dragHandle, path, itemIndex}: ProgramItemProps) {
  const t = useT('components.eventProgramEditor')
  const itemPath = `${path}.${itemIndex}` as ProgramItemPath
  const item = useValueAt(itemPath)

  if (!item) return null
  const {__typename } = item.item

  return <div className="flex gap-3.5 items-center program-list-item">
    <ProgramTypeIcon type={__typename} />
    <div className="grow item-name">
      <LinkToSlide id={item._id}>{programItemToString(item, t)}</LinkToSlide>
    </div>
    <div><Duration value={__typename === 'RequestedDance' ? 0 : item.item.duration} /></div>
    <div className="buttons">
      {dragHandle}
      <RemoveItemButton path={path} index={itemIndex} title={t('buttons.remove')} icon="cross" className="deleteItem" />
    </div>
  </div>
})

function IntervalMusicDescriptionEditor({danceSetIndex}: {danceSetIndex: number}) {
  const path = `danceSets.${danceSetIndex}.intervalMusic` as const
  const t = useT('components.eventProgramEditor')
  const intervalMusic = useValueAt(path)
  const hasCustomTexts = typeof intervalMusic?.name === 'string'
  return <>
    <IntervalMusicDefaultTextsSwitch label={t('fields.intervalMusic.useDefaultTexts')} path={path} />
    {hasCustomTexts
      ? <>
        <h2>{t('titles.customIntervalMusicTexts')}</h2>
        <Input label={t('fields.intervalMusic.name')} path={`${path}.name`} required />
        <Field label={t('fields.intervalMusic.description')} path={`${path}.description`} component={MarkdownEditor} componentProps={markdownEditorProps} />
      </>
      : <>
        <h2>{t('titles.defaultIntervalMusicTexts')}</h2>
        <Input label={t('fields.intervalMusic.name')} path='defaultIntervalMusic.name' componentProps={{placeholder:t('programTypes.IntervalMusic')}} />
        <Field label={t('fields.intervalMusic.description')} path="defaultIntervalMusic.description" component={MarkdownEditor} componentProps={markdownEditorProps} />
      </>
    }
  </>
}

function ProgramItemEditor({path}: {path: ProgramItemPath}) {
  const t = useT('components.eventProgramEditor')
  const item = useValueAt(`${path}.item`)

  switch(item.__typename) {
    case 'Dance':
      return <SectionCard>
        {/* TODO: fix types */}
        <DanceEditor dance={item as Dance} />
      </SectionCard>
    case 'RequestedDance':
      return null
    case 'EventProgram':
      return <SectionCard>
        <H2><T msg={'pages.events.ballProgram.infoTitle'}/></H2>
        <Input label={t('fields.eventProgram.name')} path={`${path}.item.name`} required />
        <Field label={t('fields.eventProgram.description')} path={`${path}.item.description`} component={MarkdownEditor} componentProps={markdownEditorProps} />
        <Switch label={t('fields.eventProgram.showInLists')} path={`${path}.item.showInLists`} inline />
        <Callout><T msg={'pages.events.ballProgram.currentItemAlwaysShownInLists'}/></Callout>
      </SectionCard>
  }
}

function DanceEditor({dance}: {dance: Dance}) {
  const t = useT('components.danceEditor')
  const label = useT('domain.dance')
  const { formProps, state } = useDanceEditorState(dance)

  return <DanceForm {...formProps}>
    <div className="flex flex-wrap gap-3.5 items-center">
      <H2 className="m-0">{dance.name}</H2>
      <SyncStatus className="top-[3px] grow" state={state} />
    </div>
    <DanceInput label={label('name')} path="name" />
    <DanceField label={label('description')} path="description" component={InstructionEditor} componentProps={{ wikipage: dance.wikipage, ...markdownEditorProps}}/>
    <DanceInput label={label('source')} labelInfo={label('sourceInfo')} path="source" />

    {dance.wikipageName &&
      <p>
        {t('danceInDanceWiki')}{' '}
        <RegularLink target="_blank" href={`https://tanssi.dy.fi/${dance.wikipageName.replaceAll(' ', '_')}`}><LinkIcon/> {dance.wikipageName}</RegularLink>
      </p>
    }
    <Link target="_blank" to={`/dances/${dance._id}`}><LinkIcon/> {useTranslation('pages.events.ballProgram.linkToCompleteDance')}</Link>
  </DanceForm>
}

interface LinkToSlideProps {
  children: ReactNode
  id: string
}

function LinkToSlide({children, id}: LinkToSlideProps) {
  return <Link relative="path" to={`../${id}`}>{children}</Link>
}
