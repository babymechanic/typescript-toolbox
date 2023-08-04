import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { chain } from './chain';

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

            expect(secondFunc).toHaveBeenCalledWith(firstCallResponse);
            expect(result).toBe(expected);
        });
    });

    describe('with type checking', () => {
        type Output1 = { status: 'output1'; message1: string[] };
        type Output2 = { status: 'output2'; message2: string[] };
        type Output3 = { status: 'output3'; message3: string[] };


        it('should give the last result', async () => {
            const completeChain = chainSeed
                .link(async (): Promise<Escape | Output1> => ({
                    status: 'output1',
                    message1: ['message1']
                }))
                .link(async (input: Output1): Promise<Escape | Output2> => ({
                    status: 'output2',
                    message2: [...input.message1, 'message2']
                }))
                .link(async (input: Output2): Promise<Escape | Output3> => ({
                    status: 'output3',
                    message3: [...input.message2, 'message3']
                }));

            const result = (await completeChain.run()) as Output3;

            expect(result.status).toBe('output3');
            expect(result.message3).toEqual(['message1', 'message2', 'message3']);
        });
    })

});
