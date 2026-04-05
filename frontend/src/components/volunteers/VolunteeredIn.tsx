import { Volunteer } from 'types'

import { ColoredTag } from 'components/widgets/ColoredTag'

export interface VolunteeredInProps {
  volunteer: Volunteer
}

export function VolunteeredIn({ volunteer }: VolunteeredInProps) {
  return <div className="flex flex-wrap gap-x-1">
    {volunteer.volunteeredIn.map(v =>
      <ColoredTag
        key={v.workshop._id}
        hashSource={v.workshop.event._id}
        tag={v.workshop.event.name}
        title={v.workshop.name}
      />,
    )}
  </div>
}
