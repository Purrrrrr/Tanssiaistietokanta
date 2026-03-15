import type { DancesData } from '../../src/client'

type Dance = DancesData & { _id: string }

export const testDances: Dance[] = [
  {
    _id: '',
    name: 'Wole in the Hall',
    description: 'A dance for testing',
    duration: 123,
    prelude: 'Prelude',
    formation: 'Formation',
    source: 'Source',
    category: 'Category',
    instructions: 'Instructions',
    remarks: 'Remarks',
    wikipage: null,
    wikipageName: null,
    slideStyleId: null,
    tags: {},
  }, {
    _id: '',
    name: 'Tester\'s Fancy',
    description: 'A dance for more testing',
    duration: 123,
    prelude: 'Another prelude',
    formation: 'Another formation',
    source: 'Source 1710',
    category: 'Another category',
    instructions: 'More instructions',
    remarks: 'More remarks',
    wikipage: null,
    wikipageName: null,
    slideStyleId: null,
    tags: {},
  },
]
