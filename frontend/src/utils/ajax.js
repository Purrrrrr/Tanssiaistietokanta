import { useState, useEffect, useCallback } from 'react';

const jsonHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

export function fetchJson(url, method = 'GET', data = null) {
  return fetch(url, {
    method,
    headers: jsonHeaders,
    body: data && JSON.stringify(data)
  }).then(response => response.json());
}

export function putJson(url, data) {
  return fetchJson(url, "PUT", data);
}
export function postJson(url, data) {
  return fetchJson(url, "POST", data);
}
export function deleteJson(url, data) {
  return fetchJson(url, "DELETE", data);
}

export function useAjax(url, defaultData = null) {
  const [data, setData] = useState(defaultData);
  const loadData = useCallback(() => fetchJson(url).then(setData), [url]);
  useEffect(() => {loadData()}, [loadData]);

  return [data, loadData];
}

export default fetchJson;
