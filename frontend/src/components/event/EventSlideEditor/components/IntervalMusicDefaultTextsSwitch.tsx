import { DEFAULT_INTERVAL_MUSIC, IntervalMusic, switchFor } from 'components/event/EventProgramForm'

export const IntervalMusicSwitch = switchFor<IntervalMusic>({
  isChecked: intervalMusic => (intervalMusic?.duration ?? 0) > 0,
  toValue: checked => checked ? DEFAULT_INTERVAL_MUSIC : null,
})

export const IntervalMusicDefaultTextsSwitch = switchFor<IntervalMusic>({
  isChecked: intervalMusic => (intervalMusic?.name ?? null) === null,
  toValue: (checked, intervalMusic) => {
    const defaults = intervalMusic ?? DEFAULT_INTERVAL_MUSIC
    return checked
      ? { ...defaults, name: null, description: null }
      : { ...defaults, name: '', description: ' ' }
  },
})
