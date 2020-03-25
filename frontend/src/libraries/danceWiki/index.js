import {getWikiPage} from './getPage';
import {getCategory} from './getCategory';
import {convertToMarkdown} from './convert';
import {cleanupLanguage} from './cleanupLanguage';
import * as L from 'partial.lenses';

export function getDanceData(name) {
  return getWikiPage(name)
    .then(L.modifyAsync('contents', convertToMarkdown))
    .then(async ({title, contents: instructions}) => {
      const categories = await getCategory(title, instructions);
    
      return ({
        categories,
        formations: [],
        instructions
      })
    })
    .then(L.modify('instructions', cleanupStrangeTags))
    .then(L.modify('instructions', cleanupLanguage));
}

const strangeTag = /<[A-Z][^>]+\/?>/g; 
function cleanupStrangeTags(text) {
  return text.replace(strangeTag, "");
}
