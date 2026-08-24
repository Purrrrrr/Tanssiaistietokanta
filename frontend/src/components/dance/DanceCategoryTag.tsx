import { Tag, TagProps } from 'libraries/ui'
import { lightRainbow } from 'libraries/ui/tagColorSchemes'

const categoryColors = lightRainbow(16)

export type DanceCategoryTagProps = Omit<TagProps, 'colorScheme'>

export function DanceCategoryTag(props: DanceCategoryTagProps) {
  return <Tag {...props} colorScheme={categoryColors} />
}
