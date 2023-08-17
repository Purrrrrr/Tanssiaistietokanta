import React from 'react'
import {Link} from 'react-router-dom'

import {formFor, MarkdownEditor, SyncStatus} from 'libraries/forms'
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
import t from 'components/EventProgramEditor/translations'
import { ProgramItemPath, ProgramSectionPath } from 'components/EventProgramEditor/types'
import { LinkToSlide } from 'components/Slide'
import { Duration } from 'components/widgets/Duration'
import { SlideStyleSelector } from 'components/widgets/SlideStyleSelector'

import {Dance} from 'types'

import {t as bt} from './strings'
import {ProgramItemData, SlideContent} from './useBallProgram'

interface SlideEditorProps {
  slide: SlideContent
  eventId: string
  eventProgram: EventProgramSettings
}
export function SlideEditor({slide, eventId, eventProgram}: SlideEditorProps) {
  const {formProps, state} = useEventProgramEditorForm(eventId, eventProgram)
  const isDance = slide.slideContent?.type === 'dance'


  return <div>
    <Form {...formProps}>
      <SectionCard>
        <H2>{bt`slideProperties`} <SyncStatus state={state} /></H2>
        {slide.parent &&
          <p><Link to={slide.parent.id}><Icon icon="link"/>{' '}{slide.parent.title}</Link></p>
        }
        <SlideStyleEditor editorData={slide.editorData} />

        {isDance && <Field label={t`dance`} path={`${slide.editorData.path}.item` as any} component={DanceProgramChooser} />}
      </SectionCard>
      <SlideContentEditor editorData={slide.editorData} slideContent={slide.slideContent} />
    </Form>
  </div>
}

function SlideStyleEditor({editorData}: Pick<SlideContent, 'editorData'>) {
  const {type, path} = editorData
  switch (type) {
    case 'Event':
      return <>
        <Field label={t`fields.eventDefaultStyle`} path="slideStyleId" component={SlideStyleSelector} componentProps={{text: t`fields.eventDefaultStyle`}} />
        <InheritedSlideStyleSelector showLabel path="introductions.titleSlideStyleId" text={t`fields.titleStyle`} />
      </>
    case 'DanceSet':
      return <InheritedSlideStyleSelector showLabel path={`${path}.titleSlideStyleId`} text={t`fields.titleStyle`} />
    case 'IntervalMusic':
      return <>
        <InheritedSlideStyleSelector showLabel path={`${path}.intervalMusic.slideStyleId`} text={t`fields.style`} />
      </>
    case 'ProgramItem':
      return <>
        <InheritedSlideStyleSelector showLabel path={`${path}.slideStyleId`} text={t`fields.style`} />
      </>
  }
}

function SlideContentEditor({editorData, slideContent}: Pick<SlideContent, 'editorData' | 'slideContent'>) {
  const {type, path} = editorData
  switch (type) {
    case 'Event':
      return null
    case 'DanceSet':
      return <SectionCard>
        <H2>{bt`danceSetTitle`}</H2>
        <Input label={t`fields.danceSetName`} path={`${path}.title`} />
        <ListField label="" path={`${path}.program`} component={ProgramItem} renderConflictItem={programItemToString} />
      </SectionCard>
    case 'IntervalMusic':
      return <SectionCard>
        <H2>{bt`intervalMusicTitle`}</H2>
        <IntervalMusicDescriptionEditor path={`${path}.intervalMusic`} noPreview />
      </SectionCard>
    case 'ProgramItem':
      return <ProgramItemEditor editorData={editorData} slideContent={slideContent} />
  }
}

interface ProgramItemProps {
  dragHandle: React.ReactNode
  path: `${ProgramSectionPath}.program`
  itemIndex: number
}

const ProgramItem = React.memo(function ProgramEditor({dragHandle, path, itemIndex} : ProgramItemProps) {
  const itemPath = `${path}.${itemIndex}` as ProgramItemPath
  const item = useValueAt(itemPath)

  if (!item) return null
  const {__typename } = item.item

  return <Flex alignItems='center' spaced>
    <ProgramTypeIcon type={__typename} />
    <div className="flex-fill">
      <LinkToSlide id={item._id} title={programItemToString(item)} />
    </div>
    <div><Duration value={__typename === 'RequestedDance' ? 0 : item.item.duration} /></div>
    <div>
      {dragHandle}
      <RemoveItemButton path={path} index={itemIndex} title={t`buttons.remove`} icon="cross" className="deleteItem" />
    </div>
  </Flex>
})

function ProgramItemEditor({editorData, slideContent}: {editorData: ProgramItemData, slideContent: SlideContent['slideContent']}) {
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
        <H2>{bt`infoTitle`}</H2>
        <Input label={t`fields.eventProgram.name`} path={`${path}.item.name`} required />
        <Field label={t`fields.eventProgram.description`} path={`${path}.item.description`} component={MarkdownEditor} componentProps={{noPreview: true}} />
        <Switch label={t`fields.eventProgram.showInLists`} path={`${path}.item.showInLists`} inline />
        <Callout>{bt`currentItemAlwaysShownInLists`}</Callout>
      </SectionCard>
  }

}

const {
  Field: DanceField,
  Input: DanceInput,
} = formFor<Dance>()
function DanceEditor({dance}: {dance: Dance}) {
  return <DanceEditorContainer dance={dance}>
    <DanceInput label="Nimi" path="name" />
    <DanceField label="Kuvaus ja lyhyt ohje" path="description" component={MarkdownEditor} componentProps={{noPreview: true}}/>
    <Link target="_blank" to={`/dances/${dance._id}`}><Icon icon="link"/>{bt`linkToCompleteDance`}</Link>
  </DanceEditorContainer>

}
