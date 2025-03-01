export type ValueAt<Data, Path extends string> = Path extends ''
  ? Data
  : Path extends `${infer Key}.${infer Rest}`
    ? ValueAt<Idx<Data, Key>, Rest>
    : Idx<Data, Path>


export type Idx<T, K extends string> =
  null extends T
  ? Idx<Exclude<T, null>, K> | null
  : undefined extends T
    ? Idx<Exclude<T, undefined>, K> | undefined
    : K extends keyof T
      ? T[K]
      : K extends `${number}` ? number extends keyof T ? T[number] : never : never;
