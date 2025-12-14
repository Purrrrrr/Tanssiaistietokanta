declare namespace Intl {
  interface DurationFormatOptions {
    style?: 'long' | 'short' | 'narrow' | 'digital'
    fractionalDigits?: number
    hours?: 'numeric' | '2-digit'
    minutes?: 'numeric' | '2-digit'
    seconds?: 'numeric' | '2-digit'
  }

  interface DurationFormat {
    format(duration: DurationInput): string
    formatToParts(duration: DurationInput): Intl.DurationFormatPart[]
  }

  interface DurationFormatPart {
    type: string
    value: string
  }

  interface DurationInput {
    years?: number
    months?: number
    weeks?: number
    days?: number
    hours?: number
    minutes?: number
    seconds?: number
    milliseconds?: number
  }

  const DurationFormat: {
    new (locales?: string | string[], options?: DurationFormatOptions): DurationFormat
    prototype: DurationFormat
  }
}
