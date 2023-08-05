import { describe, it, expect } from 'vitest';
import { createHandler } from '../../src/discriminated-union/handle';

type SuccessResult = { status: 'success'; message: string; };
type ErrorResult = { status: 'error'; errorMessage: string; };
type WarningResult = { status: 'warning'; warnMessage: string; };
type Result = SuccessResult | ErrorResult | WarningResult;


describe('createHandler', () => {

    const handle = createHandler<'status', Result, string>('status', {
        error: (val) => `Hello ${ val.errorMessage }`,
        success: (val) => `Hello ${ val.message }`,
        warning: (val) => `Hello ${ val.warnMessage }`,
    });

    it('handles error', () => {
        const error: ErrorResult = { status: 'error', errorMessage: 'this is an error' };

        const result = handle(error);

        expect(result).toBe('Hello this is an error');
    });

    it('handles success', () => {
        const success: SuccessResult = { status: 'success', message: 'this is a success' };

        const result = handle(success);

        expect(result).toBe('Hello this is a success');
    });

    it('handles warning', () => {
        const warning: WarningResult = { status: 'warning', warnMessage: 'this is a warning' };

        const result = handle(warning);

        expect(result).toBe('Hello this is a warning');
    });
});
