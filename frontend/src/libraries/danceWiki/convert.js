const conversionUrl = '/convert';

export function convertToMarkdown(content) {
  return fetch(conversionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: content
    })
  }).then(res => res.json());
}
