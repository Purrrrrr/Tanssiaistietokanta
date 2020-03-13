import {getWikiPage} from './getPage';
import {parseMediawiki, getInternalLinks, stripLinks} from './mediawiki';

export function getCategory(danceName) {
  return getCategories().then(danceCategories => danceCategories[danceName] ?? []);
}

let categoryCache = null;

function getCategories() {
  if (categoryCache) return Promise.resolve(categoryCache);
  return getWikiPage('Tanssiohjeet')
    .then(parsePage)
    .then(categories => {
      return categoryCache = categories;
    })
}

function parsePage(contents) {
  let cats = [];
  const dances = {};

  parseMediawiki(contents).forEach(({type, content, depth}) => {
    if (type === 'header') {
      cats = cats.filter(cat => cat.depth < depth)
      cats.push({depth, content: stripLinks(content)});
    } else {
      getInternalLinks(content).forEach(({link}) => {
        dances[link] = cats.map(cat => cat.content);
      })
    }
  });
  return dances;
}
