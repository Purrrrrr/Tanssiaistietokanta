import {useState} from 'react'

import { useDance } from 'services/dances'

import {ActionButton as Button, MarkdownEditor, MenuButton} from 'libraries/forms'
import {Flex} from 'libraries/ui'
import {DanceEditor} from 'components/DanceEditor'
import {LoadingState} from 'components/LoadingState'
import {Duration} from 'components/widgets/Duration'
import {DurationField} from 'components/widgets/DurationField'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {useT} from 'i18n'

import {
  DanceProgramChooser,
  Field,
  InheritedSlideStyleSelector,
  Input,
  IntervalMusicDefaultTextsSwitch,
  ProgramTypeIcon,
  Switch,
  useOnChangeFor,
  useValueAt,
} from '../components'
import {DanceProgramPath, DanceSetPath, IntervalMusicPath, ProgramItemPath} from '../types'

export function ProgramDetailsEditor({path}: {path: ProgramItemPath}) {
  const __typename = useValueAt(`${path}.item.__typename`)
  //If something is deleted useValueAt may return undefined
  if (__typename === undefined) return null

  switch(__typename) {
    case 'Dance':
    case 'RequestedDance':
      return <DanceItemEditor path={path as DanceProgramPath} />
    case 'EventProgram':
      return <EventProgramItemEditor path={path} />
  }
}

export function ProgramDetailsEditor2({path}: {path: ProgramItemPath}) {
  const t = useT('components.eventProgramEditor')
  const __typename = useValueAt(`${path}.item.__typename`)
  const setItem = useOnChangeFor(`${path}.item`)
  const id = useValueAt(`${path}.item._id`)

  //If something is deleted useValueAt may return undefined
  if (__typename === undefined) return null

  switch(__typename) {
    case 'Dance':
    case 'RequestedDance':
      if (!id) return null
      return <DanceLoadingEditor danceId={id} onDeleteDance={() => {setItem({__typename: 'RequestedDance'})}} />
    case 'EventProgram':
      return <>
        <Field label={t('fields.eventProgram.description')} path={`${path}.item.description`} component={MarkdownEditor} />
        <Switch label={t('fields.eventProgram.showInLists')} path={`${path}.item.showInLists`} inline />
      </>
  }
}

function DanceItemEditor({path}: {path: DanceProgramPath}) {
  const t = useT('components.eventProgramEditor')
  return <Field label={t('dance')} labelStyle="hidden" path={`${path as DanceProgramPath}.item`} component={DanceProgramChooser} />
}

function DanceLoadingEditor({danceId, onDeleteDance}: {danceId: string, onDeleteDance: () => unknown}) {
  const result = useDance({id: danceId})
  if (!result.data?.dance) return <LoadingState {...result} />

  const {dance} = result.data
  return <DanceEditor dance={dance} onDelete={onDeleteDance} showLink />
}

function EventProgramItemEditor({path}: {path: ProgramItemPath}) {
  const t = useT('components.eventProgramEditor')
  return <Input label={t('fields.eventProgram.name')} labelStyle="hidden" path={`${path}.item.name`} required />
}

function IntervalMusicEditor({danceSetPath}: {danceSetPath: DanceSetPath}) {
  const t = useT('components.eventProgramEditor')
  const intervalMusicPath = `${danceSetPath}.intervalMusic` as const
  const durationPath = `${danceSetPath}.intervalMusic.duration` as const
  const onSetIntervalMusic = useOnChangeFor(intervalMusicPath)

  return <tr className="intervalMusicDuration">
    <td><ProgramTypeIcon type="IntervalMusic" /></td>
    <td>
      <IntervalMusicDetailsEditor path={intervalMusicPath} />
    </td>
    <td>
      <Field label={t('fields.intervalMusicDuration')} inline labelStyle="hidden" path={durationPath} component={DurationField} />
    </td>
    <td>
      <InheritedSlideStyleSelector path={`${danceSetPath}.intervalMusic.slideStyleId`} text={t('fields.style')} />
      <Button title={t('buttons.remove')} intent="danger" icon="cross" onClick={() => onSetIntervalMusic(null)} className="delete" />
    </td>
  </tr>
}

function IntervalMusicDetailsEditor({path}: {path: IntervalMusicPath}) {
  const t = useT('components.eventProgramEditor')
  const [open, setOpen] = useState(false)
  return <Flex className="eventProgramItemEditor">
    <div>{t('programTypes.IntervalMusic')}</div>
    <MenuButton
      menu={
        <div className="eventProgramItemPopover">
          <IntervalMusicDescriptionEditor path={path} />
        </div>
      }
      text={t('buttons.editIntervalMusic')}
      buttonProps={{rightIcon: 'caret-down'}}
      open={open}
      onSetOpen={setOpen}
    />
  </Flex>
}

export function IntervalMusicDescriptionEditor({path, noPreview}: {path: IntervalMusicPath, noPreview?: boolean}) {
  const t = useT('components.eventProgramEditor')
  const intervalMusic = useValueAt(path)
  const hasCustomTexts = typeof intervalMusic?.name === 'string'
  return <>
    <IntervalMusicDefaultTextsSwitch label={t('fields.intervalMusic.useDefaultTexts')} path={path} />
    {hasCustomTexts
      ? <>
        <h2>{t('titles.customIntervalMusicTexts')}</h2>
        <Input label={t('fields.intervalMusic.name')} path={`${path}.name`} required />
        <Field label={t('fields.intervalMusic.description')} path={`${path}.description`} component={MarkdownEditor} componentProps={{noPreview}} />
      </>
      : <>
        <h2>{t('titles.defaultIntervalMusicTexts')}</h2>
        <Input label={t('fields.intervalMusic.name')} path='defaultIntervalMusic.name' componentProps={{placeholder:t('programTypes.IntervalMusic')}} />
        <Field label={t('fields.intervalMusic.description')} path="defaultIntervalMusic.description" component={MarkdownEditor} componentProps={{noPreview}} />
      </>
    }
  </>
}
