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
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {useT} from 'i18n'

import { DanceProgramItemSlideProps, DanceSet, DanceSetSlideProps, EventProgramItem, EventSlideProps, IntervalMusicSlideProps, RequestedDance, WithEventProgram } from '../../EventSlide/types'

export function EventSlideEditor(props: WithEventProgram<EventSlideProps>) {
  const t = useT('components.eventProgramEditor')

  switch(props.type) {
    case 'title':
      return <>
        <Input labelStyle="above" label={t('fields.programTitle')} path="introductions.title" inline />
        <InheritedSlideStyleSelector path="introductions.titleSlideStyleId" text={t('fields.titleStyle')} />
      </>
    case 'introduction': {
      const itemPath = `introductions.program.${props.itemIndex}` as const
      return <>
        <InheritedSlideStyleSelector
          path={`${itemPath}.slideStyleId`} text={t('fields.style')} />
      </>

    }
    case 'danceSet': {
      const itemPath = `danceSets.${props.danceSetIndex}` as const
      return <>
        <Input labelStyle="above" label={t('fields.danceSetName')} path={`${itemPath}.title`} inline />
        <InheritedSlideStyleSelector path={`${itemPath}.titleSlideStyleId`} text={t('fields.titleStyle')} />

      </>
    }
    case 'intervalMusic': {
      return <>
        <InheritedSlideStyleSelector path={`danceSets.${props.danceSetIndex}.intervalMusic.slideStyleId`} text={t('fields.style')} />
      </>
    }
    case 'programItem': {
      const itemPath = `danceSets.${props.danceSetIndex}.program.${props.itemIndex}` as const
      return <>

        <InheritedSlideStyleSelector path={`${itemPath}.slideStyleId`} text={t('fields.style')} />
      </>
    }
  }
}

