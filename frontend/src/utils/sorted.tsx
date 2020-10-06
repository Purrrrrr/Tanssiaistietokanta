export function sorted<Item>(
  items : Item[],
  comparator: (a: Item, b: Item) => number
) {
  return [...items].sort(comparator);
}
