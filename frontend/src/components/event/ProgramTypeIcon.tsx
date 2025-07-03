import { InfoSign, Music, Time } from '@blueprintjs/icons'

import { EventProgramItem } from 'components/event/EventProgramForm'
import {useT} from 'i18n'

type ProgramType = EventProgramItem['__typename'] | 'IntervalMusic'

export function ProgramTypeIcon({type}: {type: ProgramType}) {
  const t = useT('components.eventProgramEditor')
  const components: Record<ProgramType, React.ComponentType<{ className?: string, title?: string | null | false}>> = {
    Dance: Music,
    RequestedDance: Music,
    EventProgram: InfoSign,
    IntervalMusic: Time,

  }
  const Icon = components[type]

  return <Icon className={`programType programType-${type}`} title={t(`programTypes.${type}`)} />
}
