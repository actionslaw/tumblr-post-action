import { Runtime } from './runtime'

export interface State {
  readonly ins: { [key: string]: string }
}

type Runner = (_: Runtime) => Promise<void>

export class StateRuntime<S extends State> implements Runtime {
  private readonly initialState: S

  private constructor(initialState: S) {
    this.initialState = initialState
  }

  inputs = (key: string) => StatePromise.resolve(this.initialState.ins[key])

  static update<S extends State>(change: (_: S) => S) {
    return new StatePromise(Promise.resolve(), change)
  }

  static start<S extends State>(state: S): (_: Runner) => Promise<(_: S) => S> {
    return async (runner: Runner) => {
      const run = runner(new StateRuntime<S>(state))
      if (run instanceof StatePromise) {
        await run.promise
        return run.state
      } else {
        throw new Error('invalid runtime')
      }
    }
  }
}

class StatePromise<S extends State, T> implements Promise<T> {
  readonly promise: Promise<T>
  readonly state: (_: S) => S

  constructor(promise: Promise<T>, state: (_: S) => S) {
    this.promise = promise;
    this.state = state
  }

  get [Symbol.toStringTag]() {
    return this.promise[Symbol.toStringTag]
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | null | undefined): Promise<T | TResult> {
    return new StatePromise(this.promise.catch(onrejected), this.state)
  }

  finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    return new StatePromise(this.promise.finally(onfinally), this.state)
  }

  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
    // if (onfulfilled) {
    //   const onStateFulfilled: ((value: T) => TResult1 | Promise<TResult1>) | null | undefined = (value: T) => {
    //     const fulfilled = onfulfilled(value)
    //     if (fulfilled instanceof StatePromise) {
    //       return new StatePromise(fulfilled.promise, (s) => this.state(fulfilled.state(s)))
    //     } else if (fulfilled instanceof Promise) {
    //       return fulfilled
    //     }
    //     return fulfilled
    //   }

    //   return this.promise.then(onStateFulfilled, onrejected)
    // }
    return new StatePromise(this.promise.then(onfulfilled, onrejected), this.state)
  }

  static resolve<A, S extends State>(a: A): StatePromise<S, A> {
    return new StatePromise<S, A>(Promise.resolve(a), identity)
  }
}

function identity<A>(a: A) {
  return a
}
