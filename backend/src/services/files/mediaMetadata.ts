import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const MaxProbeOutputBytes = 5 * 1024 ** 2

type MediaType = 'image' | 'audio' | 'video'

interface ProbeStream {
  codec_type?: string
  width?: number
  height?: number
  duration?: string
}

interface ProbeFormat {
  duration?: string
  format_name?: string
}

interface ProbeOutput {
  streams?: ProbeStream[]
  format?: ProbeFormat
}

export interface FileMediaMetadata {
  mediaType?: MediaType
  mediaFormat?: string
  mediaDurationMs?: number
  mediaWidth?: number
  mediaHeight?: number
}

export async function deduceMediaMetadata(filePath: string, mimetype: string | null | undefined): Promise<FileMediaMetadata> {
  const mediaType = getMediaType(mimetype)
  if (!mediaType) {
    return {}
  }

  const probeData = await ffprobe(filePath)
  const stream = getPrimaryStream(probeData.streams ?? [], mediaType)
  const durationMs = toDurationMs(probeData, stream)
  const mediaFormat = getMediaFormat(mimetype, probeData.format?.format_name)
  const { width, height } = getDimensions(stream, mediaType)

  return {
    mediaType,
    mediaFormat,
    mediaDurationMs: durationMs,
    mediaWidth: width,
    mediaHeight: height,
  }
}

function getMediaType(mimetype: string | null | undefined): MediaType | undefined {
  const [type] = (mimetype ?? '').split('/')
  return type === 'image' || type === 'audio' || type === 'video'
    ? type
    : undefined
}

function getMediaFormat(mimetype: string | null | undefined, ffprobeFormat: string | undefined): string | undefined {
  const subtype = (mimetype ?? '').split('/')[1]
  const fromMime = normalizeFormat(subtype)
  if (fromMime) {
    return fromMime
  }

  const firstFormat = ffprobeFormat?.split(',')[0]
  return normalizeFormat(firstFormat)
}

function normalizeFormat(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/^x-/, '')
    .replace(/_pipe$/, '')
    .replace(/\+.*/, '')
    || undefined
}

function getPrimaryStream(streams: ProbeStream[], mediaType: MediaType): ProbeStream | undefined {
  if (mediaType === 'audio') {
    return streams.find(stream => stream.codec_type === 'audio')
  }
  return streams.find(stream => stream.codec_type === 'video')
}

function getDimensions(stream: ProbeStream | undefined, mediaType: MediaType) {
  if (mediaType !== 'image' && mediaType !== 'video') {
    return { width: undefined, height: undefined }
  }

  return {
    width: toNonNegativeInteger(stream?.width),
    height: toNonNegativeInteger(stream?.height),
  }
}

function toDurationMs(probeData: ProbeOutput, stream: ProbeStream | undefined) {
  const durationSeconds = parseDuration(probeData.format?.duration) ?? parseDuration(stream?.duration)
  if (durationSeconds == null) {
    return undefined
  }
  return Math.round(durationSeconds * 1000)
}

function parseDuration(value: string | undefined) {
  if (!value) {
    return undefined
  }
  const duration = Number(value)
  return Number.isFinite(duration) && duration >= 0
    ? duration
    : undefined
}

function toNonNegativeInteger(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined
  }
  const rounded = Math.round(value)
  return rounded >= 0
    ? rounded
    : undefined
}

async function ffprobe(filePath: string): Promise<ProbeOutput> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-print_format',
    'json',
    '-show_streams',
    '-show_format',
    filePath,
  ], {
    maxBuffer: MaxProbeOutputBytes,
  })

  return JSON.parse(stdout) as ProbeOutput
}
