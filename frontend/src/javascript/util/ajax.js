const jsonHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

export function getJson(response) {
  return response.json();
}
export function fetchJson(url, options = {}) {
  options.headers = Object.assign(jsonHeaders, options.headers);
  return fetch(url, options).then(getJson);
}
export function postJson(url, data) {
  return fetch(url, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data)
  }).then(getJson);
}
export default fetchJson;
