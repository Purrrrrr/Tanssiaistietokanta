import React from 'react'
import {Link} from 'react-router-dom'

import {formFor, MarkdownEditor, SyncStatus} from 'libraries/forms'
import {Callout, H2, Icon, SectionCard} from 'libraries/ui'
import {DanceEditorContainer} from 'components/DanceEditor'
import {IntervalMusicDescriptionEditor} from 'components/EventProgramEditor'
import {
  EventProgramSettings,
  Field,
  Form,
  Input,
  Switch,
  useEventProgramEditorForm,
  useValueAt,
} from 'components/EventProgramEditor/form'
import { DanceProgramChooser, InheritedSlideStyleSelector } from 'components/EventProgramEditor/selectors'
import t from 'components/EventProgramEditor/translations'
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
        <SlideStyleEditor editorData={slide.editorData} />

        {isDance && <Field label={t`dance`} path={`${slide.editorData.path}.item` as any} component={DanceProgramChooser} />}
      </SectionCard>
      <SlideContentEditor editorData={slide.editorData} />
    </Form>
    {slide.slideContent?.type === 'dance' &&
      <SectionCard>
        <DanceEditor dance={slide.slideContent.value} />
      </SectionCard>
    }
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

function SlideContentEditor({editorData}: Pick<SlideContent, 'editorData'>) {
  const {type, path} = editorData
  switch (type) {
    case 'Event':
      return null
    case 'DanceSet':
      return null
    case 'IntervalMusic':
      return <SectionCard>
        <H2>{bt`intervalMusicTitle`}</H2>
        <IntervalMusicDescriptionEditor path={`${path}.intervalMusic`} noPreview />
      </SectionCard>
    case 'ProgramItem':
      return <ProgramItemEditor editorData={editorData} />
  }
}

function ProgramItemEditor({editorData}: {editorData: ProgramItemData}) {
  const __typename = useValueAt(`${editorData.path}.item.__typename`)
  const {path} = editorData

  switch(__typename) {
    case 'Dance':
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
