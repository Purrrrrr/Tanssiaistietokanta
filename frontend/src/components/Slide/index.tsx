import React from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'

import { AutosizedSection } from 'libraries/ui'
import {makeTranslate} from 'utils/translate'

import './Slide.scss'
import './slideStyles.scss'

export * from './SlideContainer'

export const t = makeTranslate({
  afterThis: 'Tämän jälkeen',
})

export interface SlideProps {
  id: string
  title: string
  type?: string
  children?: React.ReactElement | React.ReactElement[] | string
  footer?:  string
  next?: SlideLink
  navigation?: SlideNavigation
}

export interface SlideNavigation {
  title: string
  items: SlideLink[]
}
export interface SlideLink {
  id: string
  title: string
  url?: string | undefined
  hidden?: boolean
  isPlaceholder?: boolean
}

export function Slide({id, title, type, children, footer, next, navigation}: SlideProps) {
  return <section className={classnames('slide', type && 'slide-type-'+type)}>
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
    {next && <NextSlide next={next} />}
    {navigation && <SlideSidebar currentItem={id} navigation={navigation} />}
  </section>
}

function NextSlide({next}: {next: SlideLink}) {
  return <section className="slide-next-slide">
    {t`afterThis`}:{' '}
    <LinkToSlide {...next} className="slide-content-area" />
  </section>
}

function SlideSidebar(
  {currentItem, navigation}: {currentItem: string, navigation: SlideNavigation}
) {
  return <>
    <h2 className="slide-navigation-title">{navigation.title}</h2>
    <AutosizedSection className="slide-navigation">
      <SlideNavigationList currentItem={currentItem} {...navigation} />
    </AutosizedSection>
  </>
}

export function SlideNavigationList({items, currentItem}: Pick<SlideNavigation, 'items'> & {currentItem?: string}) {
  if (!items.length) return null

  return <ul className={classnames('slide-content-area slide-navigation-list', {'has-current': currentItem !== undefined})}>
    {items.filter(item => item.hidden !== true).map((item) =>
      <li key={item.id} className={item.id === currentItem ? 'current' : undefined}>
        <LinkToSlide {...item} />
      </li>
    )}
  </ul>
}

function LinkToSlide({title, url, isPlaceholder, className}: SlideLink & {className?: string}) {
  const classNames = classnames(className, {placeholder: isPlaceholder})
  if (!url) return <span className={classNames}>{title}</span>

  return <Link className={classNames} to={url}>{title}</Link>
}
