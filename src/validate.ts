export class InvalidField extends Error {
  readonly field: string
  readonly code: string

  constructor(field: string, code: string) {
    super(`Field ${field} invalid (${code})`)
    this.field = field
    this.code = code
  }
}

export class ValidationsFailed extends Error {
  readonly errors: InvalidField[]

  constructor(errors: InvalidField[]) {
    const header = 'Validation failed with the following errors:'
    const message = [header].concat(errors.map(e => e.message)).join('\n\t')
    super(message)
    this.errors = errors
  }
}

type Store = (field: string) => Promise<string | undefined>

export class Validate {
  private constructor() { }

  static required(field: string): (_: Store) => Promise<string> {
    return (store: Store) =>
      new Promise(async (resolve, reject) => {
        const valid = await store(field)
        if (valid) resolve(valid)
        else reject(new InvalidField(field, 'missing'))
      })
  }

  static async checkAll<A>(validations: Promise<A>[]): Promise<A[]> {
    return Promise.allSettled(validations).then(results => {
      const successful = results
        .map(fulfilled)
        .filter((item): item is A => !!item)

      const failed = results
        .map(rejected)
        .filter((item): item is any => !!item)

      const validationFailed = failed
        .filter(e => e instanceof InvalidField)
        .filter((e): e is InvalidField => e)

      if (failed.length > 0) throw new ValidationsFailed(validationFailed)

      // TODO handle non-validation errors

      return successful
    })
  }
}

function fulfilled<A>(
  result: PromiseSettledResult<Awaited<A>>
): A | undefined {
  if (result.status == 'fulfilled') {
    const success = result as PromiseFulfilledResult<Awaited<A>>
    return success.value
  }
}

function rejected<A>(
  result: PromiseSettledResult<Awaited<A>>
): any | undefined {
  if (result.status == 'rejected') {
    const failure = result as PromiseRejectedResult
    return failure.reason
  }
}
