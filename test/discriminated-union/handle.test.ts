import { describe, it, expect } from 'vitest';
import { createHandler } from '../../src/discriminated-union/handle';
import { Equal, Expect } from '../test-utils/type-assertions';

type SuccessResult = { status: 'success'; message: string; };
type ErrorResult = { status: 'error'; errorMessage: string; };
type WarningResult = { status: 'warning'; warnMessage: string; };
type Result = SuccessResult | ErrorResult | WarningResult;


describe('createHandler', () => {

    const handle = createHandler<'status', Result, string>('status', {
        error: (val) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type Cases = [Expect<Equal<typeof val, ErrorResult>>];
            return `The error is: ${ val.errorMessage }`;
        },
        success: (val) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type Cases = [Expect<Equal<typeof val, SuccessResult>>];
            return `The success message is: ${ val.message }`;
        },
        warning: (val) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type Cases = [Expect<Equal<typeof val, WarningResult>>];
            return `The warning is: ${ val.warnMessage }`;
        },
    });

    it('handles error', () => {
        const error: ErrorResult = { status: 'error', errorMessage: 'test' };

        const result = handle(error);

        expect(result).toBe('The error is: test');
    });

    it('handles success', () => {
        const success: SuccessResult = { status: 'success', message: 'test' };

        const result = handle(success);

        expect(result).toBe('The success message is: test');
    });

    it('handles warning', () => {
        const warning: WarningResult = { status: 'warning', warnMessage: 'test' };

        const result = handle(warning);

        expect(result).toBe('The warning is: test');
    });
});
