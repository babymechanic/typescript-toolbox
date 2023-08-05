import { describe, it, expect } from 'vitest';
import { createHandler } from '../../src/discriminated-union/handle';

type SuccessResult = { status: 'success'; message: string; };
type ErrorResult = { status: 'error'; errorMessage: string; };
type WarningResult = { status: 'warning'; warnMessage: string; };
type Result = SuccessResult | ErrorResult | WarningResult;


describe('createHandler', () => {

    const handle = createHandler<'status', Result, Promise<string>>('status', {
        error: async (val) => `Hello ${ val.errorMessage }`,
        success: async (val) => `Hello ${ val.message }`,
        warning: async (val) => `Hello ${ val.warnMessage }`,
    });

    it('handles error', async () => {
        const error: ErrorResult = { status: 'error', errorMessage: 'this is an error' };

        const result = await handle(error);

        expect(result).toBe('Hello this is an error');
    });

    it('handles success', async () => {
        const success: SuccessResult = { status: 'success', message: 'this is a success' };

        const result = await handle(success);

        expect(result).toBe('Hello this is a success');
    });

    it('handles warning', async () => {
        const warning: WarningResult = { status: 'warning', warnMessage: 'this is a warning' };

        const result = await handle(warning);

        expect(result).toBe('Hello this is a warning');
    });
});
