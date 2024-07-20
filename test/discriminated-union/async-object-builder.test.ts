import { describe, expect, it, vi } from 'vitest';
import { asyncObjectBuilder } from '../../src/discriminated-union/async-object-builder';
import { InvalidConfigurationError } from '../../src/errors/invalid-configuration-error';
import { ExtractByProp } from '../../src/type-manipulation';
import { Equal, Expect } from '../test-utils/type-assertions';


describe("createAsyncObjectBuilder", () => {

    describe("on success", () => {

        it('should be able to create an object', async () => {
            const config = asyncObjectBuilder()
                .with('num', { builder: async () => ({ type: 'success', value: 123123 }) })
                .with('str', { builder: async () => ({ type: 'success', value: 'hello world' }) });

            const obj = await config.build(undefined)

            if (obj.type === "success") {
                obj.value.str
            }

            expect(obj).toEqual({
                type: 'success',
                value: {
                    num: 123123,
                    str: 'hello world'
                },
                dispose: expect.any(Function)
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type AssertTypesAreCorrect = Expect<Equal<ExtractByProp<'type', 'success', typeof obj>['value'], {
                num: number,
                str: string
            }>>
        });

        it('should be able to pass the previously built value to the next builder', async () => {
            const config = asyncObjectBuilder()
                .with('num', { builder: async () => ({ type: 'success', value: 123123 }) })
                .with('str', { builder: async ({ num }) => ({ type: 'success', value: num.toString() }) });

            const obj = await config.build(undefined)

            expect(obj).toEqual({
                type: 'success',
                value: {
                    num: 123123,
                    str: '123123'
                },
                dispose: expect.any(Function)
            });
        });

        it('calls all the dispose methods on the built object', async () => {
            const dispose1 = vi.fn();
            const dispose2 = vi.fn();
            const result = await asyncObjectBuilder()
                .with('num', {
                    builder: async () => ({ type: 'success', value: 123123 }),
                    dispose: dispose1
                })
                .with('str', {
                    builder: async () => ({ type: 'success', value: 'hello world' }),
                    dispose: dispose2
                }).build(undefined);
            const successResult = result as ExtractByProp<'type', 'success', typeof result>;

            successResult.dispose();

            expect(dispose1).toHaveBeenCalledWith(123123);
            expect(dispose2).toHaveBeenCalledWith('hello world');
        });

        it('allows passing a seed value on build', async () => {
            const config = asyncObjectBuilder<'seed'>()
                .with('prop1', { builder: async (_, seed) => ({ type: 'success', value: seed }) })
                .with('prop2', { builder: async (_, seed) => ({ type: 'success', value: seed }) });

            const obj = await config.build('seed')

            expect(obj).toEqual({
                type: 'success',
                value: {
                    prop1: 'seed',
                    prop2: 'seed',
                },
                dispose: expect.any(Function)
            })
        });

    });

    describe("on failure", () => {

        it('should return error if first function returns a failure', async () => {
            const config = asyncObjectBuilder()
                .with('num', { builder: async () => ({ type: 'failure', details: 'first error' }) })
                .with('str', { builder: async () => ({ type: 'success', value: 'this should not be called' }) });

            const obj = await config.build(undefined)

            expect(obj).toEqual({
                type: 'failure',
                details: 'first error',
                prop: 'num'
            });
        });

        it('should return error if second function returns a failure', async () => {
            const config = asyncObjectBuilder()
                .with('num', { builder: async () => ({ type: 'success', value: 123123 }) })
                .with('str', { builder: async () => ({ type: 'failure', details: 'second error' }) });

            const obj = await config.build(undefined)

            expect(obj).toEqual({
                type: 'failure',
                details: 'second error',
                prop: 'str'
            });
        });

        it('should not call second builder if first one fails', async () => {
            const mock = vi.fn();
            const config = asyncObjectBuilder()
                .with('num', { builder: async () => ({ type: 'failure', details: 'first error' }) })
                .with('str', { builder: mock });

            await config.build(undefined)

            expect(mock).not.toHaveBeenCalled();
        });

        it('throws error if the same prop is defined twice', async () => {
            expect(() => asyncObjectBuilder()
                .with('num', { builder: async () => ({ type: 'success', value: 123123 }) })
                .with('num', { builder: async () => ({ type: 'success', value: 123123 }) })
            ).toThrow(new InvalidConfigurationError("'num' prop was defined twice"));
        });

        it('should not let any errors bubble on dispose', async () => {
            const firstError = new Error("first dispose error");
            const secondError = new Error("second dispose error");
            const result = await asyncObjectBuilder()
                .with('num', {
                    builder: async () => ({ type: 'success', value: 123123 }),
                    dispose: vi.fn().mockImplementation(() => {
                        throw firstError;
                    })
                })
                .with('str', {
                    builder: async () => ({ type: 'success', value: 'hello world' }),
                    dispose: vi.fn().mockImplementation(() => {
                        throw secondError;
                    })
                }).build(undefined);
            const successResult = result as ExtractByProp<'type', 'success', typeof result>;

            const disposed = successResult.dispose();

            expect(disposed).toEqual([secondError, firstError]);
        });

        it('should dispose what ever was built if there is a failure', async () => {
            const secondError = new Error("second error");
            const firstDispose = vi.fn();
            const config = asyncObjectBuilder()
                .with('num', {
                    builder: async () => ({ type: 'success', value: 123123 }),
                    dispose: firstDispose
                })
                .with('str', {
                    builder: () => Promise.reject(secondError),
                });

            const result = await config.build(undefined);

            expect(result).toEqual({
                type: 'failure',
                details: secondError,
                prop: 'str'
            });
            expect(firstDispose).toHaveBeenCalledWith(123123);
        });

        it('should dispose what ever was built if one of the builders returns an error', async () => {
            const firstDispose = vi.fn();
            const config = asyncObjectBuilder()
                .with('num', {
                    builder: async () => ({ type: 'success', value: 123123 }),
                    dispose: firstDispose
                })
                .with('str', {
                    builder: async () => ({ type: 'failure', details: 'could not build' }),
                });

            const result = await config.build(undefined);

            expect(result).toEqual({
                type: 'failure',
                details: 'could not build',
                prop: 'str'
            });
            expect(firstDispose).toHaveBeenCalledWith(123123);
        });

    });

});
