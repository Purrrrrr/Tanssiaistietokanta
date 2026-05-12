interface DevBadgeOptions {
  text: string
  color: string
  fontSize: number
  x: number
  y: number
}

const presets: Record<string, Partial<DevBadgeOptions>> = {
  dev: { text: 'DEV', color: '#fe7', fontSize: 28, x: 31, y: 41 },
  beta: { text: 'β', color: '#3a1', fontSize: 57, x: 44, y: 35 },
}
const defaults = { text: 'DEV', color: '#fe7', fontSize: 28, x: 31, y: 41 }

export function addFaviconDevBadge(preset: keyof typeof presets = 'dev') {
  const favicon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement | null
  if (!favicon) return
  const { text, color, fontSize, x, y } = { ...defaults, ...presets[preset] }

  const imageUrl = favicon.dataset.originalHref ??= favicon.href
  console.log('Adding dev badge to favicon, original href:', imageUrl)
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = imageUrl
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
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#000'
    const shadowDistance = 4
    ctx.fillText(text, x + shadowDistance, y + shadowDistance)
    ctx.fillStyle = color
    ctx.fillText(text, x, y)

    // replace favicon
    favicon.href = canvas.toDataURL('image/png')
  }
}
