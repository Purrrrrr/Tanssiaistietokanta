const wikiUrl = "http://tanssi.dy.fi";

export function searchWikiPages(searchTerm) {
  if (searchTerm.length < 2) return Promise.resolve([]);

  const encodedSearch = encodeURIComponent(searchTerm);
  const url = `${wikiUrl}/api.php?action=query&list=prefixsearch&pssearch=${encodedSearch}&format=json&origin=*`;
  return fetch(url)
    .then(res => res.json())
    .then(res => res.query.prefixsearch)
    .then(res => res.map(page => page.title));
}

export function getWikiPage(title) {
  const encodedTitle = encodeURIComponent(title);
  const url = `${wikiUrl}/api.php?action=query&prop=revisions&titles=${encodedTitle}&rvprop=content&continue=&format=json&origin=*`;
  return fetch(url)
    .then(res => res.json())
    .then(res => res.query.pages)
    .then(pages => Object.values(pages)[0])
    .then(page => {
      if (!page.pageid) throw new Error("Page not found");
      return {
        title: page.title,
        contents: page.revisions[0]['*']
      };
    });
}
