export default function randomId() {
  const array = crypto.getRandomValues(new Uint8Array(12))
  // Arr to base64
  const base64 = btoa(String.fromCharCode(...array))

  return base64.slice(0, 8) + '-' + base64.slice(8)
}
