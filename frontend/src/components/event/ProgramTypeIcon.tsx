import classNames from 'classnames'

import { InfoSign, Music, Time } from 'libraries/ui/icons'
import { EventProgramItem } from 'components/event/EventProgramForm'
import { useT } from 'i18n'

type ProgramType = EventProgramItem['__typename'] | 'IntervalMusic'

const typeClasses = {
  Dance: 'text-[#cd6266]',
  RequestedDance: 'text-gray-400',
  EventProgram: 'text-[#4d92c2]',
  IntervalMusic: 'text-[#c2a222]',
} satisfies Record<ProgramType, string>
const components: Record<ProgramType, React.ComponentType<{ className?: string, title?: string | null | false }>> = {
  Dance: Music,
  RequestedDance: Music,
  EventProgram: InfoSign,
  IntervalMusic: Time,
}

export function ProgramTypeIcon({ type, className }: { type: ProgramType, className?: string }) {
  const t = useT('components.eventProgramEditor')
  const Icon = components[type]

  return <Icon
    className={classNames(
      className,
      `inline-flex! items-center justify-center programType-${type}`,
      typeClasses[type],
    )}
    title={t(`programTypes.${type}`)}
  />
}
