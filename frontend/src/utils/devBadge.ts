export function addFaviconDevBadge() {
  const text = 'DEV'

  const favicon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement | null
  if (!favicon) return

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = favicon.href
  img.onload = () => {
    const size = 64

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // original favicon
    ctx.drawImage(img, 0, 0, size, size)

    // text
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#000'
    ctx.fillText(text, 34, 44)
    ctx.fillStyle = '#fe7'
    ctx.fillText(text, 31, 41)

    // replace favicon
    favicon.href = canvas.toDataURL('image/png')
  }
}
