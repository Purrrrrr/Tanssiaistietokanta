const jsonHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

function getJson(response) {
  return response.json();
}
export function fetchJson(url, options = {}) {
  options.headers = Object.assign(jsonHeaders, options.headers);
  return fetch(url, options).then(getJson);
}
export function putJson(url, data) {
  return fetch(url, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(data)
  }).then(getJson);
}
export default fetchJson;
