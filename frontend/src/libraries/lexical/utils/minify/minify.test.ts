import { createEditor, type EditorState, type SerializedEditorState } from 'lexical'

import { nodes } from 'libraries/lexical/nodes'

import { expand, minifyLiveState } from './minify'

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
        textFormat: 0,
        textStyle: '',
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

const editor = createEditor({ nodes })

const stateToLiveState = (state: SerializedEditorState): EditorState => {
  return editor.parseEditorState(state)
}

describe('minifyLiveState', () => {
  it('produces a minified wrapper with V and rest of the object embedded', () => {
    const { V, ...result } = minifyLiveState(stateToLiveState(simpleState))
    expect(V).toBe(1)
    expect('root' in result).toBe(false)
  })

  it('renames common keys', () => {
    const root = minifyLiveState(stateToLiveState(simpleState))
    expect(root).toHaveProperty('c') // children
    expect(root).toHaveProperty('d') // direction
    expect(root).not.toHaveProperty('f') // format
    expect(root).not.toHaveProperty('i') // indent
    expect(root).toHaveProperty('t') // type
    expect(root).not.toHaveProperty('v') // version
    expect(root).not.toHaveProperty('children')
    expect(root).not.toHaveProperty('type')
  })

  it('minifies known type values', () => {
    const root = minifyLiveState(stateToLiveState(simpleState))
    expect(root.t).toBe('ro') // root → ro

    const paragraph = (root.c as Record<string, unknown>[])[0]
    expect(paragraph.t).toBe('p') // paragraph → p

    const textNode = (paragraph.c as Record<string, unknown>[])[0]
    expect(textNode.t).toBe('tx') // text → tx
  })

  it('minifies text node fields', () => {
    const root = minifyLiveState(stateToLiveState(simpleState))
    const paragraph = (root.c as Record<string, unknown>[])[0]
    const textNode = (paragraph.c as Record<string, unknown>[])[0]
    expect(textNode.x).toBe('Hello world') // text → x
    expect(textNode).not.toHaveProperty('e')
    expect(textNode).not.toHaveProperty('m')
    expect(textNode).not.toHaveProperty('s')
    expect(textNode).not.toHaveProperty('f')
  })
})

describe('expand', () => {
  it('is the inverse of minify (roundtrip)', () => {
    const result = expand(minifyLiveState(stateToLiveState(simpleState)))
    expect(result).toEqual(simpleState)
  })

  it('throws on unsupported version', () => {
    expect(() => expand({ V: 99, _id: '' })).toThrow('Unsupported minified state version: 99')
  })
})

// TODO: fix these since the editor does not support these made-up fields, or remove the test
describe.skip('passthrough for unknown values', () => {
  it('leaves unknown keys unchanged', () => {
    const stateWithUnknownKey: SerializedEditorState = {
      root: {
        ...simpleState.root,
        // @ts-expect-error intentional unknown key for test
        unknownCustomField: 'someValue',
      },
    }
    const minified = minifyLiveState(stateToLiveState(stateWithUnknownKey))
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
    const minified = minifyLiveState(stateToLiveState(stateWithUnknownType))
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
        {
          // @ts-expect-error not in original spec
          children: [],
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
    expect(expand(minifyLiveState(stateToLiveState(complexState)))).toEqual(complexState)
  })

  it('minifies heading type', () => {
    const root = minifyLiveState(stateToLiveState(complexState))
    const heading = (root.c as Record<string, unknown>[])[0]
    expect(heading.t).toBe('h') // heading → h
    expect(heading.g).toBe('h2') // tag → g
    const list = (root.c as Record<string, unknown>[])[1]
    expect(list.t).toBe('l') // list → l
    expect(list.g).toBe('ul') // tag → g
  })
})
