import {Icon, IconName} from 'libraries/ui'
import { EventProgramItem } from 'components/event/EventProgramForm'
import {useT} from 'i18n'

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
