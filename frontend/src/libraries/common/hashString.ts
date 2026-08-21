export async function hashString(str: string, algo = 'SHA-256', len = 18): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)

  // Hash the data
  const hashBuffer = await crypto.subtle.digest(algo, data)

  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer).slice(0, len)))
}

export function quickNumberHash(str: string): number {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)

  // Hash the data using a simple hash function (not cryptographically secure)
  return data.reduce((hash, byte) => {
    hash = (hash << 5) - hash + byte
    return hash | 0 // Convert to 32bit integer
  }, 0)
}
