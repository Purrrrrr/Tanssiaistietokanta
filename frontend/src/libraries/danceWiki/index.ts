import {getWikiPage, searchWikiPages} from './wikiApi';
import {getCategories} from './getCategories';
import {getFormations} from './getFormations';
import {convertToMarkdown} from './format/convertToMarkdown';
import {cleanupLanguage} from './cleanupLanguage';
import * as L from 'partial.lenses';

export {searchWikiPages};

export interface ImportedDanceData {
  categories: string[]
  formations: string[]
  instructions: string
}

export function getDanceData(name: string) : Promise<ImportedDanceData> {
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

const strangeTag = /<\/?([A-Z]|mp3)[^>]*\/?>/g; 
function cleanupStrangeTags(text: string) {
  return text.replace(strangeTag, "");
}
