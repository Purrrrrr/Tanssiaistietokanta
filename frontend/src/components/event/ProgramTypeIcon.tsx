import classNames from 'classnames'

import { Icon, type IconName } from '@/libraries/ui'
import { EventProgramRow } from '@/components/event/EventProgramForm'
import { useT } from '@/i18n'

type ProgramType = EventProgramRow['type'] | 'IntervalMusic'

const typeClasses = {
  Dance: 'text-[#cd6266]',
  RequestedDance: 'text-gray-400',
  EventProgram: 'text-[#4d92c2]',
  IntervalMusic: 'text-[#c2a222]',
} satisfies Record<ProgramType, string>
const icons: Record<ProgramType, IconName> = {
  Dance: 'music',
  RequestedDance: 'music',
  EventProgram: 'infoSign',
  IntervalMusic: 'time',
}

export function ProgramTypeIcon({ type, className }: { type: ProgramType, className?: string }) {
  const t = useT('components.eventProgramEditor')

  return <Icon
    icon={icons[type]}
    className={classNames(
      className,
      `inline-flex! items-center justify-center programType-${type}`,
      typeClasses[type],
    )}
    title={t(`programTypes.${type}`)}
  />
}
