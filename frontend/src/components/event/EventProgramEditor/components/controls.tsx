import { ActionButton as Button } from 'libraries/forms'
import {
  DanceSet, DEFAULT_INTERVAL_MUSIC, EventProgramRow, IntervalMusic, ProgramSectionPath, switchFor, useAppendToList,
} from 'components/event/EventProgramForm'
import { ProgramTypeIcon } from 'components/event/ProgramTypeIcon'
import { useT } from 'i18n'
import { guid } from 'utils/guid'

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

export function DanceSetItemButtons({ path }: { path: ProgramSectionPath }) {
  const t = useT('components.eventProgramEditor')
  const programPath = `${path}.program` as const
  const onAddItem = useAppendToList(programPath)
  const newEventProgramItem = useCreateNewEventProgramItem()

  return <>
    <Button
      text={t('buttons.addDance')}
      rightIcon={<ProgramTypeIcon type="Dance" />}
      onClick={() => onAddItem({ item: { __typename: 'RequestedDance' }, slideStyleId: null, _id: guid() })}
      className="addDance" />
    <Button
      text={t('buttons.addInfo')}
      rightIcon={<ProgramTypeIcon type="EventProgram" />}
      onClick={() => onAddItem(newEventProgramItem)}
      className="addInfo"
    />
  </>
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
      showInLists: false,
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
    const dances = Array.from({ length: 6 }, () => ({ item: { __typename: 'RequestedDance' }, _id: guid(), slideStyleId: null } as EventProgramRow))
    return {
      _id: guid(),
      title: t('placeholderNames.danceSet', { number: danceSetNumber }),
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
