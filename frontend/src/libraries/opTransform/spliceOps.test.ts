import {  Splice, stringAdd, stringDel, StringModification, stringModification } from './types'

import { indexAfterSpliceOp, rebaseSpliceOps } from './spliceOps'

const [ins, del, strMod] = [stringAdd, stringDel, stringModification]

describe('indexAfterSpliceOp', () => {
  it.each([
    //OP removes index
    [0, del(0, 'foo'), null],
    [1, del(0, 'foo'), null],
    [2, del(0, 'foo'), null],
    // Op is before index
    [3, del(0, 'foo'), 0],
    [4, del(0, 'foo'), 1],
    [0, ins(0, 'foo'), 3],
    [1, ins(0, 'foo'), 4],
    [5, strMod(0, {remove: '12345', add: '123'}), 3],
    [3, strMod(0, {remove: '123', add: '12345'}), 5],
    //Again plus one
    [1, del(1, 'foo'), null],
    [2, del(1, 'foo'), null],
    [3, del(1, 'foo'), null],
    [4, del(1, 'foo'), 1],
    [5, del(1, 'foo'), 2],
    [6, strMod(1, {remove: '12345', add: '123'}), 4],
    [4, strMod(1, {remove: '123', add: '12345'}), 6],
    // Op is after index
    [2, ins(4, 'foo'), 2],
    [2, del(4, 'foo'), 2],
    [2, del(3, 'foo'), 2],
    [2, del(2, 'foo'), null],
    [0, strMod(1, {remove: '12345', add: '123'}), 0],
    [0, strMod(1, {remove: '123', add: '12345'}), 0],
  ])('Index %i after %s is %i', (index, op, result) => {
    expect(indexAfterSpliceOp(index, op as StringModification)).toBe(result)
  })
})

describe('rebaseSpliceOps', () => {
  it.each([
    //result,       op,            base
    //    BASE
    // OP
    [{index: 0}, ins(0, 'Fuu'), ins(0, 'Bar')],
    [{index: 0}, del(0, 'Fuu'), ins(5, 'Bar')],
    // BASE
    //      OP
    [{index: 4}, del(1, 'Bar'), ins(0, 'Foo')],
    [{index: 3}, del(0, 'Bar'), ins(0, 'Foo')],
    [{index: 4}, ins(1, 'Fuu'), ins(0, 'Bar')],
    [{index: 7}, ins(1, 'Fuu'), ins(0, 'FooBar')],
    [{index: 0}, del(3, 'Bar'), del(0, 'Foo')],
    // BASE
    // -OP-
    [{index: 0, remove: ''}, del(0, 'Bar'), del(0, 'Bar')],
    [{index: 0, remove: ''}, strMod(0, {remove: 'Bar', add: '???'}), del(0, 'Bar')],
    // BASE
    // -OP
    [{index: 0, remove: ''}, strMod(0, {remove: 'Bar', add: '???'}), del(0, 'Bare')],
    // BASE
    //  OP-
    [{index: 0, remove: ''}, strMod(1, {remove: 'are', add: '???'}), del(0, 'Bare')],
    // -BASE-
    //   OP
    [{index: 0, remove: ''}, del(1, 'o'), del(0, 'Foo')],
    [{index: 0, remove: ''}, strMod(1, {remove: 'o', add: 'whatever'}), del(0, 'Foo')],
    //   -BASE-
    // -OP--
    [{index: 1, remove: 'o'}, del(1, 'oo'), del(2, 'oBar')],
    //   BASE
    // ---OP---
    [{index: 0, remove: '1 3'}, del(0, '1 2 3'), del(1, ' 2')],
    // ----BASE
    //    OP------
    [{index: 0, remove: 'p'}, del(1, 'oop'), del(0, 'Foo')],
  ])('should produce changes %s when rebasing %s onto %s', (result, op, base) => {
    expect(rebaseSpliceOps(base, op as Splice<string>, '')).toStrictEqual(result)
  })


})
