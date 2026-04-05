import { Volunteer } from 'types'

import { ColoredTag } from 'components/widgets/ColoredTag'
import { sortedBy } from 'utils/sorted'

export interface VolunteeredInProps {
  volunteer: Volunteer
}

export function VolunteeredIn({ volunteer }: VolunteeredInProps) {
  const sortedVolunteeredIn = sortedBy(
    volunteer.volunteeredIn,
    v => v.workshop.event.beginDate,
  )
  return <div className="flex flex-wrap gap-0.5">
    {sortedVolunteeredIn.map(v =>
      <ColoredTag
        key={v.workshop._id}
        hashSource={v.workshop.event._id}
        tag={v.workshop.event.name}
        title={v.workshop.name}
      />,
    )}
  </div>
}
