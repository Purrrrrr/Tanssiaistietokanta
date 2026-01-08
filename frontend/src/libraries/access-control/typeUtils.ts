export type JoinedList<R extends [...string[]], D extends string, DepthLimit extends number = 3> = Join<Permutations<Powerset<R, DepthLimit>>, D>

type Powerset<T extends [...unknown[]], DepthLimit extends number, Acc extends [...unknown[]] = []> =
  Acc['length'] extends DepthLimit
    ? Acc
    : T extends [infer F, ...infer R]
      ? [F, ...Acc] | Powerset<R, DepthLimit, [F, ...Acc]> | Powerset<R, DepthLimit, Acc>
      : never
      // ? [F] | [F, ...Powerset<R>] | Powerset<R>

type Permutations<T extends [...unknown[]], Acc extends unknown[] = []> = T extends [infer F, ...infer R]
  ? Permutations<R, InsertSomewhere<F, Acc>>
  : Acc

type InsertSomewhere<T, U extends unknown[]> = U extends [infer F, ...infer R]
  ? [T, ...U] | [F, ...InsertSomewhere<T, R>]
  : [T]

type Join<T extends string[], Sep extends string> = T extends [infer F extends string, ...infer R extends string[]]
  ? R['length'] extends 0
    ? F
    : `${F}${Sep}${Join<R, Sep>}`
  : never

export type UnionToTuple<T, R extends unknown[] = []>
  = [T] extends [never] ? R
  : (T extends T ? Set<Promise<T>> : never) extends { has: (_: infer L) => boolean }
    ? UnionToTuple<Exclude<T, Awaited<L>>, [...R, Awaited<L>]>
    : never
