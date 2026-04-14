import type { SerializedEditorState } from 'lexical'

import { expand, isMinified, minify } from './minify'

const simpleState: SerializedEditorState = {
  root: {
    children: [
      {
        // @ts-expect-error not in original spec
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Hello world',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

describe('minify', () => {
  it('produces a minified wrapper with _v and r', () => {
    const result = minify(simpleState)
    expect(result._v).toBe(1)
    expect(result.r).toBeDefined()
    expect('root' in result).toBe(false)
  })

  it('renames common keys', () => {
    const result = minify(simpleState)
    const root = result.r as Record<string, unknown>
    expect(root).toHaveProperty('c') // children
    expect(root).toHaveProperty('d') // direction
    expect(root).toHaveProperty('f') // format
    expect(root).toHaveProperty('i') // indent
    expect(root).toHaveProperty('t') // type
    expect(root).toHaveProperty('v') // version
    expect(root).not.toHaveProperty('children')
    expect(root).not.toHaveProperty('type')
  })

  it('minifies known type values', () => {
    const result = minify(simpleState)
    const root = result.r as Record<string, unknown>
    expect(root.t).toBe('ro') // root → ro

    const paragraph = (root.c as Record<string, unknown>[])[0]
    expect(paragraph.t).toBe('p') // paragraph → p

    const textNode = (paragraph.c as Record<string, unknown>[])[0]
    expect(textNode.t).toBe('tx') // text → tx
  })

  it('minifies text node fields', () => {
    const result = minify(simpleState)
    const root = result.r as Record<string, unknown>
    const paragraph = (root.c as Record<string, unknown>[])[0]
    const textNode = (paragraph.c as Record<string, unknown>[])[0]
    expect(textNode.x).toBe('Hello world') // text → x
    expect(textNode.e).toBe(0) // detail → e
    expect(textNode.m).toBe('normal') // mode → m
    expect(textNode.s).toBe('') // style → s
    expect(textNode.f).toBe(0) // format → f
  })
})

describe('expand', () => {
  it('is the inverse of minify (roundtrip)', () => {
    const result = expand(minify(simpleState))
    expect(result).toEqual(simpleState)
  })

  it('throws on unsupported version', () => {
    expect(() => expand({ _v: 99, r: {} })).toThrow('Unsupported minified state version: 99')
  })
})

describe('isMinified', () => {
  it('returns true for a minified state', () => {
    expect(isMinified(minify(simpleState))).toBe(true)
  })

  it('returns false for a regular SerializedEditorState', () => {
    expect(isMinified(simpleState)).toBe(false)
  })

  it('returns false for null and primitives', () => {
    expect(isMinified(null)).toBe(false)
    expect(isMinified(undefined)).toBe(false)
    expect(isMinified(42)).toBe(false)
    expect(isMinified('string')).toBe(false)
  })
})

describe('passthrough for unknown values', () => {
  it('leaves unknown keys unchanged', () => {
    const stateWithUnknownKey: SerializedEditorState = {
      root: {
        ...simpleState.root,
        // @ts-expect-error intentional unknown key for test
        unknownCustomField: 'someValue',
      },
    }
    const minified = minify(stateWithUnknownKey)
    const root = minified.r as Record<string, unknown>
    expect(root.unknownCustomField).toBe('someValue')

    const expanded = expand(minified)
    const expandedRoot = expanded.root as unknown as Record<string, unknown>
    expect(expandedRoot.unknownCustomField).toBe('someValue')
  })

  it('leaves unknown type values unchanged', () => {
    const stateWithUnknownType: SerializedEditorState = {
      root: {
        ...simpleState.root,
        type: 'custom-unknown-type' as 'root',
      },
    }
    const minified = minify(stateWithUnknownType)
    const root = minified.r as Record<string, unknown>
    expect(root.t).toBe('custom-unknown-type')

    const expanded = expand(minified)
    expect(expanded.root.type).toBe('custom-unknown-type')
  })
})

describe('complex node types roundtrip', () => {
  const complexState: SerializedEditorState = {
    root: {
      children: [
        {
          // @ts-expect-error not in original spec
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Heading text',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h2',
              type: 'heading',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          listType: 'bullet',
          start: 1,
          tag: 'ul',
          type: 'list',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }

  it('roundtrips complex state with heading and list nodes', () => {
    expect(expand(minify(complexState))).toEqual(complexState)
  })

  it('minifies heading type', () => {
    const m = minify(complexState)
    const root = m.r as Record<string, unknown>
    const list = (root.c as Record<string, unknown>[])[0]
    expect(list.t).toBe('l') // list → l
    expect(list.g).toBe('ul') // tag → g

    const heading = (list.c as Record<string, unknown>[])[0]
    expect(heading.t).toBe('h') // heading → h
    expect(heading.g).toBe('h2') // tag → g
  })
})
