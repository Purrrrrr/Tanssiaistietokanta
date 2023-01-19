import {getTopNodes} from './comparisons'

describe('getTopNodes', () => {
  test('clear winner', () => {
    const result = getTopNodes([1, 2, 3, 4], i => i)

    expect(result).toEqual([4])

  })

  test('many winners', () => {
    const result = getTopNodes([1, 2, 4, 2, 3, 4], i => i)

    expect(result).toEqual([4, 4])

  })

  test('many criteria', () => {
    const result = getTopNodes(
      [
        1, 3, 4, 2, 3, 4
      ],
      i => i%2 === 1,
      i => i
    )

    expect(result).toEqual([3, 3])

  })
})
