import {ActionButton as Button} from 'libraries/forms'
import {
  DanceSet, DEFAULT_INTERVAL_MUSIC, EventProgramRow, IntervalMusic, switchFor, useAppendToList
} from 'components/event/EventProgramForm'
import { ProgramTypeIcon } from 'components/event/ProgramTypeIcon'
import {useT} from 'i18n'
import {guid} from 'utils/guid'

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
      nameInLists: null,
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
      intervalMusic: DEFAULT_INTERVAL_MUSIC,
    } as DanceSet
  }
}

export const IntervalMusicSwitch = switchFor<IntervalMusic>({
  isChecked: intervalMusic => (intervalMusic?.duration ?? 0) > 0,
  toValue: checked => checked ? DEFAULT_INTERVAL_MUSIC : null,
})
