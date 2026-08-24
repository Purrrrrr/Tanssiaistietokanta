import { Volunteer } from 'types'

import { Tag } from 'libraries/ui'
import { rainbow } from 'libraries/ui/tagColorSchemes'
import { sortedBy } from 'utils/sorted'

const scheme = rainbow(20)
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
      <Tag
        colorScheme={scheme}
        className="saturate-60"
        key={v._id}
        small
        hashSource={v.event._id}
        tag={v.event.name}
        title={v.workshop?.name ?? v.role.name}
      />,
    )}
  </div>
}
