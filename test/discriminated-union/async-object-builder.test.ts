import { describe, expect, it, vi } from 'vitest';
import { createAsyncObjectBuilder } from '../../src/discriminated-union/async-object-builder';
import { InvalidConfigurationError } from '../../src/errors/invalid-configuration-error';

describe("createAsyncObjectBuilder", () => {

    it('should be able to create an object', async () => {
        const config = createAsyncObjectBuilder()
            .with('num', async () => ({ type: 'success', value: 123123 }))
            .with('str', async () => ({ type: 'success', value: 'hello world' }));

        const obj = await config.build()

        expect(obj).toEqual({
            type: 'success',
            value: {
                num: 123123,
                str: 'hello world'
            }
        });
    });

    it('should be able to pass the previously built value to the next builder', async () => {
        const config = createAsyncObjectBuilder()
            .with('num', async () => ({ type: 'success', value: 123123 }))
            .with('str', async ({ num }) => ({ type: 'success', value: num.toString() }));

        const obj = await config.build()

        expect(obj).toEqual({
            type: 'success',
            value: {
                num: 123123,
                str: '123123'
            }
        });
    });

    it('should return error if first function returns a failure', async () => {
        const config = createAsyncObjectBuilder()
            .with('num', async () => ({ type: 'failure', error: 'first error' }))
            .with('str', async () => ({ type: 'success', value: 'this should not be called' }));

        const obj = await config.build()

        expect(obj).toEqual({
            type: 'failure',
            error: 'first error',
            prop: 'num'
        });
    });

    it('should return error if second function returns a failure', async () => {
        const config = createAsyncObjectBuilder()
            .with('num', async () => ({ type: 'success', value: 123123 }))
            .with('str', async () => ({ type: 'failure', error: 'second error' }));

        const obj = await config.build()

        expect(obj).toEqual({
            type: 'failure',
            error: 'second error',
            prop: 'str'
        });
    });

    it('should not call second builder if first one fails', async () => {
        const mock = vi.fn();
        const config = createAsyncObjectBuilder()
            .with('num', async () => ({ type: 'failure', error: 'first error' }))
            .with('str', mock);

        await config.build()

        expect(mock).not.toHaveBeenCalled();
    });

    it('throws error if the same prop is defined twice', async () => {
        expect(() => createAsyncObjectBuilder()
            .with('num', async () => ({ type: 'success', value: 123123 }))
            .with('num', async () => ({ type: 'success', value: 123123 }))
        ).toThrow(new InvalidConfigurationError("'num' prop was defined twice"));
    });
});
