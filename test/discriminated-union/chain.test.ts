import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { chain } from '../../src/discriminated-union';
import { Equal, Expect } from '../test-utils/type-assertions';

type Escape = { status: 'error'; error: string };
type Continue = { status: 'success'; message: string };
const chainSeed = chain('status', (val): val is Escape => val.status === 'error');

describe('chain', () => {

    describe('with mocks', () => {

        let firstFunc: Mock<[], Promise<Continue | Escape>>;
        let secondFunc: Mock<[Continue], Promise<Continue | Escape>>;

        beforeEach(() => {
            firstFunc = vi.fn();
            secondFunc = vi.fn();
        })

        it('does not call second callable if first returns an error', async () => {
            const expectedError: Escape = { status: 'error', error: 'this is an error' };
            firstFunc.mockResolvedValue(expectedError);

            const result = await chainSeed
                .link(firstFunc)
                .link(secondFunc)
                .run();

            expect(secondFunc).not.toHaveBeenCalled();
            expect(result).toBe(expectedError);
        });


        it('calls second callable if first one returns success', async () => {
            const firstCallResponse: Continue = { status: 'success', message: 'first call success' };
            firstFunc.mockResolvedValue(firstCallResponse);
            const expected: Continue = { status: 'success', message: 'this worked' };
            secondFunc.mockResolvedValue(expected)

            const result = await chainSeed
                .link(firstFunc)
                .link(secondFunc)
                .run();

            expect(secondFunc).toHaveBeenCalledWith(firstCallResponse, [firstCallResponse]);
            expect(result).toBe(expected);
        });
    });

    describe('with type checking', () => {
        type Output1 = { status: 'output1'; message1: string[] };
        type Output2 = { status: 'output2'; message2: string[] };
        type Output3 = { status: 'output3'; message3: string[] };


        it('should give the last result', async () => {
            const func1 = async (): Promise<Escape | Output1> =>
                ({ status: 'output1', message1: ['message1'] });
            const func2 = async (input: Output1): Promise<Escape | Output2> =>
                ({ status: 'output2', message2: [...input.message1, 'message2'] });
            const func3 = async (input: Output2): Promise<Escape | Output3> =>
                ({ status: 'output3', message3: [...input.message2, 'message3'] });

            const result = (await chainSeed
                .link(func1)
                .link(func2)
                .link(func3)
                .run()) as Output3;

            expect(result.status).toBe('output3');
            expect(result.message3).toEqual(['message1', 'message2', 'message3']);
        });

        it('should allow access to all the previous results in the chain', async () => {
            const allPreviousOutputs: unknown[][] = [];
            const func1 = async (): Promise<Escape | Output1> => ({ status: 'output1', message1: ['message1'] });
            const func2 = async (input: Output1, previousOutputs: [Output1]): Promise<Escape | Output2> => {
                allPreviousOutputs.push(previousOutputs)
                return ({ status: 'output2', message2: [...input.message1, 'message2'] });
            };
            const func3 = async (input: Output2, previousOutputs: [Output1, Output2]): Promise<Escape | Output3> => {
                allPreviousOutputs.push(previousOutputs);
                return ({ status: 'output3', message3: [...input.message2, 'message3'] });
            };

            await chainSeed
                .link(func1)
                .link(func2)
                .link(func3)
                .run();

            expect(allPreviousOutputs).toHaveLength(2);
            expect(allPreviousOutputs[0]).toEqual([{
                status: 'output1',
                message1: ['message1']
            }]);
            expect(allPreviousOutputs[1]).toEqual([
                {
                    status: 'output1',
                    message1: ['message1']
                },
                {
                    status: 'output2',
                    message2: ['message1', 'message2']
                }
            ]);
        });

        it('should have the correct typing', async () => {
            const completeChain = chainSeed
                .link(async (): Promise<Escape | Output1> => ({ status: 'output1', message1: [] }))
                .link(async (input, previousOutputs): Promise<Escape | Output2> => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    type Cases = [
                        Expect<Equal<typeof input, Output1>>,
                        Expect<Equal<typeof previousOutputs, [Output1]>>
                    ];
                    return ({ status: 'output2', message2: [] });
                })
                .link(async (input, previousOutputs): Promise<Escape | Output3> => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    type Cases = [
                        Expect<Equal<typeof input, Output2>>,
                        Expect<Equal<typeof previousOutputs, [Output1, Output2]>>
                    ];
                    return ({ status: 'output3', message3: [] });
                });

            const result = await completeChain.run();

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type Cases = [Expect<Equal<typeof result, Output3 | Escape>>]
        });
    })

});
