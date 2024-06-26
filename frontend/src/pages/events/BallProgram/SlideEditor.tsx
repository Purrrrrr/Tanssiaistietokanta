import React from 'react'
import {Link} from 'react-router-dom'

import {DragHandle, formFor, MarkdownEditor, SyncStatus} from 'libraries/forms'
import {Callout, Flex, H2, Icon, SectionCard} from 'libraries/ui'
import {DanceEditorContainer} from 'components/DanceEditor'
import {IntervalMusicDescriptionEditor, programItemToString} from 'components/EventProgramEditor'
import {
  DanceProgramChooser,
  EventProgramSettings,
  Field,
  Form,
  InheritedSlideStyleSelector,
  Input,
  ListField,
  ProgramTypeIcon,
  RemoveItemButton,
  Switch,
  useEventProgramEditorForm,
  useValueAt,
} from 'components/EventProgramEditor/components'
import { ProgramItemPath, ProgramSectionPath } from 'components/EventProgramEditor/types'
import { LinkToSlide } from 'components/Slide'
import { Duration } from 'components/widgets/Duration'
import { SlideStyleSelector } from 'components/widgets/SlideStyleSelector'
import { T, useT, useTranslation } from 'i18n'

import {Dance} from 'types'

import {ProgramItemData, SlideContent} from './useBallProgram'

interface SlideEditorProps {
  slide: SlideContent
  eventId: string
  eventProgram: EventProgramSettings
}
export function SlideEditor({slide, eventId, eventProgram}: SlideEditorProps) {
  const t = useT('components.eventProgramEditor')
  const {formProps, state} = useEventProgramEditorForm(eventId, eventProgram)
  const isDance = slide.slideContent?.type === 'dance'

  return <div>
    <Form {...formProps}>
      <SectionCard>
        <H2><T msg={'pages.events.ballProgram.slideProperties'}/> <SyncStatus state={state} /></H2>
        {slide.parent &&
          <p><Link to={slide.parent.id}><Icon icon="link"/>{' '}{slide.parent.title}</Link></p>
        }
        <SlideStyleEditor editorData={slide.editorData} />

        {isDance && slide.editorData.type === 'ProgramItem' &&
          <Field label={t('dance')} path={`${slide.editorData.path}.item`} component={DanceProgramChooser} />}
      </SectionCard>
      <SlideContentEditor editorData={slide.editorData} slideContent={slide.slideContent} />
    </Form>
  </div>
}

function SlideStyleEditor({editorData}: Pick<SlideContent, 'editorData'>) {
  const t = useT('components.eventProgramEditor')
  const {type, path} = editorData
  switch (type) {
    case 'Event':
      return <>
        <Field label={t('fields.eventDefaultStyle')} path="slideStyleId" component={SlideStyleSelector} componentProps={{text: t('fields.eventDefaultStyle')}} />
        <InheritedSlideStyleSelector showLabel path="introductions.titleSlideStyleId" text={t('fields.titleStyle')} />
      </>
    case 'DanceSet':
      return <InheritedSlideStyleSelector showLabel path={`${path}.titleSlideStyleId`} text={t('fields.titleStyle')} />
    case 'IntervalMusic':
      return <>
        <InheritedSlideStyleSelector showLabel path={`${path}.intervalMusic.slideStyleId`} text={t('fields.style')} />
      </>
    case 'ProgramItem':
      return <>
        <InheritedSlideStyleSelector showLabel path={`${path}.slideStyleId`} text={t('fields.style')} />
      </>
  }
}

function SlideContentEditor({editorData, slideContent}: Pick<SlideContent, 'editorData' | 'slideContent'>) {
  const t = useT('components.eventProgramEditor')
  const {type, path} = editorData
  switch (type) {
    case 'Event':
      return null
    case 'DanceSet':
      return <SectionCard>
        <H2><T msg={'pages.events.ballProgram.danceSetTitle'}/></H2>
        <Input label={t('fields.danceSetName')} path={`${path}.title`} />
        <ListField label="" path={`${path}.program`} component={ProgramItem} renderConflictItem={item => programItemToString(item, t)} />
      </SectionCard>
    case 'IntervalMusic':
      return <SectionCard>
        <H2><T msg={'pages.events.ballProgram.intervalMusicTitle'}/></H2>
        <IntervalMusicDescriptionEditor path={`${path}.intervalMusic`} noPreview />
      </SectionCard>
    case 'ProgramItem':
      return <ProgramItemEditor editorData={editorData} slideContent={slideContent} />
  }
}

interface ProgramItemProps {
  dragHandle: DragHandle
  path: `${ProgramSectionPath}.program`
  itemIndex: number
}

const ProgramItem = React.memo(function ProgramEditor({dragHandle, path, itemIndex} : ProgramItemProps) {
  const t = useT('components.eventProgramEditor')
  const itemPath = `${path}.${itemIndex}` as ProgramItemPath
  const item = useValueAt(itemPath)

  if (!item) return null
  const {__typename } = item.item

  return <Flex alignItems='center' spaced>
    <ProgramTypeIcon type={__typename} />
    <div className="flex-fill">
      <LinkToSlide id={item._id} title={programItemToString(item, t)} />
    </div>
    <div><Duration value={__typename === 'RequestedDance' ? 0 : item.item.duration} /></div>
    <div>
      {dragHandle}
      <RemoveItemButton path={path} index={itemIndex} title={t('buttons.remove')} icon="cross" className="deleteItem" />
    </div>
  </Flex>
})

function ProgramItemEditor({editorData, slideContent}: {editorData: ProgramItemData, slideContent: SlideContent['slideContent']}) {
  const t = useT('components.eventProgramEditor')
  const __typename = useValueAt(`${editorData.path}.item.__typename`)
  const {path} = editorData

  switch(__typename) {
    case 'Dance':
      if (slideContent?.type !== 'dance') return null
      return <SectionCard>
        <DanceEditor dance={slideContent.value} />
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
