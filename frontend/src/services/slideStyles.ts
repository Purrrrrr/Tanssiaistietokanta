import { useT } from 'i18n'

export interface SlideStyle {
  id: string | null
  name: string
  styleName: string
  color: string
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
  }: UseEventSlideStylesOptions,
): {
  styles: SlideStyle[]
  defaultStyle: SlideStyle
} {
  const { styles, defaultStyle } = useSlideStyles()
  if (useStyleInheritance) {
    const inheritedStyle = styles.find(s => s.id === inheritedStyleId) ?? defaultStyle
    const name = inheritedStyleName
      ? `${inheritedStyleName} (${inheritedStyle.name})`
      : inheritedStyle.name

    return {
      styles: [
        { ...inheritedStyle, name, id: null },
        ...styles,
      ],
      defaultStyle,
    }
  }
  return { styles, defaultStyle }
}

function useSlideStyles() {
  const t = useT('domain.slideStyles')
  const styles: SlideStyle[] = [
    { styleName: 'default', name: t('default'), color: '#000' },
    { styleName: 'dark', name: t('dark'), color: '#fff' },
    { styleName: 'flower-title1', name: t('flowerBig', { number: 1 }), color: '#000' },
    { styleName: 'flower-title2', name: t('flowerBig', { number: 2 }), color: '#000' },
    { styleName: 'flower-title3', name: t('flowerBig', { number: 3 }), color: '#000' },
    { styleName: 'flower-title4', name: t('flowerBig', { number: 4 }), color: '#000' },
    { styleName: 'flower-title5', name: t('flowerBig', { number: 5 }), color: '#000' },
    { styleName: 'flower-title6', name: t('flowerBig', { number: 6 }), color: '#000' },
    { styleName: 'flower-frame1', name: t('flowerFramed', { number: 1 }), color: '#000' },
    { styleName: 'flower-frame2', name: t('flowerFramed', { number: 2 }), color: '#000' },
    { styleName: 'flower-frame3', name: t('flowerFramed', { number: 3 }), color: '#000' },
    { styleName: 'flower-frame4', name: t('flowerFramed', { number: 4 }), color: '#000' },
    { styleName: 'flower-frame5', name: t('flowerFramed', { number: 5 }), color: '#000' },
    { styleName: 'flower-frame6', name: t('flowerFramed', { number: 6 }), color: '#000' },
    { styleName: 'flower-frame7', name: t('flowerFramed', { number: 7 }), color: '#000' },
  ].map(style => ({ ...style, id: style.styleName }))

  return { defaultStyle: styles[0], styles }
}
