import { inspect } from 'util'

import {
  opTypes,
} from './types'

import { apply } from './apply'
import {
  add,
  applyIndexes,
  applyProps,
  composite,
  listOps,
  listSplice,
  move,
  NO_OP,
  Op,
  opError,
  remove,
  replace,
  stringOps,
} from './ops'
import { rebaseOnto } from './rebase'

import './testUtils'

const exampleListOps = [
  { op: add(0, [1]), doc: [] },
  { op: add(1, [1]), doc: [0] },
  { op: remove(0, [1]), doc: [1] },
  { op: remove(1, [2]), doc: [1, 2] },
  { op: listSplice(1, {add: [4], remove: [2, 3]}), doc: [1, 2, 3] },
  { op: applyIndexes([1, replace(1, 2)]), doc: [0, 1] },
]
const exampleObjectOps = [
  { op: applyProps({a: replace(1, 2)}), doc: {a: 1} },
  { op: applyProps({a: stringOps.splice(1, {remove: 'sdf', add: 'bcd'})}), doc: {a: 'asdf'} },
]
const exampleStringOps = [
  { op: stringOps.insert(0, 'fuu'), doc: '' },
  { op: stringOps.remove(0, 'fuu'), doc: 'fuu' },
  { op: stringOps.splice(0, {remove: 'fuu', add: 'bar'}), doc: 'fuu' },
]

