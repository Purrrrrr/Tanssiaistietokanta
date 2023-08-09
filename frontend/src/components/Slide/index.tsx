import React from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'

import { AutosizedSection } from 'libraries/ui'

import './Slide.scss'
import './slideStyles.scss'

export * from './SlideContainer'

export interface SlideProps {
  title: string
  type?: string
  children?: React.ReactElement | React.ReactElement[] | string
  temp?: React.ReactElement | React.ReactElement[] | string
  footer?:  React.ReactElement | React.ReactElement[] | string
  next?: SlideLink
  navigation?: SlideNavigation
}

export interface SlideNavigation {
  title: string
  items: SlideLink[]
}
export interface SlideLink {
  title: string
  url?: string | undefined
  current?: boolean
  isPlaceholder?: boolean
}

export function Slide({title, type, children, temp, footer, next, navigation}: SlideProps) {
  return <section className={classnames('slide', type && 'slide-type-'+type)}>
    <h1 className="slide-title">{title}</h1>
    <section className="slide-main-content">
      <AutosizedSection className="slide-program-description">
        <div className="slide-content-area">{children}</div>
      </AutosizedSection>
      {footer &&
        <AutosizedSection className="slide-teached-in">
          <div className="slide-content-area">{footer}</div>
        </AutosizedSection>
      }
    </section>
    {temp}
    {next && <NextSlide next={next} />}
    {navigation && <SlideSidebar navigation={navigation} />}
  </section>
}

function NextSlide({next}: {next: SlideLink}) {
  return <section className="slide-next-track">
    <LinkToSlide {...next} className="slide-content-area" />
  </section>
}

function SlideSidebar({navigation}: {navigation: SlideNavigation}) {
  return <>
    <h2 className="slide-navigation-title">{navigation.title}</h2>
    <AutosizedSection className="slide-navigation">
      <SlideNavigationList items={navigation.items} />
    </AutosizedSection>
  </>
}

export function SlideNavigationList({items}: Pick<SlideNavigation, 'items'>) {
  if (!items.length) return null

  return <ul className="slide-content-area slide-navigation-list">
    {items.map((item, index) => <li key={index}><LinkToSlide {...item} /></li>)}
  </ul>
}

function LinkToSlide({title, url, current, isPlaceholder, className}: SlideLink & {className?: string}) {
  const classNames = classnames(className, {current, placeholder: isPlaceholder})
  if (!url) return <span className={classNames}>{title}</span>

  return <Link className={classNames} to={url}>{title}</Link>
}
