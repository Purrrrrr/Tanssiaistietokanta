import React from 'react'

import {ActionButton as Button} from 'libraries/forms'
import {Icon, IconName} from 'libraries/ui'
import {guid} from 'utils/guid'

import {DanceSet, EventProgramItem, EventProgramRow} from './types'

import { switchFor, useAppendToList } from './form'
import t from './translations'

const DEFAULT_INTERVAL_MUSIC_DURATION = 15*60

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
  const dances = Array.from({length: 6}, () => ({item: {__typename: 'RequestedDance'}, _id: guid()} as EventProgramRow))
  return {
    _id: guid(),
    title: t('placeholderNames.danceSet', {number: danceSetNumber}),
    program: dances,
    intervalMusicDuration: DEFAULT_INTERVAL_MUSIC_DURATION,
    titleSlideStyleId: null,
    intervalMusicSlideStyleId: null,
  }
}

export const IntervalMusicSwitch = switchFor<number>({
  isChecked: num => (num ?? 0) > 0,
  toValue: checked => checked ? DEFAULT_INTERVAL_MUSIC_DURATION : 0,
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
