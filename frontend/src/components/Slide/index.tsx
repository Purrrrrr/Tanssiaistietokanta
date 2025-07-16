import React from 'react'
import classnames from 'classnames'

import { AutosizedSection, Link } from 'libraries/ui'
import {useT} from 'i18n'

import './Slide.scss'
import './slideStyles.scss'

export * from './SlideContainer'
export * from './useSlideshowNavigation'

export interface SlideProps {
  id: string
  title: string | React.ReactElement
  type?: string
  children?: React.ReactElement | React.ReactElement[] | string
  footer?:  string | React.ReactElement
  next?: SlideLink
  navigation?: SlideNavigation
  slideStyleId?: string | null | undefined
  linkComponent?: LinkComponentType
}

export interface SlideNavigation {
  title: string
  items: SlideLink[]
}
export interface SlideLink {
  id: string
  title: string | React.ReactElement
  url?: string | undefined
  hidden?: boolean
  isPlaceholder?: boolean
}

export function Slide({id, title, type, children, footer, next, navigation, slideStyleId, linkComponent}: SlideProps) {
  const className = classnames(
    'slide',
    `slide-style-${slideStyleId ?? 'default'}`,
    type && 'slide-type-'+type,
  )
  return <section className={className}>
    <h1 className="slide-title">{title}</h1>
    <section className="slide-main-content">
      <AutosizedSection className="slide-program-description">
        <div className="slide-content-area">{children}</div>
      </AutosizedSection>
      {footer &&
        <AutosizedSection className="slide-program-footer">
          <div className="slide-content-area">{footer}</div>
        </AutosizedSection>
      }
    </section>
    {next && <NextSlide next={next} linkComponent={linkComponent} />}
    {navigation && <SlideSidebar currentItem={id} navigation={navigation} linkComponent={linkComponent} />}
  </section>
}

function NextSlide({next, linkComponent}: {next: SlideLink, linkComponent?: LinkComponentType}) {
  const t = useT('components.slide')
  return <section className="slide-next-slide">
    <div className="slide-content-area">
      {t('afterThis')}:{' '}
      <LinkToSlide {...next} component={linkComponent} />
    </div>
  </section>
}

function SlideSidebar(
  {currentItem, navigation, linkComponent}: {currentItem: string, navigation: SlideNavigation, linkComponent?: LinkComponentType}
) {
  return <>
    <h2 className="slide-navigation-title">{navigation.title}</h2>
    <AutosizedSection className="slide-navigation">
      <SlideNavigationList currentItem={currentItem} {...navigation} linkComponent={linkComponent} />
    </AutosizedSection>
  </>
}

interface SlideNavigationListProps extends Pick<SlideNavigation, 'items'> {
  currentItem?: string
  linkComponent?: LinkComponentType
}

export function SlideNavigationList({items, currentItem, linkComponent}: SlideNavigationListProps) {
  if (!items.length) return null

  return <ul className={classnames('slide-content-area slide-navigation-list', {'has-current': currentItem !== undefined})}>
    {items.filter(item => item.hidden !== true || item.id === currentItem).map((item) =>
      <li key={item.id} className={item.id === currentItem ? 'current' : undefined}>
        <LinkToSlide {...item} component={linkComponent} />
      </li>
    )}
  </ul>
}

export type LinkComponentType = React.ComponentType<{
  href: string
  children: React.ReactNode
  className?: string
}> | 'a'

interface LinkToSlideProps extends SlideLink {
  component?: LinkComponentType
}

function LinkToSlide({title, id, isPlaceholder, component: LinkComponent}: LinkToSlideProps) {
  const classNames = classnames({placeholder: isPlaceholder})
  if (LinkComponent) {
    return <LinkComponent href={id} className={classNames}>{title}</LinkComponent>
  }
  return <Link className={classNames} relative="path" to={`../${id}`}>{title}</Link>
}
