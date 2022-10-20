import React from 'react'
import {Instance as Counterpart} from 'counterpart'

type Translation = string
type Translate = {
  (key: string | TemplateStringsArray, options?: object): Translation,
  pluralize: (key: string, count: number) => Translation
} & {
  [key : string]: (props: {children: string, [prop: string] : unknown}) => JSX.Element
}

const commonTags = 'p,div,span,h1,h2,h3,h4,h5,h6,td,th,footer'.split(',')

export function makeTranslate(strings, tags = []) : Translate {
  const counterpart = new Counterpart()
  counterpart.registerTranslations('en', strings)

  const t = counterpart.translate.bind(counterpart)
  addTagSupport(t, [...commonTags, ...tags])
  t.pluralize = (key, count: number) => t(key, {count})
  return t
}

function addTagSupport(translator, tags) {
  translator.addTagSupport = (tag, name) => {
    const tagName = name ?? typeof(tag) === 'string' ? tag : tag.DisplayName
    translator[tagName] = ({children, ...props}) => React.createElement(tag, props, translator(children))
  }
  tags.forEach((tag : string) => translator.addTagSupport(tag))
}
