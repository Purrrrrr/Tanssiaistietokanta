import {ActionButton as Button} from 'libraries/forms'
import {Icon, IconName} from 'libraries/ui'
import {useT} from 'i18n'
import {guid} from 'utils/guid'

import {DanceSet, EventProgramItem, EventProgramRow, IntervalMusic} from '../types'
import { switchFor, useAppendToList } from './form'

const DEFAULT_INTERVAL_MUSIC_DURATION = 15*60
const DEFAULT_INTERVAL_MUSIC: IntervalMusic = {
  name: null,
  description: null,
  duration: DEFAULT_INTERVAL_MUSIC_DURATION,
  slideStyleId: null,
}

export function AddIntroductionButton() {
  const t = useT('components.eventProgramEditor')
  const addIntroduction = useAppendToList('introductions.program')
  const newProgramItem = useCreateNewEventProgramItem()
  function addIntroductoryInfo() {
    addIntroduction(newProgramItem)
  }
  return <Button
    text={t('buttons.addIntroductoryInfo')}
    rightIcon={<ProgramTypeIcon type="EventProgram" />}
    onClick={addIntroductoryInfo}
    className="addIntroductoryInfo"
  />
}

export function useCreateNewEventProgramItem(): () => EventProgramRow {
  const t = useT('components.eventProgramEditor')
  return () => ({
    item: {
      __typename: 'EventProgram',
      _id: undefined,
      name: t('placeholderNames.newProgramItem'),
      description: '',
      duration: 0,
      showInLists: false
    },
    slideStyleId: null,
    _id: guid(),
  })
}

export function AddDanceSetButton() {
  const t = useT('components.eventProgramEditor')
  const onAddDanceSet = useAppendToList('danceSets')
  const newDanceSet = useCreateNewDanceSet()
  function addDanceSet() {
    onAddDanceSet(newDanceSet)
  }
  return <Button
    text={t('buttons.addDanceSet')}
    rightIcon={<ProgramTypeIcon type="Dance" />}
    onClick={addDanceSet}
    className="addDanceSet"
  />
}

function useCreateNewDanceSet(): (danceSets: DanceSet[]) => DanceSet {
  const t = useT('components.eventProgramEditor')
  return (danceSets: DanceSet[]) => {
    const danceSetNumber = danceSets.length + 1
    const dances = Array.from({length: 6}, () => ({item: {__typename: 'RequestedDance'}, _id: guid(), slideStyleId: null} as EventProgramRow))
    return {
      _id: guid(),
      title: t('placeholderNames.danceSet', {number: danceSetNumber}),
      program: dances,
      titleSlideStyleId: null,
      intervalMusic: null,
    } as DanceSet
  }
}

export const IntervalMusicSwitch = switchFor<IntervalMusic>({
  isChecked: intervalMusic => (intervalMusic?.duration ?? 0) > 0,
  toValue: checked => checked ? DEFAULT_INTERVAL_MUSIC : null,
})

export const IntervalMusicDefaultTextsSwitch = switchFor<IntervalMusic>({
  isChecked: intervalMusic => (intervalMusic?.name ?? null) === null,
  toValue: (checked, intervalMusic) => {
    const defaults = intervalMusic ?? DEFAULT_INTERVAL_MUSIC
    console.log(defaults)
    return checked
      ? { ...defaults, name: null, description: null }
      : { ...defaults, name: '', description: ' '}
  }
})

type ProgramType = EventProgramItem['__typename'] | 'IntervalMusic'

export function ProgramTypeIcon({type}: {type: ProgramType}) {
  const t = useT('components.eventProgramEditor')
  const icons: Record<ProgramType, IconName> = {
    Dance: 'music',
    RequestedDance: 'music',
    EventProgram: 'info-sign',
    IntervalMusic: 'time',
  }

  return <Icon className={`programType programType-${type}`} icon={icons[type]} title={t(`programTypes.${type}`)} />
}
