import { Volunteer } from 'types'

import { ColoredTag } from 'components/widgets/ColoredTag'
import { sortedBy } from 'utils/sorted'

export interface VolunteeredInProps {
  volunteer: Volunteer
}

export function VolunteeredIn({ volunteer }: VolunteeredInProps) {
  const sortedVolunteeredIn = sortedBy(
    volunteer.volunteeredIn,
    v => v.event.beginDate,
  )
  return <div className="flex flex-wrap gap-0.5">
    {sortedVolunteeredIn.map(v =>
      <ColoredTag
        key={v._id}
        hashSource={v.event._id}
        tag={v.event.name}
        title={v.workshop?.name ?? v.role.name}
      />,
    )}
  </div>
}
