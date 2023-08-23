import { useT } from 'i18n'

export interface SlideStyle {
  id: string | null
  name: string
  styleName: string
  color: string
  background: string
}

interface UseEventSlideStylesOptions {
  useStyleInheritance?: boolean
  inheritedStyleId?: string | null
  inheritedStyleName?: string
}

export function useEventSlideStyles(
  {
    useStyleInheritance,
    inheritedStyleId,
    inheritedStyleName,
  }: UseEventSlideStylesOptions
): {
  styles: SlideStyle[]
  defaultStyle: SlideStyle
} {
  const {styles, defaultStyle} = useSlideStyles()
  if (useStyleInheritance) {
    const inheritedStyle = styles.find(s => s.id === inheritedStyleId) ?? defaultStyle
    const name = inheritedStyleName
      ? `${inheritedStyleName} (${inheritedStyle.name})`
      : inheritedStyle.name

    return {
      styles: [
        { ...inheritedStyle, name, id: null },
        ...styles
      ],
      defaultStyle,
    }
  }
  return { styles, defaultStyle }
}

function useSlideStyles() {
  const t = useT('domain.slideStyles')
  const styles: SlideStyle[] = [
    {styleName: 'default', name: t('default'), background: '#fff', color: '#000'},
    { styleName: 'dark', name: t('dark'), background: '#000', color: '#fff' },
    { styleName: 'flower-title1', name: t('flowerBig', {number: 1}), background: '#F681BD', color: '#000' },
    { styleName: 'flower-title2', name: t('flowerBig', {number: 2}), background: '#C31C6D', color: '#000' },
    { styleName: 'flower-title3', name: t('flowerBig', {number: 3}), background: '#DF2300', color: '#000' },
    { styleName: 'flower-title4', name: t('flowerBig', {number: 4}), background: '#DC3D5F', color: '#000' },
    { styleName: 'flower-title5', name: t('flowerBig', {number: 5}), background: '#F37ECF', color: '#000' },
    { styleName: 'flower-title6', name: t('flowerBig', {number: 6}), background: '#DC4B8E', color: '#000' },
    { styleName: 'flower-frame1', name: t('flowerFramed', {number: 1}), background: '#B980A0', color: '#000' },
    { styleName: 'flower-frame2', name: t('flowerFramed', {number: 2}), background: '#DC918C', color: '#000' },
    { styleName: 'flower-frame3', name: t('flowerFramed', {number: 3}), background: '#97278D', color: '#000' },
    { styleName: 'flower-frame4', name: t('flowerFramed', {number: 4}), background: '#FEC900', color: '#000' },
    { styleName: 'flower-frame5', name: t('flowerFramed', {number: 5}), background: '#FE6BBA', color: '#000' },
    { styleName: 'flower-frame6', name: t('flowerFramed', {number: 6}), background: '#F02735', color: '#000' },
    { styleName: 'flower-frame7', name: t('flowerFramed', {number: 7}), background: '#DC91CB', color: '#000' },
  ].map(style => ({...style, id: style.styleName}))

  return {defaultStyle: styles[0], styles}
}
