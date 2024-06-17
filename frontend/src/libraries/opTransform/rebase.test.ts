import { add, apply as applyOp, composite, listApply, move, NO_OP, NoOp, remove, replace, stringAdd, stringDel, StringModification, stringModification } from './types'

import { rebaseOnto } from './rebase'

import './testUtils'

describe.only('rebase', () => {

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
    ])('should return NoOp when not rebased upon another string op', (base) => {
      expect(
        rebaseOnto(base, stringModification(0, {add: 'Fuu'}))
      ).toBe(NO_OP)
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
    it.only.each([
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
      [NO_OP, strMod(1, {remove: 'are', add: '???'}), del(0, 'Bare')],
      // -BASE-
      //   OP
      [NO_OP, del(1, 'o'), del(0, 'Foo')],
      [NO_OP, strMod(1, {remove: 'o', add: 'whatever'}), del(0, 'Foo')],
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
