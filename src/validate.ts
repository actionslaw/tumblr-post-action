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

export type Store = (field: string) => Promise<string | undefined>

export function required(field: string): (_: Store) => Promise<string> {
  return async (store: Store): Promise<string> => {
    const valid = await store(field)
    if (valid) return valid
    else return Promise.reject(new InvalidField(field, 'missing'))
  }
}

export async function checkAll<A>(validations: Promise<A>[]): Promise<A[]> {
  const results = await Promise.allSettled(validations)
  const successful = results.map(fulfilled).filter((item): item is A => !!item)

  const failed = results.map(rejected).filter(item => !!item)

  const validationFailed = failed
    .filter(e => e instanceof InvalidField)
    .filter((e): e is InvalidField => !!e)

  if (failed.length > 0) throw new ValidationsFailed(validationFailed)

  // TODO handle non-validation errors

  return successful
}

function fulfilled<A>(result: PromiseSettledResult<Awaited<A>>): A | undefined {
  if (result.status === 'fulfilled') {
    return result.value
  }
}

function rejected<A, E>(
  result: PromiseSettledResult<Awaited<A>>
): E | undefined {
  if (result.status === 'rejected') {
    return result.reason as E | undefined
  }
}
