import React from 'react';

const commonTags = 'p,div,span,h1,h2,h3,h4,h5,h6,td,th,footer'.split(',');

export function makeTranslate(strings, tags = []) {
  return addTagSupport(k => strings[k], [...commonTags, ...tags]);
}

function addTagSupport(translator, tags) {
  translator.addTagSupport = (tag, name) => {
    const tagName = name ?? typeof(tag) === 'string' ? tag : tag.DisplayName
    translator[tagName] = ({children, ...props}) => React.createElement(tag, props, translator(children));
  }
  tags.forEach((tag) => translator.addTagSupport(tag));
  return translator;
}
