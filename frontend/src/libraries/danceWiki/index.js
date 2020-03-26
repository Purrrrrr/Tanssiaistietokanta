import {getWikiPage, searchWikiPages} from './wikiApi';
import {getCategories} from './getCategories';
import {getFormations} from './getFormations';
import {convertToMarkdown} from './format/convertToMarkdown';
import {cleanupLanguage} from './cleanupLanguage';
import * as L from 'partial.lenses';

export {searchWikiPages};

export function getDanceData(name) {
  return getWikiPage(name)
    .then(L.modifyAsync('contents', convertToMarkdown))
    .then(async ({title, contents: instructions}) => {
      const categories = await getCategories(title, instructions);
      const formations = getFormations(instructions);
    
      return ({categories, formations, instructions});
    })
    .then(L.modify('instructions', cleanupStrangeTags))
    .then(L.modify('instructions', cleanupLanguage));
}

const strangeTag = /<[A-Z][^>]+\/?>/g; 
function cleanupStrangeTags(text) {
  return text.replace(strangeTag, "");
}
