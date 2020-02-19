import React from 'react';
import {Instance as Counterpart} from 'counterpart';

const commonTags = 'p,div,span,h1,h2,h3,h4,h5,h6,td,th,footer'.split(',');

export function makeTranslate(strings, tags = []) {
  const counterpart = new Counterpart();
  counterpart.registerTranslations('en', strings);

  const t = (...args) => counterpart.translate(...args);
  addTagSupport(t, [...commonTags, ...tags]);
  t.pluralize = (key, count) => t(key, {count});
  return t;
}

function addTagSupport(translator, tags) {
  translator.addTagSupport = (tag, name) => {
    const tagName = name ?? typeof(tag) === 'string' ? tag : tag.DisplayName
    translator[tagName] = ({children, ...props}) => React.createElement(tag, props, translator(children));
  }
  tags.forEach((tag) => translator.addTagSupport(tag));
}