const exampleOps = [
  ...exampleListOps,
  ...exampleObjectOps,
  ...exampleStringOps,
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
      applyProps({a: replace(1, 2)}),
      applyIndexes([1, replace(1, 2)]),
      stringOps.splice(0, {add: 'Fuu'}),
    ])('does not modify %s', (op) => {
      expect(rebaseOnto(NO_OP, op)).toStrictEqual(op)
    })
  })

  describe('onto Composite', () => {
    it('??', () => {
      expect(1).toBe(1)
    })
  })

  describe('Composite onto', () => {
    it('??', () => {
      expect(1).toBe(1)
    })
  })

  describe('onto ApplyProps', () => {
    it.each([
      ...exampleListOps,
      ...exampleStringOps,
    ])('should return OpError when not rebased upon another object op', ({op}) => {
      expect(
        rebaseOnto(Op.applyProps({a: replace(0, 1)}), op)
      ).toStrictEqual(opError('Type mismatch'))
    })

    it('??', () => {
      expect(1).toBe(1)
    })
  })

  describe('onto ApplyIndexes', () => {
    it.each([
      ...exampleObjectOps,
      ...exampleStringOps,
    ])('should return OpError when not rebased upon another list op', ({op}) => {
      expect(
        rebaseOnto(listOps.apply([0, replace(0, 1)], [1, replace(1, 2)]), op)
      ).toStrictEqual(opError('Type mismatch'))
    })

    it.each([
      [applyIndexes([0, replace(1, 2)], [1, replace(1, 2)]), applyIndexes([0, replace(0, 2)], [1, replace(1, 2)]), applyIndexes([0, replace(0, 1)])],
      // TODO: more examples
    ])('should produce %s when rebasing %s onto %s', (result, op, base) => {
      expect(rebaseOnto(base, op)).toStrictEqual(result)
    })
  })

  describe('onto ListSplice', () => {
    it.each([
      ...exampleObjectOps,
      ...exampleStringOps,
    ])('should return OpError when not rebased upon another list op', ({op}) => {
      expect(
        rebaseOnto(listOps.splice(0, {add: [0, 1, 2], remove: [1, 2]}), op)
      ).toStrictEqual(opError('Type mismatch'))
    })

    it('??', () => {
      expect(1).toBe(1)
    })
  })

  describe('onto Move', () => {
    it.each([
      ...exampleObjectOps,
      ...exampleStringOps,
    ])('should return OpError when not rebased upon another list op', ({op}) => {
      expect(
        rebaseOnto(listOps.move(0, 1), op)
      ).toStrictEqual(opError('Type mismatch'))
    })

    it.each([
      //result,       op,            base
      //rebase onto move 'down' (down = later in the lsit)
      [move(0, 1),    move(0, 1),    move(1, 3)],
      [move(0, 1),    move(0, 2),    move(1, 3)],
      [move(0, 3),    move(0, 3),    move(1, 3)],
      [move(0, 4),    move(0, 4),    move(1, 3)],

      [move(3, 0),    move(1, 0),    move(1, 3)],
      [move(3, 1),    move(1, 2),    move(1, 3)],
      [move(3, 3),    move(1, 3),    move(1, 3)],
      [move(3, 4),    move(1, 4),    move(1, 3)],

      [move(1, 0),    move(2, 0),    move(1, 3)],
      [move(1, 1),    move(2, 1),    move(1, 3)],
      [move(1, 3),    move(2, 3),    move(1, 3)],
      [move(1, 4),    move(2, 4),    move(1, 3)],

      [move(2, 0),    move(3, 0),    move(1, 3)],
      [move(2, 1),    move(3, 1),    move(1, 3)],
      [move(2, 1),    move(3, 2),    move(1, 3)],
      [move(2, 4),    move(3, 4),    move(1, 3)],

      [move(4, 0),    move(4, 0),    move(1, 3)],
      [move(4, 1),    move(4, 1),    move(1, 3)],
      [move(4, 1),    move(4, 2),    move(1, 3)],
      [move(4, 3),    move(4, 3),    move(1, 3)],
      //rebase onto move 'up'
      [move(0, 2),    move(0, 1),    move(3, 1)],
      [move(0, 3),    move(0, 2),    move(3, 1)],
      [move(0, 3),    move(0, 3),    move(3, 1)],
      [move(0, 4),    move(0, 4),    move(3, 1)],

      [move(2, 0),    move(1, 0),    move(3, 1)],
      [move(2, 3),    move(1, 2),    move(3, 1)],
      [move(2, 3),    move(1, 3),    move(3, 1)],
      [move(2, 4),    move(1, 4),    move(3, 1)],

      [move(3, 0),    move(2, 0),    move(3, 1)],
      [move(3, 2),    move(2, 1),    move(3, 1)],
      [move(3, 3),    move(2, 3),    move(3, 1)],
      [move(3, 4),    move(2, 4),    move(3, 1)],

      [move(1, 0),    move(3, 0),    move(3, 1)],
      [move(1, 2),    move(3, 1),    move(3, 1)],
      [move(1, 3),    move(3, 2),    move(3, 1)],
      [move(1, 4),    move(3, 4),    move(3, 1)],

      [move(4, 0),    move(4, 0),    move(3, 1)],
      [move(4, 2),    move(4, 1),    move(3, 1)],
      [move(4, 3),    move(4, 2),    move(3, 1)],
      [move(4, 3),    move(4, 3),    move(3, 1)],

      [move(0, 4),    move(0, 3),    move(5, 2)],
      [move(3, 7),    move(2, 7),    move(5, 2)],
      [move(6, 7),    move(6, 7),    move(5, 2)],

      [
        applyIndexes(
          [0, replace(0, 1)],
          [1, replace(33, 1)],
          [2, replace(11, 1)],
          [3, replace(22, 1)],
          [4, replace(44, 1)],
        ),
        applyIndexes(
          [0, replace(0, 1)],
          [1, replace(11, 1)],
          [2, replace(22, 1)],
          [3, replace(33, 1)],
          [4, replace(44, 1)],
        ),
        move(3, 1)
      ],
      [
        applyIndexes(
          [0, replace(0, 1)],
          [1, replace(22, 1)],
          [2, replace(33, 1)],
          [3, replace(11, 1)],
          [4, replace(44, 1)],
        ),
        applyIndexes(
          [0, replace(0, 1)],
          [1, replace(11, 1)],
          [2, replace(22, 1)],
          [3, replace(33, 1)],
          [4, replace(44, 1)],
        ),
        move(1, 3)
      ],
    ])('should produce %s when rebasing %s onto %s', (result, op, base) => {
      expect(rebaseOnto(base, op)).toStrictEqual(result)
    })
  })

  describe('onto StringModifications', () => {
    it.each([
      ...exampleListOps,
      ...exampleObjectOps,
    ])('should return OpError when not rebased upon another string op', ({op: base}) => {
      expect(
        rebaseOnto(base, stringOps.splice(0, {add: 'Fuu'}))
      ).toStrictEqual(opError('Type mismatch'))
    })

    it('should rebase replacements to include modified string', () => {
      expect(
        rebaseOnto(stringOps.splice(0, {add: 'Fuu'}), replace('Bar', 'Quz'))
      ).toStrictEqual(replace('FuuBar', 'Quz'))
    })

    it('should return an error op when rebasing a non string replacement', () => {
      expect(rebaseOnto(stringOps.splice(0, {add: 'Fuu'}), replace(null, 'Quz')))
        .toStrictEqual(Op.error('Value is not a string'))
    })

    const [ins, del, strMod] = [stringOps.insert, stringOps.remove, stringOps.splice]
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
