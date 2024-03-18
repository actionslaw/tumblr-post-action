"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = exports.ValidationFailed = void 0;
class ValidationFailed extends Error {
    _errors;
    constructor(errors) {
        super(ValidationFailed.message(errors));
        this._errors = errors;
    }
    get errors() {
        return this._errors;
    }
    static message(errors) {
        const header = 'Validation failed with the following errors:';
        const errorMessages = errors.map(e => `field ${e.field} invalid (${e.code})`);
        return [header].concat(errorMessages).join('\n\t');
    }
    static for(error) {
        return new ValidationFailed([error]);
    }
    static collect(failed) {
        const errors = failed.flatMap(fail => fail._errors);
        return new ValidationFailed(errors);
    }
}
exports.ValidationFailed = ValidationFailed;
class Validate {
    constructor() { }
    static required(field) {
        return (store) => new Promise((resolve, reject) => {
            const valid = store(field);
            if (valid)
                resolve(valid);
            else
                reject(ValidationFailed.for({ field: field, code: 'required' }));
        });
    }
    static checkAll(validations) {
        return Promise.allSettled(validations).then(results => {
            const successful = results
                .map(Validate.fulfilled)
                .filter((item) => !!item);
            const failed = results
                .filter(Validate.failed)
                .filter((item) => !!item);
            const validationFailed = failed.filter((error) => error);
            if (failed.length > 0) {
                const allFailed = ValidationFailed.collect(validationFailed);
                // TODO handle non-validation failures
                throw allFailed;
            }
            return successful;
        });
    }
    static fulfilled(result) {
        if (result.status == 'fulfilled') {
            const success = result;
            return success.value;
        }
    }
    static failed(result) {
        if (result.status == 'rejected') {
            const failure = result;
            return failure.reason;
        }
    }
}
exports.Validate = Validate;
//# sourceMappingURL=validate.js.map