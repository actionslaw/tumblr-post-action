import { Monad } from './Monad'

export type Validator<E, T> = (t: T) => Validate<E, T>;

export class ValidationError {
  private readonly message: string

  constructor(message: string) {
    this.message = message;
  }

  toString(): string {
    return `Failed validate: ${this.message}`;
  }
}

export class Validate<E, T> implements Monad<T> {

  private readonly valid: T | undefined;
  private readonly errors: Array<E>;

  constructor(errors: Array<E> = [], valid?: T) {
    this.valid = valid;
    this.errors = errors;
  }

  map<B>(f: (t: T) => B): Validate<E, B> {
    if (this.valid) return new Validate(this.errors, f(this.valid))
    else return new Validate(this.errors)
  }

  flatMap<B>(f: (t: T) => Validate<E, B>): Validate<E, B> {
    if (this.valid) {
      const validate = f(this.valid);
      return validate.withErrors(this.errors)
    } else {
      return new Validate(this.errors);
    }
  }

  next(...args: [] | [T]): IteratorResult<T, T> {

  }

  return(value: T): IteratorResult<T, T> {

  }

  throw(e: any): IteratorResult<T, T> {

  }

  withErrors(errors: Array<E>): Validate<E, T> {
    return new Validate([...this.errors, ...errors])
  }

  static required<T>(name: string): Validator<ValidationError, T | undefined> {
    return (t: T | undefined) => {
      if (t) return new Validate([], t)
      else return new Validate([new ValidationError(`missing value ${name} is required`)])
    }
  }
}
