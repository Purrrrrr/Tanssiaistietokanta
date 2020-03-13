import {getWikiPage} from './getPage';
import {getCategory} from './getCategory';
import {convertToMarkdown} from './convert';

export function getDanceData(name) {
  return Promise.allSettled([
    getWikiPage(name).then(convertToMarkdown),
    getCategory(name)
  ]).then(([{value: instructions, reason}, {value: categories}]) => {
    if (reason) throw reason;

    return ({
      categories,
      formations: [],
      instructions
    })
  }
  );
}
