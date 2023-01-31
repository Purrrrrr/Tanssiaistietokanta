import {map, toEntity} from '../testUtils'
import {arrayChange} from '../types'
import {arrayDiff} from './arrayDiff'

describe('arrayDiff', () => {

  it('produces empty patch with equal inputs', () => {
    const res = arrayDiff(
      '',
      [1, 2, 3, 4, 5, 6].map(toEntity),
      arrayChange(
        map()
      )
    )

    expect(res).toEqual([])
  })


})
