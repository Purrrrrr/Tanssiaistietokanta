import { add, apply as applyOp, composite, listApply, move, NO_OP, remove, replace, stringModification } from './types'

import { apply } from './apply'

import './testUtils'

describe('apply', () => {
  describe('Composite', () => {
    it.each([
      [
        composite([
          applyOp({b: replace(null, 3)}),
          applyOp({a: replace(1, 2)})
        ]),
        {a: 1}, {a: 2, b: 3}
      ],
      [
        composite([
          replace('foo', 'quz'),
          composite([
            stringModification({index: 0, add: 'boobar'}),
            stringModification({index: 2, remove: 'oba'}),
          ]),
        ]),
        'foo', 'borquz'
      ],
    ])('Except %s to modify %s to %s', (op, doc, result) => {
      expect(apply(op, doc)).toStrictEqual(result)
    })
  })
  describe('Apply', () => {
    it.each([
      [
        applyOp({ a: replace(1, 2) }),
        {a: 1}, {a: 2}
      ],
      [
        applyOp({ a: replace(1, 2), b: stringModification({index: 0, add: 'pre'}) }),
        {a: 1, b: 'asdf'}, {a: 2, b: 'preasdf'}
      ],
    ])('Except %s to modify %s to %s', (op, doc, result) => {
      expect(apply(op, doc)).toStrictEqual(result)
    })
  })
  describe('ListApply', () => {
    it.each([
      [
        listApply([0, replace(0, 1)]), [0], [1]
      ],
      [
        listApply([0, replace(0, 1)], [2, replace(2, 3)]), [0, 1, 2], [1, 1, 3]
      ],
    ])('Except %s to modify %s to %s', (op, doc, result) => {
      expect(apply(op, doc)).toStrictEqual(result)
    })
  })
  describe('NoOp', () => {
    it.each([
      null,
      {},
      [1, 2, 3],
      1,
      false,
      'fuu'
    ])('NoOp should not modify %s', (doc) => {
      expect(
        apply(NO_OP, doc)
      ).toStrictEqual(doc)
    })
  })
  describe('Add', () => {
    it.each([
      [add(0, [1, 2]), [1, 2, 3], [1, 2, 1, 2, 3]],
      [add(3, [4, 5]), [1, 2, 3], [1, 2, 3, 4, 5]],
      [add(1, [1.5]), [1, 2, 3], [1, 1.5, 2, 3]],
    ])('Except %s to modify %s to %s', (op, doc, result) => {
      expect(apply(op, doc)).toStrictEqual(result)
    })

    it.each([
      [add(-1, [0, 1]), [1, 2, 3]],
      [add(4, [0, 1]), [1, 2, 3]],
      [add(5, [0, 1]), [1, 2, 3]],
    ])('Except %s to crash on %s', (op, doc) => {
      expect(() => apply(op, doc)).toThrow()
    })
  })
  describe('Remove', () => {
    it.each([
      [remove(0, [1, 2]), [1, 2, 3], [3]],
      [remove(0, []), [1, 2, 3], [1, 2, 3]],
      [remove(2, [3]), [1, 2, 3], [1, 2]],
    ])('Except %s to modify %s to %s', (op, doc, result) => {
      expect(apply(op, doc)).toStrictEqual(result)
    })

    it.each([
      //Indexes out of bounds
      [remove(2, [3, 4]), [1, 2, 3]],
      [remove(-1, [0, 1]), [1, 2, 3]],
    ])('Except %s to crash on %s', (op, doc) => {
      expect(() => apply(op, doc)).toThrow()
    })

    it.each([
      [remove(1, [3]), [1, 2, 3]],
      [remove(0, [0, 1]), [1, 2, 3]],
    ])('Except %s to crash on %s', (op, doc) => {
      expect(() => apply(op, doc)).toThrow('Document mismatch')
    })
  })
  describe('Move', () => {
    it.each([
      [move(0, 2, 1), [1, 2, 3], [2, 3, 1]],
      [move(0, 1, 2), [1, 2, 3], [3, 1, 2]],
      [move(2, 0, 1), [1, 2, 3], [3, 1, 2]],
      [move(1, 0, 2), [1, 2, 3], [2, 3, 1]],
    ])('Except %s to modify %s to %s', (op, doc, result) => {
      expect(apply(op, doc)).toStrictEqual(result)
    })

    it.each([
      [move(0, 2, 1), [1, 2]],
      [move(0, 1, 2), [1, 2]],
      [move(1, -1, 1), [1, 2, 3]],
      [move(-1, 0, 1), [1, 2, 3]],
    ])('Except %s to crash on %s', (op, doc) => {
      expect(() => apply(op, doc)).toThrow()
    })
  })
  describe('Replace', () => {
    it('should replace value with another', () => {
      expect(
        apply(replace('Bar', 'Fuu'), 'Bar')
      ).toBe('Fuu')
    })

    it('should crash when values to replace do not match', () => {
      expect(
        () => apply(replace('Bar', 'Fuu'), 'Qux')
      ).toThrow('Document mismatch')
    })
  })

  describe('StringModification', () => {
    it.each([
      null,
      {},
      [],
      1,
      false,
    ])('should throw when given a non string: %s', (doc) => {
      expect(
        () => apply(stringModification({index: 0, add: 'Fuu'}), doc)
      ).toThrow()
    })

    it('should insert to front', () => {
      expect(
        apply(stringModification({index: 0, add: 'Fuu'}), 'Bar')
      ).toBe('FuuBar')
    })

    it('should remove', () => {
      expect(
        apply(stringModification({index: 1, remove: 'ar'}), 'Bar')
      ).toBe('B')
    })

    it('should replace', () => {
      expect(
        apply(stringModification({index: 1, remove: 'ar', add: 'arbapapa'}), 'Bar')
      ).toBe('Barbapapa')
    })

    it('should check removed string for correctness', () => {
      expect(
        () => apply(stringModification({index: 1, remove: 'arg', add: 'arbapapa'}), 'Bar')
      ).toThrow('String removal mismatch')
    })
  })
})
