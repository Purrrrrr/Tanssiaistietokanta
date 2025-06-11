interface SegmentedInputProps {
  value: string
  onChange: (changed: string) => unknown
}

interface Part {
  parse: (this: Part, s: string, context: PartContext) => ParseResult
  //onStep: (num: amount) => unknown
}

interface PartContext {
  parts: Part[]
  value: string
}

interface ParseResult {
  parsedAmount: number
  parsedString: string
  value: string
}

const parts: Part[] = [
  //regexPart('\\w\\w?'),
  numericPart(2),
  separator(':'),
  numericPart(2),
  separator(':'),
  numericPart(4),
  separator(' '),
  numericPart(2),
  separator(':'),
  numericPart(2),
]

function separator(char: string): Part {
  if (char.length !== 1) throw new Error('char expected')
  return {
    parse: s => {
      const parsedAmount = s.startsWith(char) ? 1 : 0
      return {
        parsedAmount,
        parsedString: (parsedAmount || s.length > 0) ? char : '',
        value: '',
      }
    }
  }
}

function numericPart(length: number): Part {
  const regex = new RegExp(`^\\d{1,${length}}`)
  return {
    parse: s => {
      const match = s.match(regex)
      if (match) {
        return {
          parsedAmount: match[0].length,
          parsedString: match[0],
          value: match[0],
        }
      }

      return {
        ...nothingParsed,
        parsedString: '',
        value: '0',
      }
    }
  }
}

function regexPart(matcher: RegExp | string): Part {
  const regex = matcher instanceof RegExp
    ? matcher
    : new RegExp(`^${matcher}`)
  return {
    parse: s => {
      const match = s.match(regex)
      if (match) {
        return {
          parsedAmount: match[0].length,
          parsedString: match[0],
          value: match[0],
        }
      }

      return nothingParsed
    }
  }
}


const nothingParsed : ParseResult = {
  parsedAmount: 0,
  parsedString: '',
  value: '',
}

function parse(text: string, ctx: Omit<PartContext, 'value'>): {
  results: ParseResult[]
  parsed: string
} {
  let remaining = text
  const context = { value: text, ...ctx }
  const results = ctx.parts.map(segment => {
    const result = segment.parse(remaining, context)
    remaining = remaining.slice(result.parsedAmount)
    return result
  })

  return {
    results,
    parsed: results.map(r => r.parsedString).join('')
  }
}

export function SegmentedInput({
  value, onChange
}: SegmentedInputProps) {
  const setValue = (e) => onChange(parse(e.target.value, { parts }).parsed)
  const { results, parsed: parsedString } = parse(value, { parts })
  return <>
    <input
      className="border p-2"
      value={value}
      onChange={setValue}
    />
    <p className="my-7 p-1 bg-pink-200">{parsedString}</p>
    <pre className="my-7 bg-gray-300 p-3">
      {JSON.stringify(results, null, 2)}
    </pre>
  </>
}
