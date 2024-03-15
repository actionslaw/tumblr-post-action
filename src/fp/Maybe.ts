// import { Monad } from './Monad'

// export abstract class Maybe<A> implements Monad<A> {
//   abstract map<B>(f: (a: A) => B): Maybe<B>

//   abstract flatMap<B>(f: (a: A) => Maybe<B>): Maybe<B>

//   static from<A>(value: A | undefined): Maybe<A> {
//     if (value) return new Some(value)
//     else return None;
//   }
// }

// export const None = new class extends Maybe<never> {
//   map<B>(f: (a: never) => B): Maybe<B> {
//     return this;
//   }

//   flatMap<B>(f: (a: never) => Maybe<B>): Maybe<B> {
//     return this;
//   }

//   override toString() {
//     return "None";
//   }
// }

// export class Some<A> extends Maybe<A> {
//   private value: A;

//   constructor(value: A) {
//     super();
//     this.value = value;
//   }

//   map<B>(f: (a: any) => B): Maybe<B> {
//     return new Some(f(this.value));
//   }

//   flatMap<B>(f: (a: A) => Maybe<B>): Maybe<B> {
//     return f(this.value);
//   }

//   override toString() {
//     return `Some(${this.value})`;
//   }
// }
