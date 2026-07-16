import { ActiveSelection, Canvas, FabricImage, FabricObject, loadSVGFromString, util } from 'fabric'

import { randomId } from './util'

const CLIPBOARD_SOURCE = 'tanssiaistietokanta-fabric'
const CLIPBOARD_VERSION = 1
const CLIPBOARD_ROOT_ATTR = 'data-fabric-clipboard-source'
const CLIPBOARD_PAYLOAD_ATTR = 'data-fabric-clipboard-payload'
const PASTE_OFFSET = 16

interface FabricClipboardPayload {
  source: typeof CLIPBOARD_SOURCE
  version: typeof CLIPBOARD_VERSION
  objects: object[]
}

export async function copySelectionToClipboard(canvas: Canvas): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') return false
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return false

  const svgMarkup = buildSvgMarkup(activeObject)
  const payload: FabricClipboardPayload = {
    source: CLIPBOARD_SOURCE,
    version: CLIPBOARD_VERSION,
    objects: getSerializedSelection(activeObject),
  }
  const payloadBase64 = encodeBase64(JSON.stringify(payload))
  const html = [
    `<div ${CLIPBOARD_ROOT_ATTR}="${CLIPBOARD_SOURCE}" ${CLIPBOARD_PAYLOAD_ATTR}="${payloadBase64}">`,
    svgMarkup,
    '</div>',
  ].join('')

  const dataURL = activeObject.toDataURL({ format: 'png' })
  const pngBlob = await fetch(dataURL).then(response => response.blob())
  const clipboardData: Record<string, Blob> = {}
  const candidates: [string, Blob][] = [
    ['image/svg+xml', new Blob([svgMarkup], { type: 'image/svg+xml' })],
    ['image/png', pngBlob],
    ['text/html', new Blob([html], { type: 'text/html' })],
    ['text/plain', new Blob([svgMarkup], { type: 'text/plain' })],
  ]
  candidates.forEach(([type, blob]) => {
    if (canWriteClipboardType(type)) clipboardData[type] = blob
  })
  if (Object.keys(clipboardData).length === 0) return false

  const item = new ClipboardItem(clipboardData)

  await navigator.clipboard.write([item])
  return true
}

export async function pasteFromClipboard(canvas: Canvas): Promise<boolean> {
  if (!navigator.clipboard || typeof navigator.clipboard.read !== 'function') return false

  const items = await navigator.clipboard.read()
  if (items.length === 0) return false

  const htmlContent = await readClipboardType(items, 'text/html')
  if (htmlContent) {
    const payload = extractPayloadFromHtml(htmlContent)
    if (payload) {
      const pastedObjects = await util.enlivenObjects<FabricObject>(payload.objects)
      pasteObjects(canvas, pastedObjects)
      return true
    }
  }

  const svgContent = await readClipboardType(items, 'image/svg+xml')
  if (svgContent) {
    const { objects, options } = await loadSVGFromString(svgContent)
    const parsedObjects = objects.filter((obj): obj is FabricObject => !!obj)
    if (parsedObjects.length > 0) {
      const grouped = util.groupSVGElements(parsedObjects, options)
      pasteObjects(canvas, [grouped])
      return true
    }
  }

  const pngBlob = await readClipboardBlob(items, 'image/png')
  if (pngBlob) {
    const pngUrl = URL.createObjectURL(pngBlob)
    try {
      const image = await FabricImage.fromURL(pngUrl)
      pasteObjects(canvas, [image])
      return true
    } finally {
      URL.revokeObjectURL(pngUrl)
    }
  }

  return false
}

function pasteObjects(canvas: Canvas, objects: FabricObject[]) {
  if (objects.length === 0) return

  canvas.discardActiveObject()
  objects.forEach(obj => {
    obj.set({
      _id: randomId(),
      left: (obj.left ?? 0) + PASTE_OFFSET,
      top: (obj.top ?? 0) + PASTE_OFFSET,
    })
    canvas.add(obj)
    obj.setCoords()
  })

  if (objects.length === 1) {
    canvas.setActiveObject(objects[0])
  } else {
    const selection = new ActiveSelection(objects, { canvas })
    canvas.setActiveObject(selection)
  }
  canvas.requestRenderAll()
}

function getSerializedSelection(activeObject: FabricObject): object[] {
  if (activeObject instanceof ActiveSelection) {
    return activeObject.getObjects().map(obj => obj.toObject())
  }
  return [activeObject.toObject()]
}

function buildSvgMarkup(activeObject: FabricObject): string {
  const bounds = activeObject.getBoundingRect()
  const width = Math.max(1, Math.ceil(bounds.width))
  const height = Math.max(1, Math.ceil(bounds.height))
  const body = activeObject.toSVG()
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${Math.floor(bounds.left)} ${Math.floor(bounds.top)} ${width} ${height}">${body}</svg>`
}

function extractPayloadFromHtml(html: string): FabricClipboardPayload | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const root = doc.querySelector(`[${CLIPBOARD_ROOT_ATTR}="${CLIPBOARD_SOURCE}"]`)
  const payloadBase64 = root?.getAttribute(CLIPBOARD_PAYLOAD_ATTR)
  if (!payloadBase64) return null

  try {
    const rawPayload = decodeBase64(payloadBase64)
    const payload = JSON.parse(rawPayload) as Partial<FabricClipboardPayload>
    if (payload.source !== CLIPBOARD_SOURCE || payload.version !== CLIPBOARD_VERSION) return null
    if (!Array.isArray(payload.objects)) return null
    return payload as FabricClipboardPayload
  } catch {
    return null
  }
}

async function readClipboardType(items: ClipboardItem[], type: string): Promise<string | null> {
  const blob = await readClipboardBlob(items, type)
  if (!blob) return null
  return blob.text()
}

async function readClipboardBlob(items: ClipboardItem[], type: string): Promise<Blob | null> {
  for (const item of items) {
    if (!item.types.includes(type)) continue
    try {
      return await item.getType(type)
    } catch {
      continue
    }
  }
  return null
}

function canWriteClipboardType(type: string): boolean {
  if (typeof ClipboardItem === 'undefined') return false
  if (typeof ClipboardItem.supports === 'function') {
    return ClipboardItem.supports(type)
  }
  return type === 'text/html' || type === 'text/plain'
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach(byte => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function decodeBase64(value: string): string {
  const binary = atob(value)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}
