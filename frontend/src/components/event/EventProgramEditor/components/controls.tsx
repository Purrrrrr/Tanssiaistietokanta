import { ActionButton as Button } from 'libraries/forms'
import {
  DanceSet, EventProgramRow, IntervalMusic, ProgramSectionPath, switchFor, useAppendToList,
} from 'components/event/EventProgramForm'
import { ProgramTypeIcon } from 'components/event/ProgramTypeIcon'
import { DEFAULT_INTERVAL_MUSIC, newEventProgramEventProgramRow, newRequestedDanceEventProgramRow } from 'components/event/utils'
import { useT, useTranslation } from 'i18n'
import { guid } from 'utils/guid'

export function AddIntroductionButton() {
  const addIntroduction = useAppendToList('introductions.program')
  const newProgramItem = useCreateNewEventProgramItem()

  return <Button
    text={useTranslation('components.eventProgramEditor.buttons.addIntroductoryInfo')}
    rightIcon={<ProgramTypeIcon type="EventProgram" />}
    onClick={() => addIntroduction(newProgramItem())}
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
      onClick={() => onAddItem(newRequestedDanceEventProgramRow())}
      className="addDance" />
    <Button
      text={t('buttons.addInfo')}
      rightIcon={<ProgramTypeIcon type="EventProgram" />}
      onClick={() => onAddItem(newEventProgramItem())}
      className="addInfo"
    />
  </>
}

export function useCreateNewEventProgramItem(): () => EventProgramRow {
  const t = useT('components.eventProgramEditor')
  return () => newEventProgramEventProgramRow({
    name: t('placeholderNames.newProgramItem'),
  })
}

export function AddDanceSetButton() {
  const onAddDanceSet = useAppendToList('danceSets')
  const newDanceSet = useCreateNewDanceSet()
  return <Button
    text={useTranslation('components.eventProgramEditor.buttons.addDanceSet')}
    rightIcon={<ProgramTypeIcon type="Dance" />}
    onClick={() => onAddDanceSet(newDanceSet)}
    className="addDanceSet"
  />
}

function useCreateNewDanceSet(): (danceSets: DanceSet[]) => DanceSet {
  const t = useT('components.eventProgramEditor')
  return (danceSets: DanceSet[]) => {
    const danceSetNumber = danceSets.length + 1
    const dances = Array.from({ length: 6 }, newRequestedDanceEventProgramRow)
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
