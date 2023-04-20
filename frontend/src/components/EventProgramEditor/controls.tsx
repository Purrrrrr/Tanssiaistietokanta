import React from 'react'

import {ActionButton as Button} from 'libraries/forms'
import {Icon, IconName} from 'libraries/ui'
import {guid} from 'utils/guid'

import {DanceSet, EventProgramItem, EventProgramRow, IntervalMusic} from './types'

import { switchFor, useAppendToList } from './form'
import t from './translations'

const DEFAULT_INTERVAL_MUSIC_DURATION = 15*60
const DEFAULT_INTERVAL_MUSIC: IntervalMusic = {
  name: null,
  description: null,
  duration: DEFAULT_INTERVAL_MUSIC_DURATION,
  slideStyleId: null,
}

export function AddIntroductionButton() {
  const addIntroduction = useAppendToList('introductions.program')
  function addIntroductoryInfo() {
    addIntroduction(newEventProgramItem)
  }
  return <Button
    text={t`buttons.addIntroductoryInfo`}
    rightIcon={<ProgramTypeIcon type="EventProgram" />}
    onClick={addIntroductoryInfo}
    className="addIntroductoryInfo"
  />
}

export function newEventProgramItem(): EventProgramRow {
  return {
    item: {__typename: 'EventProgram', _id: undefined, name: t`placeholderNames.newProgramItem`, showInLists: false},
    _id: guid(),
  }
}

export function AddDanceSetButton() {
  const onAddDanceSet = useAppendToList('danceSets')
  function addDanceSet() {
    onAddDanceSet(newDanceSet)
  }
  return <Button
    text={t`buttons.addDanceSet`}
    rightIcon={<ProgramTypeIcon type="Dance" />}
    onClick={addDanceSet}
    className="addDanceSet"
  />
}

function newDanceSet(danceSets: DanceSet[]): DanceSet {
  const danceSetNumber = danceSets.length + 1
  const dances = Array.from({length: 6}, () => ({item: {__typename: 'RequestedDance'}, _id: guid(), slideStyleId: null} as EventProgramRow))
  return {
    _id: guid(),
    title: t('placeholderNames.danceSet', {number: danceSetNumber}),
    program: dances,
    titleSlideStyleId: null,
    intervalMusic: null,
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
  const icons: Record<ProgramType, IconName> = {
    Dance: 'music',
    RequestedDance: 'music',
    EventProgram: 'info-sign',
    IntervalMusic: 'time',
  }

  return <Icon className={`programType programType-${type}`} icon={icons[type]} title={t(`programTypes.${type}`)} />
}
