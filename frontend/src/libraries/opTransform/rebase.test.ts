import { inspect } from 'util'

import {
  opTypes,
} from './types'

import { apply } from './apply'
import {
  add,
  apply as applyOp,
  composite,
  listApply,
  listSplice,
  move,
  NO_OP,
  opError,
  remove,
  replace,
  stringAdd,
  stringDel,
  stringModification
} from './ops'
import { rebaseOnto } from './rebase'

import './testUtils'

const exampleOps = [
  { op: add(0, [1]), doc: [] },
  { op: add(1, [1]), doc: [0] },
  { op: remove(0, [1]), doc: [1] },
  { op: remove(1, [2]), doc: [1, 2] },
  { op: listSplice(1, {add: [4], remove: [2, 3]}), doc: [1, 2, 3] },
  { op: applyOp({a: replace(1, 2)}), doc: {a: 1} },
  { op: listApply([1, replace(1, 2)]), doc: [0, 1] },
  { op: opError('some error'), doc: 0 },
  { op: NO_OP, doc: 0 },
  { op: replace(0, 1), doc: 0 },
].map(op => ({...op, opDescr: inspect(op.op)}))

describe('rebase', () => {

  describe('replace op', () => {
    it.each(
      exampleOps.filter(({op}) => op.type !== opTypes.OpError)
    )('onto $opDescr produces the same op with a modified from', ({op: base, doc}) => {
      const op = replace(doc, 2)
      expect(rebaseOnto(base, op)).toStrictEqual(replace(apply(base, doc), 2))
    })
    it('onto error produces another error', () => {
      const op = replace(1, 2)
      expect(rebaseOnto(opError('any error'), op)).toStrictEqual(opError('Operation happens after error'))
    })
  })

  it.each(exampleOps)('NoOp onto $opDescr produces NoOp', ({op: base}) => {
    expect(rebaseOnto(base, NO_OP)).toStrictEqual(NO_OP)
  })

  it.each(exampleOps)('OpError onto $opDescr produces the same OpError', ({op: base}) => {
    const error = opError('err')
    expect(rebaseOnto(base, error)).toStrictEqual(error)
  })

  describe('onto NoOp', () => {
    it.each([
      add(0, [1]),
      remove(0, [1]),
      move(0, 1, 2),
      applyOp({a: replace(1, 2)}),
      listApply([1, replace(1, 2)]),
      stringModification(0, {add: 'Fuu'}),
    ])('does not modify %s', (op) => {
      expect(rebaseOnto(NO_OP, op)).toStrictEqual(op)
    })
  })

  describe('onto StringModifications', () => {
    it.each([
      add(0, [1]),
      remove(0, [1]),
      applyOp({a: replace(1, 2)})
    ])('should return OpError when not rebased upon another string op', (base) => {
      expect(
        rebaseOnto(base, stringModification(0, {add: 'Fuu'}))
      ).toStrictEqual(opError('Type mismatch'))
    })

    it('should rebase replacements to include modified string', () => {
      expect(
        rebaseOnto(stringModification(0, {add: 'Fuu'}), replace('Bar', 'Quz'))
      ).toStrictEqual(replace('FuuBar', 'Quz'))
    })

    it('should crash when rebasing a non string replacement', () => {
      expect(
        () => rebaseOnto(stringModification(0, {add: 'Fuu'}), replace(null, 'Quz'))
      ).toThrow()
    })

    const [ins, del, strMod] = [stringAdd, stringDel, stringModification]
    it.each([
      //result,       op,            base
      //    BASE
      // OP
      [ins(0, 'Fuu'), ins(0, 'Fuu'), ins(0, 'Bar')],
      [del(0, 'Fuu'), del(0, 'Fuu'), ins(5, 'Bar')],
      // BASE
      //      OP
      [del(4, 'Bar'), del(1, 'Bar'), ins(0, 'Foo')],
      [del(3, 'Bar'), del(0, 'Bar'), ins(0, 'Foo')],
      [ins(4, 'Fuu'), ins(1, 'Fuu'), ins(0, 'Bar')],
      [ins(7, 'Fuu'), ins(1, 'Fuu'), ins(0, 'FooBar')],
      [del(0, 'Bar'), del(3, 'Bar'), del(0, 'Foo')],
      // BASE
      // -OP-
      [NO_OP, del(0, 'Bar'), del(0, 'Bar')],
      [ins(0, '???'), strMod(0, {remove: 'Bar', add: '???'}), del(0, 'Bar')],
      // BASE
      // -OP
      [ins(0, '???'), strMod(0, {remove: 'Bar', add: '???'}), del(0, 'Bare')],
      // BASE
      //  OP-
      [ins(0, '???'), strMod(1, {remove: 'are', add: '???'}), del(0, 'Bare')],
      // -BASE-
      //   OP
      [NO_OP, del(1, 'o'), del(0, 'Foo')],
      [ins(0, 'whatever'), strMod(1, {remove: 'o', add: 'whatever'}), del(0, 'Foo')],
      //   -BASE-
      // -OP--
      [del(1, 'o'), del(1, 'oo'), del(2, 'oBar')],
      //   BASE
      // ---OP---
      [del(0, '1 3'), del(0, '1 2 3'), del(1, ' 2')],
      // ----BASE
      //    OP------
      [del(0, 'p'), del(1, 'oop'), del(0, 'Foo')],
    ])('should produce %s when rebasing %s onto %s', (result, op, base) => {
      expect(rebaseOnto(base, op)).toStrictEqual(result)
    })


  })
})
