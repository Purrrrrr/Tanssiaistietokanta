import React, { ReactNode } from 'react'

import {Dance} from 'types'

import {DragHandle, formFor, MarkdownEditor, SyncState, SyncStatus} from 'libraries/forms'
import {Callout, H2, Icon, Link, RegularLink, SectionCard} from 'libraries/ui'
import {DanceEditorContainer} from 'components/DanceEditor'
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

type EventSlideEditorProps = WithEventProgram<EventSlideProps>
  & Pick<LinkToSlideProps, 'hashLink'> & { syncStatus?: SyncState }

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



function ParentLink(props: WithEventProgram<EventSlideProps> & Pick<LinkToSlideProps, 'hashLink'>) {
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
  return <LinkToSlide id={props.parentId} hashLink={props.hashLink}>
    <Icon icon="link"/>{' '}{title}
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

export function EventSlideContentEditor({hashLink, ...props}: WithEventProgram<EventSlideProps> & Pick<LinkToSlideProps, 'hashLink'>) {
  const t = useT('components.eventProgramEditor')

  switch(props.type) {
    case 'title':
      return <SectionCard>
        <Input labelStyle="above" label={t('fields.programTitle')} path="introductions.title" inline />
        <ListField
          label=""
          path="introductions.program"
          component={ProgramItem}
          componentProps={{hashLink}}
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
          componentProps={{hashLink}}
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
  hashLink?: boolean
}

const ProgramItem = React.memo(function ProgramEditor({dragHandle, path, itemIndex, hashLink}: ProgramItemProps) {
  const t = useT('components.eventProgramEditor')
  const itemPath = `${path}.${itemIndex}` as ProgramItemPath
  const item = useValueAt(itemPath)

  if (!item) return null
  const {__typename } = item.item

  return <div className="flex items-center gap-3.5 program-list-item">
    <ProgramTypeIcon type={__typename} />
    <div className="grow item-name">
      <LinkToSlide id={item._id} hashLink={hashLink}>{programItemToString(item, t)}</LinkToSlide>
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
        <Field label={t('fields.intervalMusic.description')} path={`${path}.description`} component={MarkdownEditor} componentProps={{noPreview: true}} />
      </>
      : <>
        <h2>{t('titles.defaultIntervalMusicTexts')}</h2>
        <Input label={t('fields.intervalMusic.name')} path='defaultIntervalMusic.name' componentProps={{placeholder:t('programTypes.IntervalMusic')}} />
        <Field label={t('fields.intervalMusic.description')} path="defaultIntervalMusic.description" component={MarkdownEditor} componentProps={{noPreview: true}} />
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
        <DanceEditor dance={item} />
      </SectionCard>
    case 'RequestedDance':
      return null
    case 'EventProgram':
      return <SectionCard>
        <H2><T msg={'pages.events.ballProgram.infoTitle'}/></H2>
        <Input label={t('fields.eventProgram.name')} path={`${path}.item.name`} required />
        <Field label={t('fields.eventProgram.description')} path={`${path}.item.description`} component={MarkdownEditor} componentProps={{noPreview: true}} />
        <Switch label={t('fields.eventProgram.showInLists')} path={`${path}.item.showInLists`} inline />
        <Callout><T msg={'pages.events.ballProgram.currentItemAlwaysShownInLists'}/></Callout>
      </SectionCard>
  }
}

const {
  Field: DanceField,
  Input: DanceInput,
} = formFor<Dance>()

function DanceEditor({dance}: {dance: Dance}) {
  const t = useT('domain.dance')
  return <DanceEditorContainer dance={dance}>
    <DanceInput label={t('name')} path="name" />
    <DanceField label={t('description')} path="description" component={MarkdownEditor} componentProps={{noPreview: true}}/>
    <DanceInput label={t('source')} labelInfo={t('sourceInfo')} path="source" />
    <Link target="_blank" to={`/dances/${dance._id}`}><Icon icon="link"/>{useTranslation('pages.events.ballProgram.linkToCompleteDance')}</Link>
  </DanceEditorContainer>
}

interface LinkToSlideProps {
  children: ReactNode
  id: string
  hashLink?: boolean
}

function LinkToSlide({children, id, hashLink}: LinkToSlideProps) {
  if (hashLink) {
    return <RegularLink href={`#${id}`}>{children}</RegularLink>
  }
  return <Link to={id}>{children}</Link>
}
