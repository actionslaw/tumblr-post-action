interface Monad<A> {
  map<B>(f: (a: A) => B): Monad<B>
  flatMap<B>(f: (a: A) => Monad<B>): Monad<B>
}

export abstract class Maybe<A> implements Monad<A> {
  abstract map<B>(f: (a: A) => B): Maybe<B>

  abstract flatMap<B>(f: (a: A) => Maybe<B>): Maybe<B>

  static from<A>(value: A | undefined): Maybe<A> {
    if (value) return new Some(value)
    else return None;
  }
}

export const None = new class extends Maybe<never> {
  map<B>(f: (a: never) => B): Maybe<B> {
    return this;
  }

  flatMap<B>(f: (a: never) => Maybe<B>): Maybe<B> {
    return this;
  }

  override toString() {
    return "None";
  }
}

export class Some<A> extends Maybe<A> {
  private value: A;

  constructor(value: A) {
    super();
    this.value = value;
  }

  map<B>(f: (a: any) => B): Maybe<B> {
    return new Some(f(this.value));
  }

  flatMap<B>(f: (a: A) => Maybe<B>): Maybe<B> {
    return f(this.value);
  }

  override toString() {
    return `Some(${this.value})`;
  }
}

type Validator<E, T> = (t: T) => undefined | E;

export abstract class Validate<E, T> implements Monad<T> {

  abstract map<B>(f: (t: T) => B): Validate<E, B>
  abstract flatMap<B>(f: (t: T) => Validate<E, B>): Validate<E, B>

  static from<E, T>(validator: Validator<E, T>): (t: T) => Validate<E, T> {
    return (t: T) => {
      const error = validator(t)
      if (!error) return new Valid(t)
      else return new Invalid([error])
    }
  }

}

export class Valid<E, T> extends Validate<E, T> {

  private valid: T;

  constructor(valid: T) {
    super();
    this.valid = valid;
  }

  map<B>(f: (t: T) => B): Validate<E, B> {
    return new Valid(f(this.valid));
  }

  flatMap<B>(f: (t: T) => Validate<E, B>): Validate<E, B> {
    return f(this.valid);
  }

}

export class Invalid<E, T> extends Validate<E, T> {

  private errors: Array<E>;

  constructor(errors: Array<E>) {
    super();
    this.errors = errors;
  }

  map<B>(f: (t: T) => B): Validate<E, B> {
    return new Invalid<E, B>(this.errors);
  }

  flatMap<B>(f: (t: T) => Validate<E, B>): Validate<E, B> {
    return new Invalid<E, B>(this.errors);
  }

}
