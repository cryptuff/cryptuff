export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> }[Keys];

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>> }[Keys];

export type LiteralUnion<T extends U, U = string> = T | (U & {});

/**
 * Extracts the type `T` given a `Promise<T>` or a function that returns `Promise<T>`
 */
export type Unpacked<T> = T extends Promise<infer U>
  ? U
  : T extends (...args: any[]) => Promise<infer U>
  ? U
  : T;
