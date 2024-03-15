export interface Monad<A> extends Generator<A, A, A> {
  map<B>(f: (a: A) => B): Monad<B>
  flatMap<B>(f: (a: A) => Monad<B>): Monad<B>
}
