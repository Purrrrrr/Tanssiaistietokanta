export default function randomId(len = 12) {
  const array = crypto.getRandomValues(new Uint8Array(len))
  return btoa(String.fromCharCode(...array))
}
