import { Tag, TagProps } from 'libraries/ui'
import { rainbow } from 'libraries/ui/tagColorSchemes'

const categoryColors = rainbow(16)

export type WorkshopTagProps = Omit<TagProps, 'colorScheme'>

export function WorkshopTag(props: WorkshopTagProps) {
  return <Tag {...props} className="saturate-85" colorScheme={categoryColors} />
}
