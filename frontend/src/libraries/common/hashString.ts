export async function hashString(str: string, algo = 'SHA-256', len = 18): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)

  // Hash the data
  const hashBuffer = await crypto.subtle.digest(algo, data)

  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer).slice(0, len)))
}
