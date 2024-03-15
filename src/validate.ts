import { Effect } from 'effect'

export type Validator<T> = (t: T) => T | undefined
export type Store<T> = (_: string) => T
export type ValidateT<T> = Effect.Effect<T, [NonNullable<string>]>

export class Validate {
  static required<T>(key: string): (store: Store<T>) => Effect.Effect<T, string> {
    return (store: (key: string) => T | undefined) => {
      const value = store(key)
      if (value) return Effect.validate(Effect.succeed(value))
      else return Effect.validate(Effect.fail(`Required value for ${key} not found`))
    }
  }
}
